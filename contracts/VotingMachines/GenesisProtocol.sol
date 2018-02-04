pragma solidity ^0.4.19;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "../universalSchemes/UniversalScheme.sol";
import "./GenesisProtocolFormulasInterface.sol";


/**
 * @title A governance contract -an organization's voting machine scheme.
 */
contract GenesisProtocol is IntVoteInterface,UniversalScheme,GenesisProtocolFormulasInterface {
    using SafeMath for uint;

    enum ProposalState { Closed, Executed, NotBoosted, Boosted }

    struct Parameters {
        Reputation reputationSystem; // the reputation system that is being used
        uint nonBoostedVoteRequiredPercentage; // the absolute vote percentages bar.
        uint nonBoostedVotePeriodLimit; //the time limit for a proposal to be in an absolute voting mode.
        uint boostedVotePeriodLimit; //the time limit for a proposal to be in an relative voting mode.
        uint scoreThreshold;
        GenesisProtocolFormulasInterface governanceFormulasInterface;
        uint minimumStakingFee;
    }
    struct Voter {
        uint vote; // 0 - 'abstain'
        uint reputation; // amount of voter's reputation
    }

    struct Staker {
        uint vote; // 0 - 'abstain'
        uint amount; // amount of voter's reputation
    }

    struct Proposal {
        address avatar; // the organization's avatar the proposal is target to.
        uint numOfChoices;
        ExecutableInterface executable; // will be executed if the proposal will pass
        uint totalVotes;
        uint totalStakes;
        uint submittedTime;
        uint boostedPhaseTime; //the time the proposal shift to relative mode.
        ProposalState state;
        uint winningVote; //the winning vote.
        mapping(uint=>uint) votes;
        mapping(address=>Voter) voters;
        mapping(uint=>uint) stakes;
        mapping(address=>Staker) stakers;
    }

    event NewProposal(bytes32 indexed _proposalId, uint _numOfChoices, address _proposer, bytes32 _paramsHash);
    event ExecuteProposal(bytes32 indexed _proposalId, uint _decision);
    event VoteProposal(bytes32 indexed _proposalId, address indexed _voter, uint _vote, uint _reputation);
    event Stake(bytes32 indexed _proposalId, address indexed _voter,uint _vote,uint _amount);
    event Redeem(bytes32 indexed _proposalId, address indexed _beneficiary,uint _amount);

    mapping(bytes32=>Parameters) public parameters;  // A mapping from hashes to parameters
    mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

    uint constant MAX_NUM_OF_CHOICES = 10;
    uint proposalsCnt; // Total amount of proposals
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
        require((proposals[_proposalId].state == ProposalState.NotBoosted) || (proposals[_proposalId].state == ProposalState.Boosted));
        _;
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
    */
    function setParameters(
        Reputation _reputationSystem, // the reputation system that is being used
        uint _nonBoostedVoteRequiredPercentage, // the absolute vote percentages bar.
        uint _nonBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
        uint _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
        uint _scoreThreshold,
        GenesisProtocolFormulasInterface _governanceFormulasInterface,
        uint _minimumStakingFee)
    public
    returns(bytes32)
    {
        require(_nonBoostedVoteRequiredPercentage <= 100 && _nonBoostedVoteRequiredPercentage > 0);
        bytes32 hashedParameters = getParametersHash(
            _reputationSystem,
            _nonBoostedVoteRequiredPercentage,
            _nonBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
            _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
            _scoreThreshold,
            _governanceFormulasInterface,
            _minimumStakingFee);
        parameters[hashedParameters] = Parameters({
            reputationSystem: _reputationSystem,
            nonBoostedVoteRequiredPercentage: _nonBoostedVoteRequiredPercentage,
            nonBoostedVotePeriodLimit: _nonBoostedVotePeriodLimit,
            boostedVotePeriodLimit: _boostedVotePeriodLimit,
            scoreThreshold:_scoreThreshold,
            governanceFormulasInterface:_governanceFormulasInterface,
            minimumStakingFee: _minimumStakingFee
        });
        return hashedParameters;
    }

  /**
   * @dev hashParameters returns a hash of the given parameters
   */
    function getParametersHash(
        Reputation _reputationSystem, // the reputation system that is being used
        uint _nonBoostedVoteRequiredPercentage, // the absolute vote percentages bar.
        uint _nonBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
        uint _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
        uint _scoreThreshold,
        GenesisProtocolFormulasInterface _governanceFormulasInterface,
        uint _minimumStakingFee) public pure returns(bytes32)
        {
        return keccak256(
            _reputationSystem,
            _nonBoostedVoteRequiredPercentage,
            _nonBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
            _boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
            _scoreThreshold,
            _governanceFormulasInterface,
            _minimumStakingFee);
    }

  /**
   * @dev register a new proposal with the given parameters. Every proposal has a unique ID which is being
   * generated by calculating keccak256 of a incremented counter.
   * @param _paramsHash defined the parameters of the voting machine used for this proposal
   * @param _avatar an address to be sent as the payload to the _executable contract.
   * @param _executable This contract will be executed when vote is over.
   */
    function propose(uint _numOfChoices, bytes32 _paramsHash, address _avatar, ExecutableInterface _executable) public returns(bytes32) {
        // Check valid params and number of choices:
        require(parameters[_paramsHash].reputationSystem != address(0));
        require(_numOfChoices > 0 && _numOfChoices <= MAX_NUM_OF_CHOICES);
        require(ExecutableInterface(_executable) != address(0));
        // Generate a unique ID:
        bytes32 proposalId = keccak256(this, proposalsCnt);
        proposalsCnt++;
        // Open proposal:
        Proposal memory proposal;
        proposal.numOfChoices = _numOfChoices;
        proposal.avatar = _avatar;
        proposal.executable = _executable;
        proposal.state = ProposalState.NotBoosted;
        // solium-disable-next-line security/no-block-members
        proposal.submittedTime = now;
        proposals[proposalId] = proposal;
        NewProposal(proposalId, _numOfChoices, msg.sender, _paramsHash);
        return proposalId;
    }

  /**
   * @dev Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.
   * @param _proposalId the proposal ID
   */
    function cancelProposal(bytes32 _proposalId) public onlyProposalOwner(_proposalId) votable(_proposalId) returns(bool) {
        //This is not allowed.
        return false;
    }

    /**
     * @dev staking function
     * @param _proposalId id of the proposal
     * @param _vote a value between 0 to and the proposal number of choices.
     * @param _amount the betting amount
     * @return bool true - the proposal has been executed
     *              false - otherwise.
     */
    function stake(bytes32 _proposalId, uint _vote, uint _amount) public returns(bool) {
        if (execute(_proposalId)) {
            return true;
        }
        if (proposals[_proposalId].state != ProposalState.NotBoosted) {
            return false;
        }
        Proposal storage proposal = proposals[_proposalId];
        uint amount = _amount;
      // Check valid vote:
        require(_vote <= proposal.numOfChoices);
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory orgParams = parameters[paramsHash];
        assert(amount > orgParams.minimumStakingFee);
        stakingToken.transferFrom(msg.sender, address(this), amount);

        proposal.stakes[_vote] = amount.add(proposal.stakes[_vote]);
        proposal.totalStakes = amount.add(proposal.totalStakes);
        proposal.stakers[msg.sender] = Staker({
            amount: amount,
            vote: _vote
        });
      // Event:
        Stake(_proposalId, msg.sender, _vote, _amount);
      // execute the proposal if this vote was decisive:
        return execute(_proposalId);
    }

  /**
   * @dev voting function
   * @param _proposalId id of the proposal
   * @param _vote a value between 0 to and the proposal number of choices.
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function vote(bytes32 _proposalId, uint _vote) public votable(_proposalId) returns(bool) {
        return internalVote(_proposalId, msg.sender, _vote, 0);
    }

  /**
   * @dev voting function with owner functionality (can vote on behalf of someone else)
   * @param _proposalId id of the proposal
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function ownerVote(bytes32 _proposalId, uint , address ) public onlyProposalOwner(_proposalId) votable(_proposalId) returns(bool) {
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
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        Proposal storage proposal = proposals[_proposalId];
        Proposal memory tmpProposal;
        if (proposals[_proposalId].state == ProposalState.NotBoosted) {
            // solium-disable-next-line security/no-block-members
            if ((now - proposal.submittedTime) >= params.nonBoostedVotePeriodLimit) {
                tmpProposal = proposal;
                ExecuteProposal(_proposalId, 0);
                (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(0));
                proposals[_proposalId].state = ProposalState.Executed;
                return true;
             }
            uint executionBar = params.reputationSystem.totalSupply()*params.nonBoostedVoteRequiredPercentage/100;
        // Check if someone crossed the absolute vote execution bar.
            if (proposal.votes[proposal.winningVote] > executionBar) {
                tmpProposal = proposal;
                ExecuteProposal(_proposalId, proposal.winningVote);
                (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(proposal.winningVote));
                proposals[_proposalId].state = ProposalState.Executed;
                return true;
               }
           //check if the proposal crossed its absolutePhaseScoreLimit or nonBoostedVotePeriodLimit
            if ( shouldBoost(_proposalId)) {
                //change proposal mode to boosted mode.
                proposals[_proposalId].state = ProposalState.Boosted;
                // solium-disable-next-line security/no-block-members
                proposals[_proposalId].boostedPhaseTime = now;
                orgBoostedProposalsCnt[proposals[_proposalId].avatar]++;
              }
           }
        if (proposals[_proposalId].state == ProposalState.Boosted) {
         // this is the actual voting rule:
            // solium-disable-next-line security/no-block-members
            if ((now - proposal.boostedPhaseTime) >= params.boostedVotePeriodLimit) {
                tmpProposal = proposal;
                ExecuteProposal(_proposalId, proposal.winningVote);
                (tmpProposal.executable).execute(_proposalId, tmpProposal.avatar, int(proposal.winningVote));
                proposals[_proposalId].state = ProposalState.Executed;
                orgBoostedProposalsCnt[tmpProposal.avatar]--;
                return true;
         }
       }
        return false;
    }

    /**
     * @dev redeem redeem a reward for a successful stake.
     * @param _proposalId the ID of the proposal
     * @return bool true or false.
     */
    function redeem(bytes32 _proposalId) public returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state == ProposalState.Executed);
        require(proposal.stakers[msg.sender].amount>0);
        if (proposal.stakers[msg.sender].vote == proposals[_proposalId].winningVote) {
            uint _redeemAmount = redeemAmount(_proposalId,msg.sender);
            proposals[_proposalId].stakers[msg.sender].amount = 0;
            stakingToken.transfer(msg.sender, _redeemAmount);
            Redeem(_proposalId,msg.sender,_redeemAmount);
            return true;
        }
        return false;
    }

    /**
     * @dev shouldBoost check if a proposal should be shifted to boosted phase.
     * @param _proposalId the ID of the proposal
     * @return bool true or false.
     */
    function shouldBoost(bytes32 _proposalId) public view returns(bool) {
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        if (params.governanceFormulasInterface == GenesisProtocolFormulasInterface(0)) {
            Proposal storage proposal = proposals[_proposalId];
            uint score = (proposal.totalStakes * (proposal.totalVotes**2))/(params.reputationSystem.totalSupply()**2);
            return (score >= threshold(proposals[_proposalId].avatar));
        } else {
            return (params.governanceFormulasInterface).shouldBoost(_proposalId);
        }
    }

    /**
     * @dev score return the proposal score
     * @param _proposalId the ID of the proposal
     * @return uint proposal score.
     */
    function score(bytes32 _proposalId) public view returns(uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        if (params.governanceFormulasInterface == GenesisProtocolFormulasInterface(0)) {
            Proposal storage proposal = proposals[_proposalId];
            return (proposal.totalStakes * (proposal.totalVotes**2))/(params.reputationSystem.totalSupply()**2);
        } else {
            return (params.governanceFormulasInterface).score(_proposalId);
        }
    }

    /**
     * @dev threshold return the organization's score threshold which required by
     * a proposal to shift to boosted state.
     * This threshold is dynamically set and it depend on the number of boosted proposal.
     * @param _avatar the organization avatar
     * @return uint scoreThreshold.
     */
    function threshold(address _avatar) public view returns(uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(_avatar));
        Parameters memory params = parameters[paramsHash];
        if (params.governanceFormulasInterface == GenesisProtocolFormulasInterface(0)) {
            return params.scoreThreshold * (1 + orgBoostedProposalsCnt[_avatar]**2);
        } else {
            return (params.governanceFormulasInterface).threshold(_avatar);
        }
    }

    /**
     * @dev redeemAmount return the redeem amount which a certain staker is entitle too.
    * @param _proposalId the ID of the proposal
     * @return uint redeem amount .
     */
    function redeemAmount(bytes32 _proposalId,address _player) public view returns(uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        if (params.governanceFormulasInterface == GenesisProtocolFormulasInterface(0)) {
            Proposal storage proposal = proposals[_proposalId];
            return (proposal.stakers[_player].amount * proposal.totalStakes) / proposal.stakes[proposals[_proposalId].winningVote];
        } else {
            return (params.governanceFormulasInterface).redeemAmount(_proposalId,_player);
        }
    }

  /**
   * @dev getNumberOfChoices returns the number of choices possible in this proposal
   * @param _proposalId the ID of the proposals
   * @return uint that contains number of choices
   */
    function getNumberOfChoices(bytes32 _proposalId) public constant returns(uint) {
        return proposals[_proposalId].numOfChoices;
    }

  /**
   * @dev voteInfo returns the vote and the amount of reputation of the user committed to this proposal
   * @param _proposalId the ID of the proposal
   * @param _voter the address of the voter
   * @return uint vote - the voters vote
   *        uint reputation - amount of reputation committed by _voter to _proposalId
   */
    function voteInfo(bytes32 _proposalId, address _voter) public constant returns(uint, uint) {
        Voter memory voter = proposals[_proposalId].voters[_voter];
        return (voter.vote, voter.reputation);
    }

    /**
     * @dev votesStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id
     * @param _proposalId the ID of the proposal
     * @return votes array of votes for each choice
     */
    function votesStatus(bytes32 _proposalId) public constant returns(uint[11] votes) {
        Proposal storage proposal = proposals[_proposalId];
        for (uint cnt = 0; cnt <= proposal.numOfChoices; cnt++) {
            votes[cnt] = proposal.votes[cnt];
        }
    }

    /**
      * @dev isVotable check if the proposal is votable
      * @param _proposalId the ID of the proposal
      * @return bool true or false
    */
    function isVotable(bytes32 _proposalId) public constant returns(bool) {
        return ((proposals[_proposalId].state == ProposalState.NotBoosted) || (proposals[_proposalId].state == ProposalState.Boosted));
    }

    /**
      * @dev proposalStatus return the total votes and stakes for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint totalVotes
      * @return uint totalStakes
    */
    function proposalStatus(bytes32 _proposalId) public constant returns(uint, uint) {
        return (proposals[_proposalId].totalVotes,proposals[_proposalId].totalStakes);
    }

    /**
      * @dev totalReputationSupply return the total reputation supply for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint total reputation supply
    */
    function totalReputationSupply(bytes32 _proposalId) public constant returns(uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        return params.reputationSystem.totalSupply();
    }

    /**
      * @dev proposalAvatar return the avatar for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint total reputation supply
    */
    function proposalAvatar(bytes32 _proposalId) public constant returns(address) {
        return (proposals[_proposalId].avatar);
    }

    /**
      * @dev scoreThreshold return the initial scoreThreshold param which is set
      * for a given organization.
      * @param _avatar the organization's avatar
      * @return uint total reputation supply
    */
    function scoreThreshold(address _avatar) public constant returns(uint) {
        bytes32 paramsHash = getParametersFromController(Avatar(_avatar));
        Parameters memory params = parameters[paramsHash];
        return (params.scoreThreshold);
    }

    /**
      * @dev staker return the vote and stake amount for a given proposal and staker
      * @param _proposalId the ID of the proposal
      * @param _staker staker address
      * @return uint vote
      * @return uint amount
    */
    function staker(bytes32 _proposalId,address _staker) public constant returns(uint,uint) {
        return (proposals[_proposalId].stakers[_staker].vote,proposals[_proposalId].stakers[_staker].amount);
    }

    /**
      * @dev voteStake return the amount stakes for a given proposal and vote
      * @param _proposalId the ID of the proposal
      * @param _vote vote number
      * @return uint stake amount
    */
    function voteStake(bytes32 _proposalId,uint _vote) public constant returns(uint) {
        return proposals[_proposalId].stakes[_vote];
    }

    /**
      * @dev voteStake return the winningVote for a given proposal
      * @param _proposalId the ID of the proposal
      * @return uint winningVote
    */
    function winningVote(bytes32 _proposalId) public constant returns(uint) {
        return proposals[_proposalId].winningVote;
    }

    /**
      * @dev voteStake return the state for a given proposal
      * @param _proposalId the ID of the proposal
      * @return ProposalState proposal state
    */
    function state(bytes32 _proposalId) public constant returns(ProposalState) {
        return proposals[_proposalId].state;
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
        if (execute(_proposalId)) {
            return true;
        }
        bytes32 paramsHash = getParametersFromController(Avatar(proposals[_proposalId].avatar));
        Parameters memory params = parameters[paramsHash];
        Proposal storage proposal = proposals[_proposalId];
        // Check valid vote:
        require(_vote <= proposal.numOfChoices);
        // Check voter has enough reputation:
        uint reputation = params.reputationSystem.reputationOf(_voter);
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
            proposal.winningVote = _vote;
        }
        proposal.totalVotes = rep.add(proposal.totalVotes);
        proposal.voters[_voter] = Voter({
            reputation: rep,
            vote: _vote
        });
        // Event:
        VoteProposal(_proposalId, _voter, _vote, reputation);
        // execute the proposal if this vote was decisive:
        return execute(_proposalId);
    }
}
