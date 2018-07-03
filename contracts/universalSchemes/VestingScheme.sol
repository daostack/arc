pragma solidity ^0.4.24;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";


/**
 * @title A scheme for vesting.
 * @dev Can be used without organization just as a vesting component.
 */

contract VestingScheme is UniversalScheme, ExecutableInterface {
    using SafeMath for uint;

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId,int _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);
    event AgreementProposal(address indexed _avatar, bytes32 indexed _proposalId);
    event NewVestedAgreement(uint indexed _agreementId);
    event ProposedVestedAgreement(uint indexed _agreementId, bytes32 indexed _proposalId);
    event SignToCancelAgreement(uint indexed _agreementId, address indexed _signer);
    event RevokeSignToCancelAgreement(uint indexed _agreementId, address indexed _signer);
    event AgreementCancel(uint indexed _agreementId);
    event Collect(uint indexed _agreementId);


    // The data for each vested agreement:
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


    struct Parameters {
        bytes32 voteParams;
        IntVoteInterface intVote;
    }

    // A mapping from the organization (Avatar) address to the saved data of the organization:
    mapping(address=>mapping(bytes32=>Agreement)) public organizationsProposals;

    // A mapping from hashes to parameters (use to store a particular configuration on the controller)
    mapping(bytes32=>Parameters) public parameters;

    // A mapping from index to Agreement
    mapping(uint=>Agreement) public agreements;

    uint public agreementsCounter;

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
    * @dev Proposing a vesting agreement in an organization.
    * @param _beneficiary the beneficiary of the agreement.
    * @param _returnOnCancelAddress where to send the tokens in case of stoping.
    * @param _startingBlock the block from which the agreement starts.
    * @param _amountPerPeriod amount of tokens per period.
    * @param _periodLength period length in blocks.
    * @param _numOfAgreedPeriods how many periods agreed on.
    * @param _cliffInPeriods the length of the cliff in periods.
    * @param _signaturesReqToCancel number of signatures required to cancel agreement.
    * @param _signersArray avatar array of addresses that can sign to cancel agreement.
    * @param _avatar avatar of the organization.
    * @return bytes32 the proposalId
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
    returns(bytes32)
    {
        // Open voting:
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        bytes32 proposalId = params.intVote.propose(2, params.voteParams, _avatar, ExecutableInterface(this),msg.sender);
        require(_signaturesReqToCancel <= _signersArray.length);
        require(_periodLength > 0);
        require(_numOfAgreedPeriods > 0);
        // Write the signers mapping:
        for (uint cnt = 0; cnt<_signersArray.length; cnt++) {
            organizationsProposals[_avatar][proposalId].signers[_signersArray[cnt]] = true;
        }
        // Write parameters:
        organizationsProposals[_avatar][proposalId].token = Avatar(_avatar).nativeToken();
        organizationsProposals[_avatar][proposalId].beneficiary = _beneficiary;
        organizationsProposals[_avatar][proposalId].returnOnCancelAddress = _returnOnCancelAddress;
        organizationsProposals[_avatar][proposalId].startingBlock = _startingBlock;
        organizationsProposals[_avatar][proposalId].amountPerPeriod = _amountPerPeriod;
        organizationsProposals[_avatar][proposalId].periodLength = _periodLength;
        organizationsProposals[_avatar][proposalId].numOfAgreedPeriods = _numOfAgreedPeriods;
        organizationsProposals[_avatar][proposalId].cliffInPeriods = _cliffInPeriods;
        organizationsProposals[_avatar][proposalId].signaturesReqToCancel = _signaturesReqToCancel;

        params.intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.

        // Log:
        emit AgreementProposal(_avatar, proposalId);
        return proposalId;
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
    * @param _signersArray avatar array of addresses that can sign to cancel agreement.
    * @return uint the agreement index.
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
        require(_signaturesReqToCancel <= _signersArray.length);
        require(_periodLength > 0);
        require(_numOfAgreedPeriods > 0);
        // Collect funds:
        uint totalAmount = _amountPerPeriod.mul(_numOfAgreedPeriods);
        require(_token.transferFrom(msg.sender, this, totalAmount));

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
        emit NewVestedAgreement(agreementsCounter-1);
        return(agreementsCounter-1);
    }

    /**
    * @dev Hash the parameters, save them if necessary, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
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
    * @dev Hash the parameters, and return the hash value
    * @param _voteParams -  voting parameters
    * @param _intVote  - voting machine contract.
    * @return bytes32 -the parameters hash
    */
    function getParametersHash(
        bytes32 _voteParams,
        IntVoteInterface _intVote
    ) public pure returns(bytes32)
    {
        return  (keccak256(abi.encodePacked(_voteParams, _intVote)));
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _avatar address of the controller
    * @param _param a parameter of the voting result, 0 is no and 1 is yes.
    * @return bool which represents a successful of the function
    */
    function execute(bytes32 _proposalId, address _avatar, int _param) public returns(bool) {
        // Check the caller is indeed the voting machine:
        require(parameters[getParametersFromController(Avatar(_avatar))].intVote == msg.sender);
        Agreement memory proposedAgreement = organizationsProposals[_avatar][_proposalId];
        require(proposedAgreement.periodLength > 0);
        delete organizationsProposals[_avatar][_proposalId];
        emit ProposalDeleted(_avatar,_proposalId);

        // Check if vote was successful:
        if (_param == 1) {
        // Define controller and mint tokens, check minting actually took place:
            ControllerInterface controller = ControllerInterface(Avatar(_avatar).owner());
            uint tokensToMint = proposedAgreement.amountPerPeriod.mul(proposedAgreement.numOfAgreedPeriods);
            controller.mintTokens(tokensToMint, this,_avatar);
            agreements[agreementsCounter] = proposedAgreement;
            agreementsCounter++;
        // Log the new agreement:
            emit ProposedVestedAgreement(agreementsCounter-1, _proposalId);
        }
        emit ProposalExecuted(_avatar,_proposalId,_param);
        return true;
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

        emit SignToCancelAgreement(_agreementId,msg.sender);

        // Check if threshold crossed:
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

        emit RevokeSignToCancelAgreement(_agreementId,msg.sender);
    }

    /**
    * @dev Function for a beneficiary to collect.
    * @param _agreementId the relevant agreement.
    */
    function collect(uint _agreementId) public onlyBeneficiary(_agreementId) {
        Agreement memory agreement = agreements[_agreementId];
        uint periodsFromStartingBlock = (block.number.sub(agreement.startingBlock)).div(agreement.periodLength);
        require(periodsFromStartingBlock >= agreement.cliffInPeriods);

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
        require(agreement.token.transfer(agreement.beneficiary, tokensToTransfer));

        // Log collecting:
        emit Collect(_agreementId);
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
        require(agreement.token.transfer(agreement.returnOnCancelAddress, tokensLeft));
        // Log canceling agreement:
        emit AgreementCancel(_agreementId);
    }
}
