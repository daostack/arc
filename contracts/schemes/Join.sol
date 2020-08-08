pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/StringUtil.sol";
import "./CommonInterface.sol";


/**
 * @title A scheme for join in a dao.
 * - A member can be proposed to join in by sending a min amount of fee.
 * - A member can donate to a dao.
 */
contract Join is
        VotingMachineCallbacks,
        ProposalExecuteInterface,
        CommonInterface {
    using SafeMath for uint;
    using SafeERC20 for IERC20;
    using StringUtil for string;

    enum MemberState { None, Candidate, Accepted, Rejected, ReputationRedeemed }

    event JoinInProposal(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        string _descriptionHash,
        address _proposedMember,
        uint256 _feeAmount
    );

    event FundedBeforeDeadline(
        address indexed _avatar
    );

    event RedeemReputation(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount);

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _decision);

    struct Proposal {
        address proposedMember;
        uint256 funding;
    }

    mapping(bytes32=>Proposal) public proposals;
    mapping(address=>MemberState) public membersState;

    IERC20 public fundingToken;
    uint256 public minFeeToJoin;
    uint256 public memberReputation;
    uint256 public fundingGoal;
    uint256 public fundingGoalDeadline;
    uint256 public totalDonation;

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _votingParams genesisProtocol parameters - valid only if _voteParamsHash is zero
     * @param _voteOnBehalf genesisProtocol parameter - valid only if _voteParamsHash is zero
     * @param _voteParamsHash voting machine parameters.
     * @param _fundingToken the funding token - if this is zero the donation will be in native token ETH
     * @param _minFeeToJoin minimum fee required to join
     * @param _memberReputation the repution which will be allocated for members
              if this param is zero so the repution will be allocated proportional to the fee paid
     * @param _fundingGoal the funding goal
     * @param _fundingGoalDeadline the funding goal deadline
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        uint256[11] calldata _votingParams,
        address _voteOnBehalf,
        bytes32 _voteParamsHash,
        IERC20 _fundingToken,
        uint256 _minFeeToJoin,
        uint256 _memberReputation,
        uint256 _fundingGoal,
        uint256 _fundingGoalDeadline
    )
    external
    {
        super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
        fundingToken = _fundingToken;
        minFeeToJoin = _minFeeToJoin;
        memberReputation = _memberReputation;
        fundingGoal = _fundingGoal;
        fundingGoalDeadline = _fundingGoalDeadline;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    override
    returns(bool) {
        Proposal memory proposal = proposals[_proposalId];
        require(proposal.proposedMember != address(0), "not a valid proposal");
        require(membersState[proposal.proposedMember] == MemberState.Candidate, "member is not a cadidate");

        bool success;
        // Check if vote was successful:
        if ((_decision == 1) && (avatar.nativeReputation().balanceOf(proposal.proposedMember) == 0)) {
            membersState[proposal.proposedMember] = MemberState.Accepted;
            totalDonation = totalDonation.add(proposal.funding);
            if (fundingToken == IERC20(0)) {
                // solhint-disable-next-line
                (success, ) = address(avatar).call{value:proposal.funding}("");
                require(success, "sendEther to avatar failed");
            } else {
                fundingToken.safeTransfer(address(avatar), proposal.funding);
            }
            //this should be called/check after the transfer to the avatar.
            setFundingGoalReachedFlag();
        } else {
            membersState[proposal.proposedMember] = MemberState.Rejected;
            if (fundingToken == IERC20(0)) {
                // solhint-disable-next-line
                (success, ) = proposal.proposedMember.call{value:proposal.funding}("");
                require(success, "sendEther back to candidate failed");
            } else {
                fundingToken.safeTransfer(proposal.proposedMember, proposal.funding);
            }
        }

        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev Submit a proposal for to join in a dao
    * @param _descriptionHash A hash of the proposal's description
    * @param _feeAmount - the amount to fund the dao with. should be >= the minimum fee to join
    * @return proposalId the proposal id
    */
    function proposeToJoin(
        string memory _descriptionHash,
        uint256 _feeAmount
    )
    public
    payable
    returns(bytes32)
    {
        address proposer = msg.sender;
        require(membersState[proposer] != MemberState.Candidate, "proposer is already a candidate");
        require(membersState[proposer] != MemberState.Accepted, "proposer is accepted and not redeemed yet");
        require(avatar.nativeReputation().balanceOf(proposer) == 0, "proposer is already a member");
        require(_feeAmount >= minFeeToJoin, "_feeAmount should be >= than the minFeeToJoin");
        membersState[proposer] = MemberState.Candidate;
        if (fundingToken == IERC20(0)) {
            require(_feeAmount == msg.value, "ETH received should match the _feeAmount");
        } else {
            fundingToken.safeTransferFrom(proposer, address(this), _feeAmount);
        }
        bytes32 proposalId = votingMachine.propose(2, voteParamsHash, proposer, address(avatar));

        Proposal memory proposal = Proposal({
            proposedMember: proposer,
            funding : _feeAmount
        });
        proposals[proposalId] = proposal;

        emit JoinInProposal(
            address(avatar),
            proposalId,
            _descriptionHash,
            proposer,
            _feeAmount
        );

        proposalsBlockNumber[proposalId] = block.number;
        return proposalId;
    }

    /**
    * @dev RedeemReputation reward for proposal
    * @param _proposalId the ID of the voting in the voting machine
    * @return reputation the redeemed reputation.
    */
    function redeemReputation(bytes32 _proposalId) public returns(uint256 reputation) {
        Proposal memory proposal = proposals[_proposalId];
        require(proposal.proposedMember != address(0), "no member to redeem");
        require(membersState[proposal.proposedMember] == MemberState.Accepted, "member not accepted");
        //set proposal proposedMember to zero to prevent reentrancy attack.
        proposals[_proposalId].proposedMember = address(0);
        proposals[_proposalId].proposedMember = address(0);
        membersState[proposal.proposedMember] = MemberState.ReputationRedeemed;
        if (memberReputation == 0) {
            reputation = proposal.funding;
        } else {
            reputation = memberReputation;
        }
        require(
        Controller(
        avatar.owner()).mintReputation(reputation, proposal.proposedMember), "failed to mint reputation");
        emit RedeemReputation(address(avatar), _proposalId, proposal.proposedMember, reputation);
    }

    /**
    * @dev setFundingGoalReachedFlag check if funding goal reached.
    */
    function setFundingGoalReachedFlag() public {
        uint256 avatarBalance;
        if (fundingToken == IERC20(0)) {
            avatarBalance = (address(avatar.vault())).balance;
        } else {
            avatarBalance = fundingToken.balanceOf(address(avatar));
        }
        if ((avatar.db(CommonInterface.FUNDED_BEFORE_DEADLINE_KEY)
            .hashCompareWithLengthCheck(CommonInterface.FUNDED_BEFORE_DEADLINE_VALUE) == false) &&
            (avatarBalance >= fundingGoal) &&
            // solhint-disable-next-line not-rely-on-time
            (now < fundingGoalDeadline)) {
            require(
            Controller(
            avatar.owner()).
            setDBValue(CommonInterface.FUNDED_BEFORE_DEADLINE_KEY, CommonInterface.FUNDED_BEFORE_DEADLINE_VALUE));
            emit FundedBeforeDeadline(address(avatar));
        }
    }

}
