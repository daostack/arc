pragma solidity ^0.4.24;

import "../VotingMachines/GenesisProtocolCallbacks.sol";


/**
 * @title A scheme for vesting.
 * @dev Can be used without organization just as a vesting component.
 */
contract VestingScheme is GenesisProtocolCallbacks, GenesisProtocolExecuteInterface {
    using SafeMath for uint;

    event ProposalExecuted(bytes32 indexed _proposalId, int _param);
    event ProposalDeleted(bytes32 indexed _proposalId);
    event AgreementProposal(bytes32 indexed _proposalId);
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
        mapping(address => bool) signers;
        mapping(address => bool) signaturesReceived;
    }
    
    Avatar public avatar;
    IntVoteInterface public intVote;
    bytes32 public voteParams;
    
    constructor () public {
        avatar = Avatar(0x000000000000000000000000000000000000dead);
    }

    function init(
        Avatar _avatar,
        IntVoteInterface _intVote,
        bytes32 _voteParams
    ) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");

        avatar = _avatar;
        intVote = _intVote;
        voteParams = _voteParams;
    }

    mapping(bytes32 => Agreement) public organizationProposals;

    // A mapping from index to Agreement
    mapping(uint => Agreement) public agreements;

    uint public agreementsCounter;

    // Modifier, only the signers on an agreement:
    modifier onlySigner(uint _agreementId) {
        require(agreements[_agreementId].signers[msg.sender], "Restricted to the signer only");
        _;
    }

    // Modifier, only the beneficiary on an agreement:
    modifier onlyBeneficiary(uint _agreementId) {
        require(agreements[_agreementId].beneficiary == msg.sender, "Restricted to the beneficiary only");
        _;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _param a parameter of the voting result, 1 yes and 2 is no.
    * @return bool which represents a successful of the function
    */
    function executeProposal(bytes32 _proposalId, int _param) external onlyVotingMachine(_proposalId) returns(bool) {
        Agreement memory proposedAgreement = organizationProposals[_proposalId];
        
        require(proposedAgreement.periodLength > 0, "Proposal specified doesn't exisits");
        
        delete organizationProposals[_proposalId];
        
        emit ProposalDeleted(_proposalId);

        // Check if vote was successful:
        if (_param == 1) {
            // Define controller and mint tokens, check minting actually took place:
            ControllerInterface controller = ControllerInterface(Avatar(avatar).owner());
            
            uint tokensToMint = proposedAgreement.amountPerPeriod.mul(proposedAgreement.numOfAgreedPeriods);
            controller.mintTokens(tokensToMint, this);
            
            agreements[agreementsCounter] = proposedAgreement;
            agreementsCounter++;
            
            // Log the new agreement:
            emit ProposedVestedAgreement(agreementsCounter - 1, _proposalId);
        }

        emit ProposalExecuted(_proposalId, _param);
        
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
        address[] _signersArray
    )
    external
    returns(bytes32)
    {
        // Open voting:
        bytes32 proposalId = intVote.propose(2, voteParams, msg.sender);

        require(_signaturesReqToCancel <= _signersArray.length, "Invalid _signaturesReqToCancel size");
        require(_periodLength > 0, "Period length is greater than 0");
        require(_numOfAgreedPeriods > 0, "Number of Agreed Periods must be greater than 0");

        // Write the signers mapping:
        for (uint cnt = 0; cnt < _signersArray.length; cnt++) {
            organizationProposals[proposalId].signers[_signersArray[cnt]] = true;
        }

        // Write parameters:
        organizationProposals[proposalId].token = Avatar(avatar).nativeToken();
        organizationProposals[proposalId].beneficiary = _beneficiary;
        organizationProposals[proposalId].returnOnCancelAddress = _returnOnCancelAddress;
        organizationProposals[proposalId].startingBlock = _startingBlock;
        organizationProposals[proposalId].amountPerPeriod = _amountPerPeriod;
        organizationProposals[proposalId].periodLength = _periodLength;
        organizationProposals[proposalId].numOfAgreedPeriods = _numOfAgreedPeriods;
        organizationProposals[proposalId].cliffInPeriods = _cliffInPeriods;
        organizationProposals[proposalId].signaturesReqToCancel = _signaturesReqToCancel;

        proposalsInfo[proposalId] = ProposalInfo({
            blockNumber: block.number,
            avatar: avatar,
            votingMachine: intVote
        });

        intVote.ownerVote(proposalId, 1, msg.sender); // Automatically votes `yes` in the name of the opener.

        // Log:
        emit AgreementProposal(proposalId);

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
        require(_signaturesReqToCancel <= _signersArray.length, "Invalid _signaturesReqToCancel size");
        require(_periodLength > 0, "Period length is greater than 0");
        require(_numOfAgreedPeriods > 0, "Number of Agreed Periods must be greater than 0");

        // Collect funds:
        uint totalAmount = _amountPerPeriod.mul(_numOfAgreedPeriods);
        require(_token.transferFrom(msg.sender, this, totalAmount), "Failed to transfer tokens");

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
        for (uint cnt = 0; cnt < _signersArray.length; cnt++) {
            agreements[agreementsCounter].signers[_signersArray[cnt]] = true;
        }

        // Increment the agreements counter:
        agreementsCounter++;

        // Log new agreement and return id:
        emit NewVestedAgreement(agreementsCounter - 1);
        return (agreementsCounter - 1);
    }

    /**
    * @dev Function to sign to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function signToCancelAgreement(uint _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check attempt to double sign:
        require(!agreement.signaturesReceived[msg.sender], "Signer signature already received");

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
    function revokeSignToCancelAgreement(uint _agreementId) public onlySigner(_agreementId) {
        Agreement storage agreement = agreements[_agreementId];

        // Check signer did sign:
        require(agreement.signaturesReceived[msg.sender], "Sender did not sign");

        // Revoke signature:
        agreement.signaturesReceived[msg.sender] = false;
        agreement.signaturesReceivedCounter--;

        emit RevokeSignToCancelAgreement(_agreementId, msg.sender);
    }

    /**
    * @dev Function for a beneficiary to collect.
    * @param _agreementId the relevant agreement.
    */
    function collect(uint _agreementId) public onlyBeneficiary(_agreementId) {
        Agreement memory agreement = agreements[_agreementId];
        uint periodsFromStartingBlock = (block.number.sub(agreement.startingBlock)).div(agreement.periodLength);
        require(periodsFromStartingBlock >= agreement.cliffInPeriods, "Tokens are not available for withrawal yet");

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
        require(agreement.token.transfer(agreement.beneficiary, tokensToTransfer), "Token transfer failed");

        // Log collecting:
        emit Collect(_agreementId);
    }

    /**
    * @dev Internal function, to cancel an agreement.
    * @param _agreementId the relevant agreement.
    */
    function cancelAgreement(uint _agreementId) internal {
        Agreement memory agreement = agreements[_agreementId];
        delete agreements[_agreementId];
        
        uint periodsLeft = agreement.numOfAgreedPeriods.sub(agreement.collectedPeriods);
        uint tokensLeft = periodsLeft.mul(agreement.amountPerPeriod);
        
        require(agreement.token.transfer(agreement.returnOnCancelAddress, tokensLeft), "Token transfer failed");
        
        // Log canceling agreement:
        emit AgreementCancel(_agreementId);
    }
}
