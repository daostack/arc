pragma solidity ^0.5.16;

import "../votingMachines/VotingMachineCallbacks.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../libs/StringUtil.sol";


/**
 * @title A scheme for join in a dao.
 * - A member can be proposed to join in by sending a min amount of fee.
 * - A member can ask to quite (RageQuit) a dao on any time.
 * - A member can donate to a dao.
 */
contract JoinAndQuit is
        VotingMachineCallbacks,
        ProposalExecuteInterface,
        Initializable {
    using SafeMath for uint;
    using SafeERC20 for address;
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

    event Donation(
        address indexed _avatar,
        uint256 indexed _donation
    );

    event RageQuit(
        address indexed _avatar,
        uint256 indexed _refund
    );

    event RedeemReputation(
        address indexed _avatar,
        bytes32 indexed _proposalId,
        address indexed _beneficiary,
        uint256 _amount);

    event ProposalExecuted(address indexed _avatar, bytes32 indexed _proposalId, int256 _decision);

    struct Proposal {
        bool accepted;
        address proposedMember;
        address funder;
        uint256 funding;
    }

    mapping(bytes32=>Proposal) public proposals;
    mapping(address=>uint256) public fundings;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;
    IERC20 public fundingToken;
    uint256 public minFeeToJoin;
    uint256 public memberReputation;
    uint256 public fundingGoal;
    uint256 public fundingGoalDeadLine;
    uint256 public totalDonation;
    string public constant FUNDED_BEFORE_DEADLINE_KEY = "FUNDED_BEFORE_DEADLINE";
    string public constant FUNDED_BEFORE_DEADLINE_VALUE = "TRUE";

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     * @param _fundingToken the funding token
     * @param _minFeeToJoin minimum fee required to join
     * @param _memberReputation the repution which will be allocated for members
     * @param _fundingGoal the funding goal
     * @param _fundingGoalDeadLine the funding goal deadline
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        IERC20 _fundingToken,
        uint256 _minFeeToJoin,
        uint256 _memberReputation,
        uint256 _fundingGoal,
        uint256 _fundingGoalDeadLine
    )
    external
    initializer
    {
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        fundingToken = _fundingToken;
        minFeeToJoin = _minFeeToJoin;
        memberReputation = _memberReputation;
        fundingGoal = _fundingGoal;
        fundingGoalDeadLine = _fundingGoalDeadLine;
    }

    /**
    * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
    * @param _proposalId the ID of the voting in the voting machine
    * @param _decision a parameter of the voting result, 1 yes and 2 is no.
    */
    function executeProposal(bytes32 _proposalId, int256 _decision)
    external
    onlyVotingMachine(_proposalId)
    returns(bool) {
        require(proposals[_proposalId].accepted == false);
        require(proposals[_proposalId].proposedMember != address(0));
        Proposal memory proposal = proposals[_proposalId];
        // Check if vote was successful:
        if (_decision == 1) {
            proposals[_proposalId].accepted = true;
            address(fundingToken).safeTransfer(address(avatar), proposals[_proposalId].funding);
            fundings[proposal.funder] = fundings[proposal.funder].add(proposal.funding);
            totalDonation = totalDonation.add(proposal.funding);
            checkFundedBeforeDeadLine();
        } else {
            address(fundingToken).safeTransfer(proposal.funder, proposal.funding);
        }
        emit ProposalExecuted(address(avatar), _proposalId, _decision);
        return true;
    }

    /**
    * @dev Submit a proposal for to join in a dao
    * @param _descriptionHash A hash of the proposal's description
    * @param _feeAmount - the amount to fund the dao with. should be >= the minimum fee to join
    * @param _proposedMember the proposed member join in - if this address is zero the msg.sender will be set as the member
    * @return proposalId the proposal id
    */
    function proposeToJoin(
        string memory _descriptionHash,
        uint256 _feeAmount,
        address _proposedMember
    )
    public
    returns(bytes32)
    {
        require(_feeAmount >= minFeeToJoin, "_feeAmount should be >= then the minFeeToJoin");
        address(fundingToken).safeTransferFrom(msg.sender, address(this), _feeAmount);
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));
        address proposedMember = _proposedMember;
        if (proposedMember == address(0)) {
            proposedMember = msg.sender;
        }

        Proposal memory proposal = Proposal({
            accepted: false,
            proposedMember: proposedMember,
            funding : _feeAmount,
            funder : msg.sender
        });
        proposals[proposalId] = proposal;

        emit JoinInProposal(
            address(avatar),
            proposalId,
            _descriptionHash,
            proposedMember,
            _feeAmount
        );

        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({
            blockNumber:block.number,
            avatar:avatar
        });
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
        //set proposal proposedMember to zero to prevent reentrancy attack.
        proposal.proposedMember = address(0);
        require(proposal.accepted == true, " proposal not accepted");
        require(
        Controller(
        avatar.owner()).mintReputation(memberReputation, _proposal.proposedMember));
        proposal.proposedMember = _proposal.proposedMember;
        emit RedeemReputation(address(avatar), _proposalId, _proposal.proposedMember, memberReputation);
    }

    /**
    * @dev donate donate to the dao. no repution is minted
    */
    function donate(uint256 _donation) public {
        address(fundingToken).safeTransferFrom(msg.sender, address(avatar), _donation);
        fundings[msg.sender] = fundings[msg.sender].add(_donation);
        totalDonation = totalDonation.add(_donation);
        checkFundedBeforeDeadLine();
        emit Donation(address(avatar), _donation);
    }

    /**
    * @dev rageQuit quit from the dao.
    * can be done on any time
    * REFUND = USER_DONATION * CURRENT_DAO_BALANCE / TOTAL_DONATIONS
    * @return refund the refund amount
    */
    function rageQuit() public returns(uint256 refund) {
        require(fundings[msg.sender] > 0, "no fund to RageQuit");
        uint256 userDonation = fundings[msg.sender];
        fundings[msg.sender] = 0;
        refund = userDonation.mul(fundingToken.balanceOf(address(avatar))).div(totalDonation);
        totalDonation = totalDonation.sub(userDonation);
        require(
        Controller(
        avatar.owner()).externalTokenTransfer(fundingToken, msg.sender, refund));
        emit RageQuit(address(avatar), refund);
    }

    /**
    * @dev checkFundedBeforeDeadLine check if funding goal reached.
    */
    function checkFundedBeforeDeadLine() private {
        if ((avatar.db(FUNDED_BEFORE_DEADLINE_KEY).hashCompareWithLengthCheck(FUNDED_BEFORE_DEADLINE_VALUE) == false) &&
            (fundingToken.balanceOf(address(avatar)) >= fundingGoal) &&
            // solhint-disable-next-line not-rely-on-time
            (now < fundingGoalDeadLine)) {
            require(
            Controller(
            avatar.owner()).setDBValue(FUNDED_BEFORE_DEADLINE_KEY, FUNDED_BEFORE_DEADLINE_VALUE));
            emit FundedBeforeDeadline(address(avatar));
        }
    }

}
