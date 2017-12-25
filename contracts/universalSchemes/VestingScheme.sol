pragma solidity ^0.4.18;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A schme for vesting.
 * @dev Can be used without organization just as a vesting component.
 */

contract VestingScheme is UniversalScheme, ExecutableInterface {
    using SafeMath for uint;

    event LogRegisterOrg(address indexed _avatar);
    event LogAgreementProposal(address indexed _avatar, bytes32 _proposalId);
    event LogExecutaion(address indexed _avatar, bytes32 _proposalId, int _result);
    event NewVestedAgreement(uint indexed _agreementId);
    event SignToCancelAgreement(uint indexed _agreementId, address indexed _signer);
    event RevokeSignToCancelAgreement(uint indexed _agreementId, address indexed _signer);
    event LogAgreementCancel(uint indexed _agreementId);
    event LogCollect(uint indexed _agreementId);


    // The data for each vesterd agreement:
    struct Agreement {
        StandardToken token;
        address beneficiary;
        address returnOnCancelAddress;
        uint startingBlock;
        uint amountPerPeriod;
        uint periodLength;
        uint numOfAgreedPeriods;
        uint cliffInPeriods;
        uint signaturesReqToCancel;
        uint collectedPeriods;
        uint signaturesReceivedCounter;
        mapping(address=>bool) signers;
        mapping(address=>bool) signaturesReceived;
    }

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    struct Parameters {
        bytes32 voteParams;
        IntVoteInterface intVote;
    }

    // A mapping from thr organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>Agreement)) public organizationsData;

    mapping(bytes32=>Parameters) public parameters;

    mapping(uint=>Agreement) public agreements;

    uint agreementsCounter;

    // Modifier, only the signers on an agreement:
    modifier onlySigner(uint _agreementId) {
        require(agreements[_agreementId].signers[msg.sender]);
        _;
    }

    // Modifier, only the beneficiary on an agreement:
    modifier onlyBeneficiary(uint _agreementId) {
        require(agreements[_agreementId].beneficiary == msg.sender);
        _;
    }

    /**
    * @dev the constructor takes a token address, fee and beneficiary
    */
    function VestingScheme(StandardToken _nativeToken, uint _fee, address _beneficiary) public {
        updateParameters(_nativeToken, _fee, _beneficiary, bytes32(0));
    }

    /**
    * @dev Constant function, hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public returns(bytes32)
    {
        bytes32 paramsHash = getParametersHash(_voteParams, _intVote);
        parameters[paramsHash].voteParams = _voteParams;
        parameters[paramsHash].intVote = _intVote;
        return paramsHash;
    }

    /**
    * @dev Constant function, return a hash of the given parameters
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        bytes32 paramsHash = (keccak256(_voteParams, _intVote));
        return paramsHash;
    }

    /**
    * @dev Proposing a vesting agreement in an organization.
    * @param _beneficiary the beneficiary of the agreement.
    * @param _returnOnCancelAddress where to send the tokens in case of stoping.
    * @param _startingBlock the block from which the agreement starts.
    * @param _amountPerPeriod amount of tokens per period.
    * @param _periodLength period length in blocks.
    * @param _numOfAgreedPeriods how many periods agreed on.
    * @param _cliffInPeriods the length of the cliff in periods.
    * @param _signaturesReqToCancel number of signatures required to cancel agreement.
    * @param _signersArray avatar array of adresses that can sign to cancel agreement.
    * @param _avatar avatar of the organization.
    */
    function proposeVestingAgreement(
        address _beneficiary,
        address _returnOnCancelAddress,
        uint _startingBlock,
        uint _amountPerPeriod,
        uint _periodLength,
        uint _numOfAgreedPeriods,
        uint _cliffInPeriods,
        uint _signaturesReqToCancel,
        address[] _signersArray,
        Avatar _avatar
    )
    external
    onlyRegisteredOrganization(_avatar)
    returns(bytes32)
    {
        // Open voting:
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        bytes32 proposalId = params.intVote.propose(2, params.voteParams, _avatar, ExecutableInterface(this));
        assert(_signaturesReqToCancel >= _signersArray.length);
        assert(_periodLength > 0);
        // Write the signers mapping:
        for (uint cnt = 0; cnt<_signersArray.length; cnt++) {
            organizationsData[_avatar][proposalId].signers[_signersArray[cnt]] = true;
        }
        // Write parameters:
        organizationsData[_avatar][proposalId].token = Avatar(_avatar).nativeToken();
        organizationsData[_avatar][proposalId].beneficiary = _beneficiary;
        organizationsData[_avatar][proposalId].returnOnCancelAddress = _returnOnCancelAddress;
        organizationsData[_avatar][proposalId].startingBlock = _startingBlock;
        organizationsData[_avatar][proposalId].amountPerPeriod = _amountPerPeriod;
        organizationsData[_avatar][proposalId].periodLength = _periodLength;
        organizationsData[_avatar][proposalId].numOfAgreedPeriods = _numOfAgreedPeriods;
        organizationsData[_avatar][proposalId].cliffInPeriods = _cliffInPeriods;
        organizationsData[_avatar][proposalId].signaturesReqToCancel = _signaturesReqToCancel;

        params.intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.

        // Log:
        LogAgreementProposal(_avatar, proposalId);
        return proposalId;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 0 is no and 1 is yes.
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) external returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);

        // Log execition:
        LogExecutaion(_avatar, _proposalId, _param);

        Agreement memory proposedAgreement = organizationsData[_avatar][_proposalId];
        delete organizationsData[_avatar][_proposalId];

        // Check if vote was successful:
        if (_param == 1) {
        // Define controller and mint tokens, check minting actually took place:
            Controller controller = Controller(Avatar(_avatar).owner());
            uint tokensToMint = proposedAgreement.amountPerPeriod.mul(proposedAgreement.numOfAgreedPeriods);
            controller.mintTokens(tokensToMint, this);
            agreements[agreementsCounter] = proposedAgreement;
            agreementsCounter++;
        // Log the new agreement:
            NewVestedAgreement(agreementsCounter-1);
       }
        return true;
    }

    /**
    * @dev Creating a vesting agreement.
    * @param _token the relevant token in the agreement.
    * @param _beneficiary the beneficiary of the agreement.
    * @param _returnOnCancelAddress where to send the tokens in case of stoping.
    * @param _startingBlock the block from which the agreement starts.
    * @param _amountPerPeriod amount of tokens per period.
    * @param _periodLength period length in blocks.
    * @param _numOfAgreedPeriods how many periods agreed on.
    * @param _cliffInPeriods the length of the cliff in periods.
    * @param _signaturesReqToCancel number of signatures required to cancel agreement.
    * @param _signersArray avatar array of adresses that can sign to cancel agreement.
    */
    function createVestedAgreement(
        StandardToken _token,
        address _beneficiary,
        address _returnOnCancelAddress,
        uint _startingBlock,
        uint _amountPerPeriod,
        uint _periodLength,
        uint _numOfAgreedPeriods,
        uint _cliffInPeriods,
        uint _signaturesReqToCancel,
        address[] _signersArray
    )
        external
        returns(uint)
    {
        assert(_signaturesReqToCancel >= _signersArray.length);
        assert(_periodLength > 0);
        // Collect funds:
        uint totalAmount = _amountPerPeriod.mul(_numOfAgreedPeriods);
        _token.transferFrom(msg.sender, this, totalAmount);

        // Write parameters:
        agreements[agreementsCounter].token = _token;
        agreements[agreementsCounter].beneficiary = _beneficiary;
        agreements[agreementsCounter].returnOnCancelAddress = _returnOnCancelAddress;
        agreements[agreementsCounter].startingBlock = _startingBlock;
        agreements[agreementsCounter].amountPerPeriod = _amountPerPeriod;
        agreements[agreementsCounter].periodLength = _periodLength;
        agreements[agreementsCounter].numOfAgreedPeriods = _numOfAgreedPeriods;
        agreements[agreementsCounter].cliffInPeriods = _cliffInPeriods;
        agreements[agreementsCounter].signaturesReqToCancel = _signaturesReqToCancel;

        // Write the signers mapping:
        for (uint cnt = 0; cnt<_signersArray.length; cnt++) {
            agreements[agreementsCounter].signers[_signersArray[cnt]] = true;
        }

        // Increment the agreements counter:
        agreementsCounter++;

        // Log new agreement and return id:
        NewVestedAgreement(agreementsCounter-1);
        return(agreementsCounter-1);
    }

    /**
    * @dev Function to sign to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function signToCancelAgreement(uint _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check attempt to double sign:
        require(! agreement.signaturesReceived[msg.sender]);

        // Sign:
        agreement.signaturesReceived[msg.sender] = true;
        agreement.signaturesReceivedCounter++;

        SignToCancelAgreement(_agreementId,msg.sender);

        // Check if threshhold crossed:
        if (agreement.signaturesReceivedCounter == agreement.signaturesReqToCancel) {
            cancelAgreement(_agreementId);
        }
    }

    /**
    * @dev Function to revoke vote for canceling agreement.
    * @param _agreementId the relevant agreement.
    */
    function revokeSignToCancelAgreement(uint _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check signer did sign:
        require(agreement.signaturesReceived[msg.sender]);

        // Revoke signature:
        agreement.signaturesReceived[msg.sender] = false;
        agreement.signaturesReceivedCounter--;

        RevokeSignToCancelAgreement(_agreementId,msg.sender);
    }

    /**
    * @dev Function for a beneficiary to collect.
    * @param _agreementId the relevant agreement.
    */
    function collect(uint _agreementId) public onlyBeneficiary(_agreementId) {
        Agreement memory agreement = agreements[_agreementId];
        uint periodsFromStartingBlock = (block.number.sub(agreement.startingBlock)).div(agreement.periodLength);
        assert(periodsFromStartingBlock >= agreement.cliffInPeriods);

        // Compute periods to pay:
        uint periodsToPay;
        if (periodsFromStartingBlock >= agreement.numOfAgreedPeriods) {
            periodsToPay = agreement.numOfAgreedPeriods.sub(agreement.collectedPeriods);
        } else {
            periodsToPay = periodsFromStartingBlock.sub(agreement.collectedPeriods);
        }
        // Update periods paid:
        agreements[_agreementId].collectedPeriods = agreements[_agreementId].collectedPeriods.add(periodsToPay);

        // Transfer:
        uint tokensToTransfer = periodsToPay.mul(agreement.amountPerPeriod);
        agreement.token.transfer(agreement.beneficiary, tokensToTransfer);

        // Log collecing:
        LogCollect(_agreementId);
    }

    /**
    * @dev Internal function, to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function cancelAgreement(uint _agreementId) internal {
        Agreement memory agreement = agreements[_agreementId];
        delete  agreements[_agreementId];
        uint periodsLeft = agreement.numOfAgreedPeriods.sub(agreement.collectedPeriods);
        uint tokensLeft = periodsLeft.mul(agreement.amountPerPeriod);
        agreement.token.transfer(agreement.returnOnCancelAddress, tokensLeft);
        // Log canceling agreement:
        LogAgreementCancel(_agreementId);
    }
}
