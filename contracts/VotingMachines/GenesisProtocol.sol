pragma solidity ^0.4.19;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "../universalSchemes/UniversalScheme.sol";


/**
 * @title GenesisProtocol implementation -an organization's voting machine scheme.
 */
contract GenesisProtocol is IntVoteInterface,UniversalScheme {
    using SafeMath for uint;

    enum ProposalState { None ,Closed, Executed, PreBoosted,Boosted,QuietEndingPeriod }
    enum ExecutionState { None, PreBoostedTimeOut, PreBoostedBarCrossed, BoostedTimeOut,BoostedBarCrossed }

    //Organization's parameters
    struct Parameters {
        uint preBoostedVoteRequiredPercentage; // the absolute vote percentages bar.
        uint preBoostedVotePeriodLimit; //the time limit for a proposal to be in an absolute voting mode.
        uint boostedVotePeriodLimit; //the time limit for a proposal to be in an relative voting mode.
        uint thresholdConstA;//constant A for threshold calculation . threshold =A * (e ** (numberOfBoostedProposals/B))
        uint thresholdConstB;//constant B for threshold calculation . threshold =A * (e ** (numberOfBoostedProposals/B))
        uint minimumStakingFee; //minimum staking fee allowed.
        uint quietEndingPeriod; //quite ending period
        uint proposingRepRewardConstA;//constant A for calculate proposer reward. proposerReward =A +B*(R+ - R-)
        uint proposingRepRewardConstB;//constant B for calculate proposing reward.proposerReward =A +B*(R+ - R-)
        uint stakerFeeRatioForVoters; // The “ratio of stake” to be paid to voters.
                                      // All stakers pay a portion of their stake to all voters, stakerFeeRatioForVoters * (s+ + s-).
                                      //All voters (pre and during boosting period) divide this portion in proportion to their reputation.
        uint votersReputationLossRatio;//Unsuccessful pre booster voters lose votersReputationLossRatio% of their reputation.
        uint votersGainRepRatioFromLostRep; //the percentages the lost reputation which is divided by the successful pre boosted voters, in proportion to their reputation.
                                            //The rest (100-votersGainRepRatioFromLostRep)% of lost reputation is divided between the successful wagers, in proportion to their stake.


    }
    struct Voter {
        uint vote; // YES(1) ,NO(2)
        uint reputation; // amount of voter's reputation
        bool preBoosted;
    }

    struct Staker {
        uint vote; // YES(1) ,NO(2)
        uint amount; // amount of voter's reputation
    }

    struct Proposal {
        address avatar; // the organization's avatar the proposal is target to.
        uint numOfChoices;
        ExecutableInterface executable; // will be executed if the proposal will pass
        uint totalVotes;
        uint votersStakes;
        uint lostReputation;
        uint submittedTime;
        uint boostedPhaseTime; //the time the proposal shift to relative mode.
        uint[2] totalStakes;// [(total stakes - votersStakes)],[totalRedeemableStakes]
        ProposalState state;
        uint winningVote; //the winning vote.
        address proposer;
        uint currentBoostedVotePeriodLimit;
        bytes32 paramsHash;
        mapping(uint=>uint) votes;
        mapping(address=>Voter) voters;
        mapping(uint=>uint) stakes;
        mapping(address=>Staker) stakers;
    }

    event NewProposal(bytes32 indexed _proposalId, uint _numOfChoices, address _proposer, bytes32 _paramsHash);
    event ExecuteProposal(bytes32 indexed _proposalId, uint _decision,uint _totalReputation,ExecutionState _executionState);
    event VoteProposal(bytes32 indexed _proposalId, address indexed _voter, uint _vote, uint _reputation);
    event Stake(bytes32 indexed _proposalId, address indexed _voter,uint _vote,uint _amount);
    event Redeem(bytes32 indexed _proposalId, address indexed _beneficiary,uint _amount);
    event RedeemReputation(bytes32 indexed _proposalId, address indexed _beneficiary,int _amount);

    mapping(bytes32=>Parameters) public parameters;  // A mapping from hashes to parameters
    mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

    uint constant public NUM_OF_CHOICES = 2;
    uint constant public NO = 2;
    uint constant public YES = 1;
    uint public proposalsCnt; // Total number of proposals
    mapping(address=>uint) public orgBoostedProposalsCnt;
    StandardToken public stakingToken;
    /**
     * @dev Constructor
     */
    function GenesisProtocol(StandardToken _stakingToken)
    public
    {
        stakingToken = _stakingToken;
    }

  /**
   * @dev Check that the proposal is votable (open and not executed yet)
   */
    modifier votable(bytes32 _proposalId) {
        require(isVotable(_proposalId));
        _;
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     * @param _params a parameters array
     *    _params[0] - _preBoostedVoteRequiredPercentage,
     *    _params[1] - _preBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
     *    _params[2] -_boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
     *    _params[3] -_thresholdConstA,
     *    _params[4] -_thresholdConstB,
     *    _params[5] -_minimumStakingFee,
     *    _params[6] -_quietEndingPeriod,
     *    _params[7] -_proposingRepRewardConstA,
     *    _params[8] -_proposingRepRewardConstB,
     *    _params[9] -_stakerFeeRatioForVoters,
     *    _params[10] -_votersReputationLossRatio,
     *    _params[11] -_votersGainRepRatioFromLostRep
    */
    function setParameters(
        uint[12] _params //use array here due to stack too deep issue.
    )
    public
    returns(bytes32)
    {
        require(_params[0] <= 100 && _params[0] > 0); //preBoostedVoteRequiredPercentage
        require(_params[4] > 0 && _params[4] <= 0xFF); //_thresholdConstB cannot be zero.
        require(_params[3] <= 0xFF); //_thresholdConstA
        require(_params[9] <= 100); //stakerFeeRatioForVoters
        require(_params[10] <= 100); //votersReputationLossRatio
        require(_params[11] <= 100); //votersGainRepRatioFromLostRep
        require(_params[2] >= _params[6]); //boostedVotePeriodLimit >= quietEndingPeriod
        bytes32 paramsHash = getParametersHash(_params);
        parameters[paramsHash] = Parameters({
            preBoostedVoteRequiredPercentage: _params[0],
            preBoostedVotePeriodLimit: _params[1],
            boostedVotePeriodLimit: _params[2],
            thresholdConstA:_params[3],
            thresholdConstB:_params[4],
            minimumStakingFee: _params[5],
            quietEndingPeriod: _params[6],
            proposingRepRewardConstA: _params[7],
            proposingRepRewardConstB:_params[8],
            stakerFeeRatioForVoters:_params[9],
            votersReputationLossRatio:_params[10],
            votersGainRepRatioFromLostRep:_params[11]
        });
        return paramsHash;
    }

  /**
   * @dev hashParameters returns a hash of the given parameters
   */
    function getParametersHash(
        uint[12] _params) //use array here due to stack too deep issue.
        public
        pure
        returns(bytes32)
        {
        return keccak256(
            _params[0],
            _params[1],
            _params[2],
            _params[3],
            _params[4],
            _params[5],
            _params[6],
            _params[7],
            _params[8],
            _params[9],
            _params[10],
            _params[11]);
    }

    /**
     * @dev register a new proposal with the given parameters. Every proposal has a unique ID which is being
     * generated by calculating keccak256 of a incremented counter.
     * @param _numOfChoices number of voting choices
     * @param _avatar an address to be sent as the payload to the _executable contract.
     * @param _executable This contract will be executed when vote is over.
     * @param _proposer address
     * @return proposal's id.
     */
    function propose(uint _numOfChoices, bytes32 , address _avatar, ExecutableInterface _executable,address _proposer) public returns(bytes32) {
          // Check valid params and number of choices:
        require(_numOfChoices == NUM_OF_CHOICES);
        require(ExecutableInterface(_executable) != address(0));
        //Check parameters existence.
        bytes32 paramsHash = getParametersFromController(Avatar(_avatar));

        require(parameters[paramsHash].preBoostedVoteRequiredPercentage > 0);
        // Generate a unique ID:
        bytes32 proposalId = keccak256(this, proposalsCnt);
        proposalsCnt++;
        // Open proposal:
        Proposal memory proposal;
        proposal.numOfChoices = _numOfChoices;
        proposal.avatar = _avatar;
        proposal.executable = _executable;
        proposal.state = ProposalState.PreBoosted;
        // solium-disable-next-line security/no-block-members
        proposal.submittedTime = now;
        proposal.currentBoostedVotePeriodLimit = parameters[paramsHash].boostedVotePeriodLimit;
        proposal.proposer = _proposer;
        proposal.winningVote = NO;
        proposal.paramsHash = paramsHash;
        proposals[proposalId] = proposal;
        NewProposal(proposalId, _numOfChoices, msg.sender, paramsHash);
        return proposalId;
    }

  /**
   * @dev Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.
   */
    function cancelProposal(bytes32 ) public returns(bool) {
        //This is not allowed.
        return false;
    }

    /**
     * @dev staking function
     * @param _proposalId id of the proposal
     * @param _vote  NO(2) or YES(1).
     * @param _amount the betting amount
     * @return bool true - the proposal has been executed
     *              false - otherwise.
     */
    function stake(bytes32 _proposalId, uint _vote, uint _amount) public returns(bool) {
        // 0 is not a valid vote.
        require(_vote <= NUM_OF_CHOICES && _vote > 0);
        require(_amount > 0);
        if (execute(_proposalId)) {
            return true;
        }

        Proposal storage proposal = proposals[_proposalId];

        if (proposal.state != ProposalState.PreBoosted) {
            return false;
        }

        // enable to increase stake only on the previous stake vote
        Staker storage staker = proposal.stakers[msg.sender];
        if ((staker.amount > 0) && (staker.vote != _vote)) {
            return false;
        }

        uint amount = _amount;
        Parameters memory params = parameters[proposal.paramsHash];
        require(amount >= params.minimumStakingFee);
        stakingToken.transferFrom(msg.sender, address(this), amount);
        proposal.totalStakes[1] = proposal.totalStakes[1].add(amount); //update totalRedeemableStakes
        staker.amount += amount;
        staker.vote = _vote;

        proposal.votersStakes += (params.stakerFeeRatioForVoters * amount)/100;
        proposal.stakes[_vote] = amount.add(proposal.stakes[_vote]);
        amount = amount - ((params.stakerFeeRatioForVoters*amount)/100);
        proposal.totalStakes[0] = amount.add(proposal.totalStakes[0]);
      // Event:
        Stake(_proposalId, msg.sender, _vote, _amount);
      // execute the proposal if this vote was decisive:
        return execute(_proposalId);
    }

  /**
   * @dev voting function
   * @param _proposalId id of the proposal
   * @param _vote NO(2) or YES(1).
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function vote(bytes32 _proposalId, uint _vote) public votable(_proposalId) returns(bool) {
        return internalVote(_proposalId, msg.sender, _vote, 0);
    }

  /**
   * @dev voting function with owner functionality (can vote on behalf of someone else)
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function ownerVote(bytes32 , uint , address ) public returns(bool) {
      //This is not allowed.
        return false;
    }

    function voteWithSpecifiedAmounts(bytes32 _proposalId,uint _vote,uint _rep,uint) public votable(_proposalId) returns(bool) {
        return internalVote(_proposalId,msg.sender,_vote,_rep);
    }

  /**
   * @dev Cancel the vote of the msg.sender: subtract the reputation amount from the votes
   * and delete the voter from the proposal struct
   * @param _proposalId id of the proposal
   */
    function cancelVote(bytes32 _proposalId) public votable(_proposalId) {
       //this is not allowed
        return;
    }

  /**
    * @dev execute check if the proposal has been decided, and if so, execute the proposal
    * @param _proposalId the id of the proposal
    * @return bool true - the proposal has been executed
    *              false - otherwise.
   */
    function execute(bytes32 _proposalId) public votable(_proposalId) returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        Proposal memory tmpProposal = proposal;
        uint totalReputation = Avatar(proposal.avatar).nativeReputation().totalSupply();
        uint executionBar = totalReputation * params.preBoostedVoteRequiredPercentage/100;
        ExecutionState executionState = ExecutionState.None;

        if (proposal.state == ProposalState.PreBoosted) {
            // solium-disable-next-line security/no-block-members
            if ((now - proposal.submittedTime) >= params.preBoostedVotePeriodLimit) {
                proposal.state = ProposalState.Closed;
                proposal.winningVote = NO;
                executionState = ExecutionState.PreBoostedTimeOut;
             } else if (proposal.votes[proposal.winningVote] > executionBar) {
              // someone crossed the absolute vote execution bar.
                proposal.state = ProposalState.Executed;
                executionState = ExecutionState.PreBoostedBarCrossed;
               } else if ( shouldBoost(_proposalId)) {
                //the proposal crossed its absolutePhaseScoreLimit or preBoostedVotePeriodLimit
                //change proposal mode to boosted mode.
                proposal.state = ProposalState.Boosted;
                // solium-disable-next-line security/no-block-members
                proposal.boostedPhaseTime = now;
                orgBoostedProposalsCnt[proposal.avatar]++;
              }
           }

        if ((proposal.state == ProposalState.Boosted) ||
            (proposal.state == ProposalState.QuietEndingPeriod)) {
            // solium-disable-next-line security/no-block-members
            if ((now - proposal.boostedPhaseTime) >= proposal.currentBoostedVotePeriodLimit) {
                proposal.state = ProposalState.Executed;
                orgBoostedProposalsCnt[tmpProposal.avatar] = orgBoostedProposalsCnt[tmpProposal.avatar].sub(1);
                executionState = ExecutionState.BoostedTimeOut;
             } else if (proposal.votes[proposal.winningVote] > executionBar) {
               // someone crossed the absolute vote execution bar.
                orgBoostedProposalsCnt[tmpProposal.avatar] = orgBoostedProposalsCnt[tmpProposal.avatar].sub(1);
                proposal.state = ProposalState.Executed;
                executionState = ExecutionState.BoostedBarCrossed;
            }
       }
        if (executionState != ExecutionState.None) {
            ExecuteProposal(_proposalId, proposal.winningVote, totalReputation, executionState);
            (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(proposal.winningVote));
        }
        return (executionState != ExecutionState.None);
    }

    /**
     * @dev redeem a reward for a successful stake, vote or proposing.
     * The function use a beneficiary address as a parameter (and not msg.sender) to enable
     * users to redeem on behalf of someone else.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary - the beneficiary address
     * @return bool true or false.
     */
    function redeem(bytes32 _proposalId,address _beneficiary) public returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        require((proposal.state == ProposalState.Executed) || (proposal.state == ProposalState.Closed));
        uint amount;
        int reputation;
        if ((proposal.stakers[_beneficiary].amount>0) &&
             (proposal.stakers[_beneficiary].vote == proposal.winningVote)) {
            //as staker
            amount = getRedeemableTokensStaker(_proposalId,_beneficiary);
            reputation = getRedeemableReputationStaker(_proposalId,_beneficiary);
            proposal.stakers[_beneficiary].amount = 0;
        }
        if (proposal.voters[_beneficiary].reputation != 0 ) {
            //as voter
            amount += getRedeemableTokensVoter(_proposalId,_beneficiary);
            reputation += getRedeemableReputationVoter(_proposalId,_beneficiary);
            proposal.voters[_beneficiary].reputation = 0;
        }

        if ((proposal.proposer == _beneficiary)&&(proposal.winningVote == YES)) {
            //as proposer
            proposal.proposer = 0;
            reputation += getRedeemableReputationProposer(_proposalId);
        }
        if (amount != 0) {
            proposal.totalStakes[1] = proposal.totalStakes[1].sub(amount);
            stakingToken.transfer(_beneficiary, amount);
            Redeem(_proposalId,_beneficiary,amount);
        }
        if (reputation != 0 ) {
            ControllerInterface(Avatar(proposal.avatar).owner()).mintReputation(reputation,_beneficiary,proposal.avatar);
            RedeemReputation(_proposalId,_beneficiary,reputation);
        }
        return true;
    }

    /**
     * @dev shouldBoost check if a proposal should be shifted to boosted phase.
     * @param _proposalId the ID of the proposal
     * @return bool true or false.
     */
    function shouldBoost(bytes32 _proposalId) public view returns(bool) {
        address avatar = proposals[_proposalId].avatar;
        return (_score(_proposalId) >= threshold(_proposalId,avatar));
    }

    /**
     * @dev score return the proposal score
     * @param _proposalId the ID of the proposal
     * @return uint proposal score.
     */
    function score(bytes32 _proposalId) public view returns(int) {
        return _score(_proposalId);
    }

    /**
     * @dev threshold return the organization's score threshold which required by
     * a proposal to shift to boosted state.
     * This threshold is dynamically set and it depend on the number of boosted proposal.
     * @param _avatar the organization avatar
     * @return int organization's score threshold.
     */
    function threshold(bytes32 _proposalId,address _avatar) public view returns(int) {
        uint e = 2;
        Parameters memory params = parameters[proposals[_proposalId].paramsHash];
        return int(params.thresholdConstA * (e ** (orgBoostedProposalsCnt[_avatar]/params.thresholdConstB)));
    }

    /**
     * @dev getRedeemableTokensStaker return the redeem amount which a certain staker is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint redeem amount .
     */
    function getRedeemableTokensStaker(bytes32 _proposalId,address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.stakes[proposal.winningVote] == 0) {
        //this can be reached if the winningVote is NO
            return 0;
        }
        return (proposal.stakers[_beneficiary].amount * proposal.totalStakes[0]) / proposal.stakes[proposal.winningVote];
    }

    /**
     * @dev getRedeemableReputationProposer return the redeemable reputation which a proposer is entitle to.
     * @param _proposalId the ID of the proposal
     * @return int proposer redeem reputation.
     */
    function getRedeemableReputationProposer(bytes32 _proposalId) public view returns(int) {
        int rep;
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.winningVote == NO) {
            rep = 0;
        } else {
            Parameters memory params = parameters[proposal.paramsHash];
            rep = int(params.proposingRepRewardConstA + params.proposingRepRewardConstB * (proposal.votes[YES]-proposal.votes[NO]));
        }
        return rep;
    }

    /**
     * @dev getRedeemableTokensVoter return the redeemable amount which a voter is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint voter redeem token amount.
     */
    function getRedeemableTokensVoter(bytes32 _proposalId, address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.totalVotes == 0)
           return 0;
        return ((proposal.votersStakes * proposal.voters[_beneficiary].reputation) / proposal.totalVotes);
    }

    /**
     * @dev getRedeemableReputationVoter return the redeemable reputation which a voter is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return int voter redeem reputation amount.
     */
    function getRedeemableReputationVoter(bytes32 _proposalId,address _beneficiary) public view returns(int) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        int returnReputation;
        uint reputation = proposals[_proposalId].voters[_beneficiary].reputation;
        if (proposal.state == ProposalState.Closed) {
           //no reputation flow occurs so give back reputation for the voter
            return int((reputation * params.votersReputationLossRatio)/100);
        }
        if (proposal.totalVotes == 0) {
            return 0;
        }

        if (proposal.voters[_beneficiary].preBoosted && (proposal.winningVote == proposal.voters[_beneficiary].vote )) {
        //give back reputation for the voter
            returnReputation = int((reputation * params.votersReputationLossRatio)/100);
        }
        return returnReputation + int((reputation * proposal.lostReputation * params.votersGainRepRatioFromLostRep)/(proposal.totalVotes*100));
    }

    /**
     * @dev getRedeemableReputationStaker return the redeemable reputation which a staker is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return int staker redeem reputation amount.
     */
    function getRedeemableReputationStaker(bytes32 _proposalId,address _beneficiary) public view returns(int) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        int rep;
        if (proposal.state == ProposalState.Closed) {
           //no reputation flow occurs so no reputation flow for staker
            return 0;
        }
        uint amount = proposal.stakers[_beneficiary].amount;
        if ((amount>0) &&
            (proposal.stakers[_beneficiary].vote == proposal.winningVote)) {
            rep = int((amount * ( proposal.lostReputation - ((proposal.lostReputation * params.votersGainRepRatioFromLostRep)/100)))/proposal.stakes[proposal.winningVote]);
        }
        return rep;
    }

  /**
   * @dev getNumberOfChoices returns the number of choices possible in this proposal
   * @param _proposalId the ID of the proposals
   * @return uint that contains number of choices
   */
    function getNumberOfChoices(bytes32 _proposalId) public view returns(uint) {
        return proposals[_proposalId].numOfChoices;
    }

  /**
   * @dev voteInfo returns the vote and the amount of reputation of the user committed to this proposal
   * @param _proposalId the ID of the proposal
   * @param _voter the address of the voter
   * @return uint vote - the voters vote
   *        uint reputation - amount of reputation committed by _voter to _proposalId
   */
    function voteInfo(bytes32 _proposalId, address _voter) public view returns(uint, uint) {
        Voter memory voter = proposals[_proposalId].voters[_voter];
        return (voter.vote, voter.reputation);
    }

    /**
     * @dev voteStatus returns the reputation voted for a proposal for a specific voting choice.
     * @param _proposalId the ID of the proposal
     * @param _choice the index in the
     * @return voted reputation for the given choice
     */
    function voteStatus(bytes32 _proposalId,uint _choice) public view returns(uint) {
        return proposals[_proposalId].votes[_choice];
    }

    /**
      * @dev isVotable check if the proposal is votable
      * @param _proposalId the ID of the proposal
      * @return bool true or false
    */
    function isVotable(bytes32 _proposalId) public view returns(bool) {
        return ((proposals[_proposalId].state == ProposalState.PreBoosted)||(proposals[_proposalId].state == ProposalState.Boosted)||(proposals[_proposalId].state == ProposalState.QuietEndingPeriod));
    }

    /**
      * @dev proposalStatus return the total votes and stakes for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint totalVotes
      * @return uint stakersStakes
      * @return uint totalRedeemableStakes
      * @return uint voterStakes
    */
    function proposalStatus(bytes32 _proposalId) public view returns(uint, uint, uint,uint) {
        return (proposals[_proposalId].totalVotes, proposals[_proposalId].totalStakes[0],proposals[_proposalId].totalStakes[1], proposals[_proposalId].votersStakes);
    }

    /**
      * @dev proposalAvatar return the avatar for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint total reputation supply
    */
    function proposalAvatar(bytes32 _proposalId) public view returns(address) {
        return (proposals[_proposalId].avatar);
    }

    /**
      * @dev scoreThresholdParams return the score threshold params for a given
      * organization.
      * @param _avatar the organization's avatar
      * @return uint thresholdConstA
      * @return uint thresholdConstB
    */
    function scoreThresholdParams(address _avatar) public view returns(uint,uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(_avatar));
        Parameters memory params = parameters[paramsHash];
        return (params.thresholdConstA,params.thresholdConstB);
    }

    /**
      * @dev staker return the vote and stake amount for a given proposal and staker
      * @param _proposalId the ID of the proposal
      * @param _staker staker address
      * @return uint vote
      * @return uint amount
    */
    function staker(bytes32 _proposalId,address _staker) public view returns(uint,uint) {
        return (proposals[_proposalId].stakers[_staker].vote,proposals[_proposalId].stakers[_staker].amount);
    }

    /**
      * @dev voteStake return the amount stakes for a given proposal and vote
      * @param _proposalId the ID of the proposal
      * @param _vote vote number
      * @return uint stake amount
    */
    function voteStake(bytes32 _proposalId,uint _vote) public view returns(uint) {
        return proposals[_proposalId].stakes[_vote];
    }

    /**
      * @dev voteStake return the winningVote for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint winningVote
    */
    function winningVote(bytes32 _proposalId) public view returns(uint) {
        return proposals[_proposalId].winningVote;
    }

    /**
      * @dev voteStake return the state for a given proposal
      * @param _proposalId the ID of the proposal
      * @return ProposalState proposal state
    */
    function state(bytes32 _proposalId) public view returns(ProposalState) {
        return proposals[_proposalId].state;
    }

    /**
     * @dev isAbstainAllow returns if the voting machine allow abstain (0)
     * @return bool true or false
     */
    function isAbstainAllow() public pure returns(bool) {
        return false;
    }

    /**
     * @dev Vote for a proposal, if the voter already voted, cancel the last vote and set a new one instead
     * @param _proposalId id of the proposal
     * @param _voter used in case the vote is cast for someone else
     * @param _vote a value between 0 to and the proposal's number of choices.
     * @param _rep how many reputation the voter would like to stake for this vote.
     *         if  _rep==0 so the voter full reputation will be use.
     * @return true in case of proposal execution otherwise false
     * throws if proposal is not open or if it has been executed
     * NB: executes the proposal if a decision has been reached
     */
    function internalVote(bytes32 _proposalId, address _voter, uint _vote, uint _rep) private returns(bool) {
        // 0 is not a valid vote.
        require(_vote <= NUM_OF_CHOICES && _vote > 0);
        if (execute(_proposalId)) {
            return true;
        }

        Parameters memory params = parameters[proposals[_proposalId].paramsHash];
        Proposal storage proposal = proposals[_proposalId];

        // Check voter has enough reputation:
        uint reputation = Avatar(proposal.avatar).nativeReputation().reputationOf(_voter);
        require(reputation >= _rep);
        uint rep = _rep;
        if (rep == 0) {
            rep = reputation;
        }
        // If this voter has already voted, return false.
        if (proposal.voters[_voter].reputation != 0) {
            return false;
        }
        // The voting itself:
        proposal.votes[_vote] = rep.add(proposal.votes[_vote]);
        if (proposal.votes[_vote] > proposal.votes[proposal.winningVote]) {
           // solium-disable-next-line security/no-block-members
            uint _now = now;
            if ((proposal.state == ProposalState.QuietEndingPeriod) ||
               ((proposal.state == ProposalState.Boosted) && ((_now - proposal.boostedPhaseTime) >= (params.boostedVotePeriodLimit - params.quietEndingPeriod)))) {
                //quietEndingPeriod
                proposal.boostedPhaseTime = _now;
                if (proposal.state != ProposalState.QuietEndingPeriod) {
                    proposal.currentBoostedVotePeriodLimit = params.quietEndingPeriod;
                    proposal.state = ProposalState.QuietEndingPeriod;
                }
            }
            proposal.winningVote = _vote;
        }
        proposal.voters[_voter] = Voter({
            reputation: rep,
            vote: _vote,
            preBoosted:(proposal.state == ProposalState.PreBoosted)
        });
        proposal.totalVotes = rep.add(proposal.totalVotes);
        if (proposal.state != ProposalState.Boosted) {
            uint reputationDeposit = (params.votersReputationLossRatio * rep)/100;
            proposal.lostReputation += reputationDeposit;
            ControllerInterface(Avatar(proposal.avatar).owner()).mintReputation((-1) * int(reputationDeposit),_voter,proposal.avatar);
        }
        // Event:
        VoteProposal(_proposalId, _voter, _vote, rep);
        // execute the proposal if this vote was decisive:
        return execute(_proposalId);
    }

    /**
     * @dev _score return the proposal score
     * For dual choice proposal S = (S+) - (S-)
     * @param _proposalId the ID of the proposal
     * @return int proposal score.
     */
    function _score(bytes32 _proposalId) private view returns(int) {
        Proposal storage proposal = proposals[_proposalId];
        return int(proposal.stakes[YES]) - int(proposal.stakes[NO]);
    }
}
