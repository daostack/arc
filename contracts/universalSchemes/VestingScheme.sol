pragma solidity ^0.5.2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/VotingMachineCallbacksInterface.sol";
import "./UniversalScheme.sol";
import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/SafeERC20.sol";


/**
 * @title A scheme for vesting.
 * @dev Can be used without organization just as a vesting component.
 */

contract VestingScheme is UniversalScheme, VotingMachineCallbacks, ProposalExecuteInterface {
    using SafeMath for uint;
    using SafeERC20 for address;

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _param);
    event ProposalDeleted(address indexed _avatar, bytes32 indexed _proposalId);
    event AgreementProposal(address indexed _avatar, bytes32 indexed _proposalId, string _descriptionHash);
    event NewVestedAgreement(uint256 indexed _agreementId);
    event ProposedVestedAgreement(uint256 indexed _agreementId, bytes32 indexed _proposalId);
    event SignToCancelAgreement(uint256 indexed _agreementId, address indexed _signer);
    event RevokeSignToCancelAgreement(uint256 indexed _agreementId, address indexed _signer);
    event AgreementCancel(uint256 indexed _agreementId);
    event Collect(uint256 indexed _agreementId);

    // The data for each vested agreement:
    struct Agreement {
        IERC20 token;
        address beneficiary;
        address returnOnCancelAddress;
        uint256 startingBlock;
        uint256 amountPerPeriod;
        uint256 periodLength;
        uint256 numOfAgreedPeriods;
        uint256 cliffInPeriods;
        uint256 signaturesReqToCancel;
        uint256 collectedPeriods;
        uint256 signaturesReceivedCounter;
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

    uint256 public agreementsCounter;

    // Modifier, only the signers on an agreement:
    modifier onlySigner(uint256 _agreementId) {
        require(agreements[_agreementId].signers[msg.sender]);
        _;
    }

    // Modifier, only the beneficiary on an agreement:
    modifier onlyBeneficiary(uint256 _agreementId) {
        require(agreements[_agreementId].beneficiary == msg.sender);
        _;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function
    */
    function executeProposal(bytes32 _proposalId, int256 _param) external onlyVotingMachine(_proposalId) returns(bool) {
        Avatar avatar = proposalsInfo[_proposalId].avatar;
        Agreement memory proposedAgreement = organizationsProposals[address(avatar)][_proposalId];
        require(proposedAgreement.periodLength > 0);
        delete organizationsProposals[address(avatar)][_proposalId];
        emit ProposalDeleted(address(avatar), _proposalId);

        // Check if vote was successful:
        if (_param == 1) {
        // Define controller and mint tokens, check minting actually took place:
            ControllerInterface controller = ControllerInterface(avatar.owner());
            uint256 tokensToMint = proposedAgreement.amountPerPeriod.mul(proposedAgreement.numOfAgreedPeriods);
            require(controller.mintTokens(tokensToMint, address(this), address(avatar)));
            agreements[agreementsCounter] = proposedAgreement;
            agreementsCounter++;
        // Log the new agreement:
            emit ProposedVestedAgreement(agreementsCounter-1, _proposalId);
        }
        emit ProposalExecuted(address(avatar), _proposalId, _param);
        return true;
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
    * @param _descriptionHash proposal description hash
    * @return bytes32 the proposalId
    */
    function proposeVestingAgreement(
        address _beneficiary,
        address _returnOnCancelAddress,
        uint256 _startingBlock,
        uint256 _amountPerPeriod,
        uint256 _periodLength,
        uint256 _numOfAgreedPeriods,
        uint256 _cliffInPeriods,
        uint256 _signaturesReqToCancel,
        address[] calldata _signersArray,
        Avatar _avatar,
        string calldata _descriptionHash
    )
    external
    returns(bytes32)
    {
        // Open voting:
        Parameters memory params = parameters[getParametersFromController(_avatar)];
        bytes32 proposalId = params.intVote.propose(2, params.voteParams, msg.sender, address(_avatar));
        require(_signaturesReqToCancel <= _signersArray.length);
        require(_periodLength > 0);
        require(_numOfAgreedPeriods > 0, "Number of Agreed Periods must be greater than 0");
        // Write the signers mapping:
        for (uint256 cnt = 0; cnt < _signersArray.length; cnt++) {
            organizationsProposals[address(_avatar)][proposalId].signers[_signersArray[cnt]] = true;
        }
        // Write parameters:
        organizationsProposals[address(_avatar)][proposalId].token = Avatar(_avatar).nativeToken();
        organizationsProposals[address(_avatar)][proposalId].beneficiary = _beneficiary;
        organizationsProposals[address(_avatar)][proposalId].returnOnCancelAddress = _returnOnCancelAddress;
        organizationsProposals[address(_avatar)][proposalId].startingBlock = _startingBlock;
        organizationsProposals[address(_avatar)][proposalId].amountPerPeriod = _amountPerPeriod;
        organizationsProposals[address(_avatar)][proposalId].periodLength = _periodLength;
        organizationsProposals[address(_avatar)][proposalId].numOfAgreedPeriods = _numOfAgreedPeriods;
        organizationsProposals[address(_avatar)][proposalId].cliffInPeriods = _cliffInPeriods;
        organizationsProposals[address(_avatar)][proposalId].signaturesReqToCancel = _signaturesReqToCancel;

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:_avatar,
            votingMachine:address(params.intVote)
        });
        emit AgreementProposal(address(_avatar), proposalId, _descriptionHash);
        return proposalId;
    }

    /**
    * @dev Creating a vesting agreement.
    * @param _token the relevant token in the agreement.
    * @param _beneficiary the beneficiary of the agreement.
    * @param _returnOnCancelAddress where to send the tokens in case of stoping.
    * @param _params array
    * _params[0] _startingBlock the block from which the agreement starts.
    * _params[1] _amountPerPeriod amount of tokens per period.
    * _params[2] _periodLength period length in blocks.
    * _params[3] _numOfAgreedPeriods how many periods agreed on.
    * _params[4] _cliffInPeriods the length of the cliff in periods.
    * _params[5] _signaturesReqToCancel number of signatures required to cancel agreement.
    * @param _signersArray avatar array of addresses that can sign to cancel agreement.
    * @return uint256 the agreement index.
    */
    function createVestedAgreement(
        IERC20 _token,
        address _beneficiary,
        address _returnOnCancelAddress,
        uint[6] calldata _params,
        address[] calldata _signersArray
    )
        external
        returns(uint256)
    {
        require(_params[5] <= _signersArray.length);
        require(_params[2] > 0);
        require(_params[3] > 0, "Number of Agreed Periods must be greater than 0");
        // Collect funds:
        uint256 totalAmount = _params[1].mul(_params[3]);
        address(_token).safeTransferFrom(msg.sender, address(this), totalAmount);

        // Write parameters:
        agreements[agreementsCounter].token = _token;
        agreements[agreementsCounter].beneficiary = _beneficiary;
        agreements[agreementsCounter].returnOnCancelAddress = _returnOnCancelAddress;
        agreements[agreementsCounter].startingBlock = _params[0];
        agreements[agreementsCounter].amountPerPeriod = _params[1];
        agreements[agreementsCounter].periodLength = _params[2];
        agreements[agreementsCounter].numOfAgreedPeriods = _params[3];
        agreements[agreementsCounter].cliffInPeriods = _params[4];
        agreements[agreementsCounter].signaturesReqToCancel = _params[5];

        // Write the signers mapping:
        for (uint256 cnt = 0; cnt < _signersArray.length; cnt++) {
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
    * @dev Function to sign to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function signToCancelAgreement(uint256 _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check attempt to double sign:
        require(!agreement.signaturesReceived[msg.sender]);

        // Sign:
        agreement.signaturesReceived[msg.sender] = true;
        agreement.signaturesReceivedCounter++;

        emit SignToCancelAgreement(_agreementId, msg.sender);

        // Check if threshold crossed:
        if (agreement.signaturesReceivedCounter == agreement.signaturesReqToCancel) {
            cancelAgreement(_agreementId);
        }
    }

    /**
    * @dev Function to revoke vote for canceling agreement.
    * @param _agreementId the relevant agreement.
    */
    function revokeSignToCancelAgreement(uint256 _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check signer did sign:
        require(agreement.signaturesReceived[msg.sender]);

        // Revoke signature:
        agreement.signaturesReceived[msg.sender] = false;
        agreement.signaturesReceivedCounter--;

        emit RevokeSignToCancelAgreement(_agreementId, msg.sender);
    }

    /**
    * @dev Function for a beneficiary to collect.
    * @param _agreementId the relevant agreement.
    */
    function collect(uint256 _agreementId) public onlyBeneficiary(_agreementId) {
        Agreement memory agreement = agreements[_agreementId];
        uint256 periodsFromStartingBlock = (block.number.sub(agreement.startingBlock)).div(agreement.periodLength);
        require(periodsFromStartingBlock >= agreement.cliffInPeriods);

        // Compute periods to pay:
        uint256 periodsToPay;
        if (periodsFromStartingBlock >= agreement.numOfAgreedPeriods) {
            periodsToPay = agreement.numOfAgreedPeriods.sub(agreement.collectedPeriods);
        } else {
            periodsToPay = periodsFromStartingBlock.sub(agreement.collectedPeriods);
        }
        // Update periods paid:
        agreements[_agreementId].collectedPeriods = agreements[_agreementId].collectedPeriods.add(periodsToPay);

        // Transfer:
        uint256 tokensToTransfer = periodsToPay.mul(agreement.amountPerPeriod);
        address(agreement.token).safeTransfer(agreement.beneficiary, tokensToTransfer);

        // Log collecting:
        emit Collect(_agreementId);
    }

    /**
    * @dev Internal function, to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function cancelAgreement(uint256 _agreementId) internal {
        Agreement memory agreement = agreements[_agreementId];
        delete agreements[_agreementId];
        uint256 periodsLeft = agreement.numOfAgreedPeriods.sub(agreement.collectedPeriods);
        uint256 tokensLeft = periodsLeft.mul(agreement.amountPerPeriod);
        address(agreement.token).safeTransfer(agreement.returnOnCancelAddress, tokensLeft);
        // Log canceling agreement:
        emit AgreementCancel(_agreementId);
    }
}
