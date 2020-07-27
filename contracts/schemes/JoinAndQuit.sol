pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "../votingMachines/VotingMachineCallbacks.sol";
import "../libs/StringUtil.sol";
import "./CommonInterface.sol";


/**
 * @title A scheme for join in a dao.
 * - A member can be proposed to join in by sending a min amount of fee.
 * - A member can ask to quite (RageQuit) a dao on any time.
 * - A member can donate to a dao.
 */
contract JoinAndQuit is
        VotingMachineCallbacks,
        ProposalExecuteInterface,
        CommonInterface {
    using SafeMath for uint;
    using SafeERC20 for IERC20;
    using StringUtil for string;

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

    event RageQuit(
        address indexed _avatar,
        address indexed _rageQuitter,
        uint256 indexed _refund
    );

    event Refund(
        address indexed _avatar,
        address indexed _beneficiary,
        uint256 indexed _refund
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
        bool executed;
    }

    struct MemberFund {
        bool candidate;
        bool rageQuit;
        bool accepted;
        uint256 funding;
    }

    mapping(bytes32=>Proposal) public proposals;
    mapping(address=>MemberFund) public fundings;

    IERC20 public fundingToken;
    uint256 public minFeeToJoin;
    uint256 public memberReputation;
    uint256 public fundingGoal;
    uint256 public fundingGoalDeadline;
    uint256 public totalDonation;
    bool public rageQuitEnable;

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
     * @param _rageQuitEnable rageQuit enabling flag
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
        uint256 _fundingGoalDeadline,
        bool    _rageQuitEnable
    )
    external
    {
        super._initializeGovernance(_avatar, _votingMachine, _voteParamsHash, _votingParams, _voteOnBehalf);
        fundingToken = _fundingToken;
        minFeeToJoin = _minFeeToJoin;
        memberReputation = _memberReputation;
        fundingGoal = _fundingGoal;
        fundingGoalDeadline = _fundingGoalDeadline;
        rageQuitEnable = _rageQuitEnable;
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
        require(fundings[proposal.proposedMember].accepted == false, "already accepted by the dao");
        require(proposal.executed == false, "proposal already been executed");
        proposals[_proposalId].executed = true;

        bool success;
        // Check if vote was successful:
        if ((_decision == 1) && (avatar.nativeReputation().balanceOf(proposal.proposedMember) == 0)) {
            fundings[proposal.proposedMember].accepted = true;
            fundings[proposal.proposedMember].funding = proposal.funding;
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
            if (fundingToken == IERC20(0)) {
                // solhint-disable-next-line
                (success, ) = proposal.proposedMember.call{value:proposal.funding}("");
                require(success, "sendEther to avatar failed");
            } else {
                fundingToken.safeTransfer(proposal.proposedMember, proposal.funding);
            }
        }
        fundings[proposal.proposedMember].candidate = false;
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
        require(!fundings[proposer].candidate, "already a candidate");
        require(avatar.nativeReputation().balanceOf(proposer) == 0, "already a member");
        require(!fundings[proposer].accepted, "already accepted by the dao");
        require(_feeAmount >= minFeeToJoin, "_feeAmount should be >= then the minFeeToJoin");
        fundings[proposer].candidate = true;
        if (fundingToken == IERC20(0)) {
            require(_feeAmount == msg.value, "ETH received shoul match the _feeAmount");
        } else {
            fundingToken.safeTransferFrom(proposer, address(this), _feeAmount);
        }
        bytes32 proposalId = votingMachine.propose(2, voteParamsHash, proposer, address(avatar));

        Proposal memory proposal = Proposal({
            executed: false,
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
        Proposal memory _proposal = proposals[_proposalId];
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.proposedMember != address(0), "no member to redeem");
        require(!fundings[proposal.proposedMember].rageQuit, "member already rageQuit");
        require(fundings[proposal.proposedMember].accepted == true, " proposal not accepted");
        //set proposal proposedMember to zero to prevent reentrancy attack.
        proposal.proposedMember = address(0);
        if (memberReputation == 0) {
            reputation = _proposal.funding;
        } else {
            reputation = memberReputation;
        }
        require(
        Controller(
        avatar.owner()).mintReputation(reputation, _proposal.proposedMember), "failed to mint reputation");
        emit RedeemReputation(address(avatar), _proposalId, _proposal.proposedMember, reputation);
    }

    /**
    * @dev refund refund donator if the the funding goal did not reached till the funding goal deadline.
    * @return refundAmount the refund amount
    */
    function refund() public returns(uint256 refundAmount) {
       // solhint-disable-next-line not-rely-on-time
        require(now > fundingGoalDeadline, "can refund only after fundingGoalDeadline");
        require(
        (avatar.db(FUNDED_BEFORE_DEADLINE_KEY).hashCompareWithLengthCheck(FUNDED_BEFORE_DEADLINE_VALUE) == false),
        "can refund only if funding goal not reached");
        require(fundings[msg.sender].funding > 0, "no funds to refund");
        refundAmount = fundings[msg.sender].funding;
        fundings[msg.sender].funding = 0;
        sendToBeneficiary(refundAmount, msg.sender);
        emit Refund(address(avatar), msg.sender, refundAmount);
    }

    /**
    * @dev rageQuit quit from the dao.
    * can be done on any time
    * REFUND = USER_DONATION * CURRENT_DAO_BALANCE / TOTAL_DONATIONS
    * @return refundAmount the refund amount
    */
    function rageQuit() public returns(uint256 refundAmount) {
        require(rageQuitEnable, "RageQuit disabled");
        require(fundings[msg.sender].funding > 0, "no fund to RageQuit");
        require(fundings[msg.sender].accepted, "member not accepted by the dao");
        uint256 userDonation = fundings[msg.sender].funding;
        fundings[msg.sender].funding = 0;
        fundings[msg.sender].rageQuit = true;
        if (fundingToken == IERC20(0)) {
            refundAmount = userDonation.mul(address(avatar.vault()).balance).div(totalDonation);
        } else {
            refundAmount = userDonation.mul(fundingToken.balanceOf(address(avatar))).div(totalDonation);
        }
        totalDonation = totalDonation.sub(userDonation);
        sendToBeneficiary(refundAmount, msg.sender);
        uint256 msgSenderReputation = avatar.nativeReputation().balanceOf(msg.sender);
        require(
        Controller(
        avatar.owner()).burnReputation(msgSenderReputation, msg.sender));
        emit RageQuit(address(avatar), msg.sender, refundAmount);
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

    /**
    * @dev sendToBeneficiary send amount of eth or token to beneficiary
    * @param _amount the amount to send
    * @param _beneficiary the beneficiary
    */
    function sendToBeneficiary(uint256 _amount, address payable _beneficiary) private {
        if (fundingToken == IERC20(0)) {
            require(
            Controller(
            avatar.owner()).sendEther(_amount, _beneficiary), "send ether failed");
        } else {
            require(
            Controller(
            avatar.owner()).externalTokenTransfer(fundingToken, _beneficiary, _amount), "send token failed");
        }
    }

}
