pragma solidity ^0.4.24;

import "../controller/Reputation.sol";
import "./IntVoteInterface.sol";
import "../universalSchemes/UniversalScheme.sol";
import { RealMath } from "../libs/RealMath.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";
import { OrderStatisticTree } from "../libs/OrderStatisticTree.sol";

/**
 * @title GenesisProtocol implementation -an organization's voting machine scheme.
 */


contract GenesisProtocol is IntVoteInterface,UniversalScheme {
    using SafeMath for uint;
    using RealMath for int216;
    using RealMath for int256;
    using ECRecovery for bytes32;
    using OrderStatisticTree for OrderStatisticTree.Tree;

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
        uint proposingRepRewardConstA;//constant A for calculate proposer reward. proposerReward =(A*(RTotal) +B*(R+ - R-))/1000
        uint proposingRepRewardConstB;//constant B for calculate proposing reward.proposerReward =(A*(RTotal) +B*(R+ - R-))/1000
        uint stakerFeeRatioForVoters; // The “ratio of stake” to be paid to voters.
                                      // All stakers pay a portion of their stake to all voters, stakerFeeRatioForVoters * (s+ + s-).
                                      //All voters (pre and during boosting period) divide this portion in proportion to their reputation.
        uint votersReputationLossRatio;//Unsuccessful pre booster voters lose votersReputationLossRatio% of their reputation.
        uint votersGainRepRatioFromLostRep; //the percentages of the lost reputation which is divided by the successful pre boosted voters,
                                            //in proportion to their reputation.
                                            //The rest (100-votersGainRepRatioFromLostRep)% of lost reputation is divided between the successful wagers,
                                            //in proportion to their stake.
        uint daoBountyConst;//The DAO adds up a bounty for successful staker.
                            //The bounty formula is: s * daoBountyConst, where s+ is the wager staked for the proposal,
                            //and  daoBountyConst is a constant factor that is configurable and changeable by the DAO given.
                            //  daoBountyConst should be greater than stakerFeeRatioForVoters and less than 2 * stakerFeeRatioForVoters.
        uint daoBountyLimit;//The daoBounty cannot be greater than daoBountyLimit.



    }
    struct Voter {
        uint vote; // YES(1) ,NO(2)
        uint reputation; // amount of voter's reputation
        bool preBoosted;
    }

    struct Staker {
        uint vote; // YES(1) ,NO(2)
        uint amount; // amount of staker's stake
        uint amountForBounty; // amount of staker's stake which will be use for bounty calculation
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
        uint[2] totalStakes;// totalStakes[0] - (amount staked minus fee) - Total number of tokens staked which can be redeemable by stakers.
                            // totalStakes[1] - (amount staked) - Total number of redeemable tokens.
        ProposalState state;
        uint winningVote; //the winning vote.
        address proposer;
        uint currentBoostedVotePeriodLimit;
        bytes32 paramsHash;
        uint daoBountyRemain;
        mapping(uint=>uint) votes;
        mapping(address=>Voter) voters;
        mapping(uint=>uint) stakes;
        mapping(address=>Staker) stakers;
    }

    event GPExecuteProposal(bytes32 indexed _proposalId, ExecutionState _executionState);
    event Stake(bytes32 indexed _proposalId, address indexed _avatar, address indexed _staker,uint _vote,uint _amount);
    event Redeem(bytes32 indexed _proposalId, address indexed _avatar, address indexed _beneficiary,uint _amount);
    event RedeemDaoBounty(bytes32 indexed _proposalId, address indexed _avatar, address indexed _beneficiary,uint _amount);
    event RedeemReputation(bytes32 indexed _proposalId, address indexed _avatar, address indexed _beneficiary,uint _amount);

    mapping(bytes32=>Parameters) public parameters;  // A mapping from hashes to parameters
    mapping(bytes32=>Proposal) public proposals; // Mapping from the ID of the proposal to the proposal itself.

    mapping(bytes=>bool) stakeSignatures; //stake signatures

    uint constant public NUM_OF_CHOICES = 2;
    uint constant public NO = 2;
    uint constant public YES = 1;
    uint public proposalsCnt; // Total number of proposals
    mapping(address=>uint) public orgBoostedProposalsCnt;
    StandardToken public stakingToken;
    mapping(address=>OrderStatisticTree.Tree) proposalsExpiredTimes; //proposals expired times

    /**
     * @dev Constructor
     */
    constructor(StandardToken _stakingToken) public
    {
        stakingToken = _stakingToken;
    }

  /**
   * @dev Check that the proposal is votable (open and not executed yet)
   */
    modifier votable(bytes32 _proposalId) {
        require(_isVotable(_proposalId));
        _;
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
    function propose(uint _numOfChoices, bytes32 , address _avatar, ExecutableInterface _executable,address _proposer)
        external
        returns(bytes32)
    {
          // Check valid params and number of choices:
        require(_numOfChoices == NUM_OF_CHOICES);
        require(ExecutableInterface(_executable) != address(0));
        //Check parameters existence.
        bytes32 paramsHash = getParametersFromController(Avatar(_avatar));

        require(parameters[paramsHash].preBoostedVoteRequiredPercentage > 0);
        // Generate a unique ID:
        bytes32 proposalId = keccak256(abi.encodePacked(this, proposalsCnt));
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
        emit NewProposal(proposalId, _avatar, _numOfChoices, msg.sender, paramsHash);
        return proposalId;
    }

  /**
   * @dev Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.
   */
    function cancelProposal(bytes32 ) external returns(bool) {
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
    function stake(bytes32 _proposalId, uint _vote, uint _amount) external returns(bool) {
        return _stake(_proposalId,_vote,_amount,msg.sender);
    }

    // Digest describing the data the user signs according EIP 712.
    // Needs to match what is passed to Metamask.
    bytes32 public constant DELEGATION_HASH_EIP712 =
    keccak256(abi.encodePacked("address GenesisProtocolAddress","bytes32 ProposalId", "uint Vote","uint AmountToStake","uint Nonce"));
    // web3.eth.sign prefix
    string public constant ETH_SIGN_PREFIX= "\x19Ethereum Signed Message:\n32";

    /**
     * @dev stakeWithSignature function
     * @param _proposalId id of the proposal
     * @param _vote  NO(2) or YES(1).
     * @param _amount the betting amount
     * @param _nonce nonce value ,it is part of the signature to ensure that
              a signature can be received only once.
     * @param _signatureType signature type
              1 - for web3.eth.sign
              2 - for eth_signTypedData according to EIP #712.
     * @param _signature  - signed data by the staker
     * @return bool true - the proposal has been executed
     *              false - otherwise.
     */
    function stakeWithSignature(
        bytes32 _proposalId,
        uint _vote,
        uint _amount,
        uint _nonce,
        uint _signatureType,
        bytes _signature
        )
        external
        returns(bool)
        {
        require(stakeSignatures[_signature] == false);
        // Recreate the digest the user signed
        bytes32 delegationDigest;
        if (_signatureType == 2) {
            delegationDigest = keccak256(
                abi.encodePacked(
                    DELEGATION_HASH_EIP712, keccak256(
                        abi.encodePacked(
                           address(this),
                          _proposalId,
                          _vote,
                          _amount,
                          _nonce)))
            );
        } else {
            delegationDigest = keccak256(
                abi.encodePacked(
                    ETH_SIGN_PREFIX, keccak256(
                        abi.encodePacked(
                            address(this),
                           _proposalId,
                           _vote,
                           _amount,
                           _nonce)))
            );
        }
        address staker = delegationDigest.recover(_signature);
        //a garbage staker address due to wrong signature will revert due to lack of approval and funds.
        require(staker!=address(0));
        stakeSignatures[_signature] = true;
        return _stake(_proposalId,_vote,_amount,staker);
    }

  /**
   * @dev voting function
   * @param _proposalId id of the proposal
   * @param _vote NO(2) or YES(1).
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function vote(bytes32 _proposalId, uint _vote) external votable(_proposalId) returns(bool) {
        return internalVote(_proposalId, msg.sender, _vote, 0);
    }

  /**
   * @dev voting function with owner functionality (can vote on behalf of someone else)
   * @return bool true - the proposal has been executed
   *              false - otherwise.
   */
    function ownerVote(bytes32 , uint , address ) external returns(bool) {
      //This is not allowed.
        return false;
    }

    function voteWithSpecifiedAmounts(bytes32 _proposalId,uint _vote,uint _rep,uint) external votable(_proposalId) returns(bool) {
        return internalVote(_proposalId,msg.sender,_vote,_rep);
    }

  /**
   * @dev Cancel the vote of the msg.sender.
   * cancel vote is not allow in genesisProtocol so this function doing nothing.
   * This function is here in order to comply to the IntVoteInterface .
   */
    function cancelVote(bytes32 _proposalId) external votable(_proposalId) {
       //this is not allowed
        return;
    }

  /**
    * @dev getNumberOfChoices returns the number of choices possible in this proposal
    * @param _proposalId the ID of the proposals
    * @return uint that contains number of choices
    */
    function getNumberOfChoices(bytes32 _proposalId) external view returns(uint) {
        return proposals[_proposalId].numOfChoices;
    }

    /**
     * @dev voteInfo returns the vote and the amount of reputation of the user committed to this proposal
     * @param _proposalId the ID of the proposal
     * @param _voter the address of the voter
     * @return uint vote - the voters vote
     *        uint reputation - amount of reputation committed by _voter to _proposalId
     */
    function voteInfo(bytes32 _proposalId, address _voter) external view returns(uint, uint) {
        Voter memory voter = proposals[_proposalId].voters[_voter];
        return (voter.vote, voter.reputation);
    }

    /**
    * @dev voteStatus returns the reputation voted for a proposal for a specific voting choice.
    * @param _proposalId the ID of the proposal
    * @param _choice the index in the
    * @return voted reputation for the given choice
    */
    function voteStatus(bytes32 _proposalId,uint _choice) external view returns(uint) {
        return proposals[_proposalId].votes[_choice];
    }

    /**
    * @dev isVotable check if the proposal is votable
    * @param _proposalId the ID of the proposal
    * @return bool true or false
    */
    function isVotable(bytes32 _proposalId) external view returns(bool) {
        return _isVotable(_proposalId);
    }

    /**
    * @dev proposalStatus return the total votes and stakes for a given proposal
    * @param _proposalId the ID of the proposal
    * @return uint totalVotes
    * @return uint stakersStakes
    * @return uint totalRedeemableStakes
    * @return uint voterStakes
    */
    function proposalStatus(bytes32 _proposalId) external view returns(uint, uint, uint,uint) {
        return (proposals[_proposalId].totalVotes,
                proposals[_proposalId].totalStakes[0],
                proposals[_proposalId].totalStakes[1],
                proposals[_proposalId].votersStakes
        );
    }

  /**
    * @dev proposalAvatar return the avatar for a given proposal
    * @param _proposalId the ID of the proposal
    * @return uint total reputation supply
    */
    function proposalAvatar(bytes32 _proposalId) external view returns(address) {
        return (proposals[_proposalId].avatar);
    }

  /**
    * @dev scoreThresholdParams return the score threshold params for a given
    * organization.
    * @param _avatar the organization's avatar
    * @return uint thresholdConstA
    * @return uint thresholdConstB
    */
    function scoreThresholdParams(address _avatar) external view returns(uint,uint) {
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
    function staker(bytes32 _proposalId,address _staker) external view returns(uint,uint) {
        return (proposals[_proposalId].stakers[_staker].vote,proposals[_proposalId].stakers[_staker].amount);
    }

    /**
      * @dev voteStake return the amount stakes for a given proposal and vote
      * @param _proposalId the ID of the proposal
      * @param _vote vote number
      * @return uint stake amount
    */
    function voteStake(bytes32 _proposalId,uint _vote) external view returns(uint) {
        return proposals[_proposalId].stakes[_vote];
    }

  /**
    * @dev voteStake return the winningVote for a given proposal
    * @param _proposalId the ID of the proposal
    * @return uint winningVote
    */
    function winningVote(bytes32 _proposalId) external view returns(uint) {
        return proposals[_proposalId].winningVote;
    }

    /**
      * @dev voteStake return the state for a given proposal
      * @param _proposalId the ID of the proposal
      * @return ProposalState proposal state
    */
    function state(bytes32 _proposalId) external view returns(ProposalState) {
        return proposals[_proposalId].state;
    }

   /**
    * @dev isAbstainAllow returns if the voting machine allow abstain (0)
    * @return bool true or false
    */
    function isAbstainAllow() external pure returns(bool) {
        return false;
    }

    /**
     * @dev getAllowedRangeOfChoices returns the allowed range of choices for a voting machine.
     * @return min - minimum number of choices
               max - maximum number of choices
     */
    function getAllowedRangeOfChoices() external pure returns(uint min,uint max) {
        return (NUM_OF_CHOICES,NUM_OF_CHOICES);
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
                proposalsExpiredTimes[proposal.avatar].insert(proposal.boostedPhaseTime + proposal.currentBoostedVotePeriodLimit);
                orgBoostedProposalsCnt[proposal.avatar]++;
              }
           }

        if ((proposal.state == ProposalState.Boosted) ||
            (proposal.state == ProposalState.QuietEndingPeriod)) {
            // solium-disable-next-line security/no-block-members
            if ((now - proposal.boostedPhaseTime) >= proposal.currentBoostedVotePeriodLimit) {
                proposalsExpiredTimes[proposal.avatar].remove(proposal.boostedPhaseTime + proposal.currentBoostedVotePeriodLimit);
                orgBoostedProposalsCnt[tmpProposal.avatar] = orgBoostedProposalsCnt[tmpProposal.avatar].sub(1);
                proposal.state = ProposalState.Executed;
                executionState = ExecutionState.BoostedTimeOut;
             } else if (proposal.votes[proposal.winningVote] > executionBar) {
               // someone crossed the absolute vote execution bar.
                orgBoostedProposalsCnt[tmpProposal.avatar] = orgBoostedProposalsCnt[tmpProposal.avatar].sub(1);
                proposalsExpiredTimes[proposal.avatar].remove(proposal.boostedPhaseTime + proposal.currentBoostedVotePeriodLimit);
                proposal.state = ProposalState.Executed;
                executionState = ExecutionState.BoostedBarCrossed;
            }
       }
        if (executionState != ExecutionState.None) {
            if (proposal.winningVote == YES) {
                uint daoBountyRemain = (params.daoBountyConst.mul(proposal.stakes[proposal.winningVote]))/100;
                if (daoBountyRemain > params.daoBountyLimit) {
                    daoBountyRemain = params.daoBountyLimit;
                }
                proposal.daoBountyRemain = daoBountyRemain;
            }
            emit ExecuteProposal(_proposalId, proposal.avatar, proposal.winningVote, totalReputation);
            emit GPExecuteProposal(_proposalId, executionState);
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
        uint reputation;
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
            require(stakingToken.transfer(_beneficiary, amount));
            emit Redeem(_proposalId,proposal.avatar,_beneficiary,amount);
        }
        if (reputation != 0 ) {
            ControllerInterface(Avatar(proposal.avatar).owner()).mintReputation(reputation,_beneficiary,proposal.avatar);
            emit RedeemReputation(_proposalId,proposal.avatar,_beneficiary,reputation);
        }
        return true;
    }

    /**
     * @dev redeemDaoBounty a reward for a successful stake, vote or proposing.
     * The function use a beneficiary address as a parameter (and not msg.sender) to enable
     * users to redeem on behalf of someone else.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary - the beneficiary address
     * @return bool true or false.
     */
    function redeemDaoBounty(bytes32 _proposalId,address _beneficiary) public returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        require((proposal.state == ProposalState.Executed) || (proposal.state == ProposalState.Closed));
        uint amount;
        if ((proposal.stakers[_beneficiary].amountForBounty>0) &&
             (proposal.stakers[_beneficiary].vote == proposal.winningVote)) {
            //as staker
            amount = getRedeemableTokensStakerBounty(_proposalId,_beneficiary);
            proposal.stakers[_beneficiary].amountForBounty = 0;
        }
        if (amount != 0) {
            proposal.daoBountyRemain = proposal.daoBountyRemain.sub(amount);
            require(ControllerInterface(Avatar(proposal.avatar).owner()).externalTokenTransfer(stakingToken,_beneficiary,amount,proposal.avatar));
            emit RedeemDaoBounty(_proposalId,proposal.avatar,_beneficiary,amount);
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
        uint expiredProposals;
        if (proposalsExpiredTimes[_avatar].count() != 0) {
          // solium-disable-next-line security/no-block-members
            expiredProposals = proposalsExpiredTimes[_avatar].rank(now);
        }
        uint boostedProposals = orgBoostedProposalsCnt[_avatar].sub(expiredProposals);
        int216 e = 2;

        Parameters memory params = parameters[proposals[_proposalId].paramsHash];
        int256 power = int216(boostedProposals).toReal().div(int216(params.thresholdConstB).toReal());

        if (power.fromReal() > 100 ) {
            power = int216(100).toReal();
        }
        int256 res = int216(params.thresholdConstA).toReal().mul(e.toReal().pow(power));
        return res.fromReal();
    }

    /**
     * @dev getRedeemableTokensStakerBounty return the redeem bounty amount which a certain staker is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint redeem amount .
     */
    function getRedeemableTokensStakerBounty(bytes32 _proposalId,address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        uint totalWinningStakes = proposal.stakes[proposal.winningVote];
        if ((proposal.winningVote != YES)||(totalWinningStakes == 0)) {
            return 0;
        }
        uint beneficiaryLimit = (proposal.stakers[_beneficiary].amountForBounty.mul(params.daoBountyLimit)) / totalWinningStakes;
        uint bounty = (params.daoBountyConst.mul(proposal.stakers[_beneficiary].amountForBounty))/100;
        if (bounty > beneficiaryLimit) {
            bounty = beneficiaryLimit;
        }
        return bounty;
    }

    /**
     * @dev getRedeemableTokensStaker return the redeem amount which a certain staker is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint redeem amount .
     */
    function getRedeemableTokensStaker(bytes32 _proposalId,address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        uint totalWinningStakes = proposal.stakes[proposal.winningVote];
        if (totalWinningStakes == 0) {
        //this can be reached if the winningVote is NO
            return 0;
        }
        return (proposal.stakers[_beneficiary].amount * proposal.totalStakes[0]) / totalWinningStakes;
    }

    /**
     * @dev getRedeemableReputationProposer return the redeemable reputation which a proposer is entitle to.
     * @param _proposalId the ID of the proposal
     * @return uint proposer redeem reputation.
     */
    function getRedeemableReputationProposer(bytes32 _proposalId) public view returns(uint) {
        uint rep;
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.winningVote == NO) {
            rep = 0;
        } else {
            Parameters memory params = parameters[proposal.paramsHash];
            rep = (params.proposingRepRewardConstA.mul(proposal.totalVotes) + params.proposingRepRewardConstB.mul(proposal.votes[YES]-proposal.votes[NO]))/1000;
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
     * @return uint voter redeem reputation amount.
     */
    function getRedeemableReputationVoter(bytes32 _proposalId,address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        uint returnReputation;
        uint reputation = proposals[_proposalId].voters[_beneficiary].reputation;
        if (proposal.state == ProposalState.Closed) {
           //no reputation flow occurs so give back reputation for the voter
            return ((reputation * params.votersReputationLossRatio)/100);
        }
        if (proposal.totalVotes == 0) {
            return 0;
        }

        if (proposal.voters[_beneficiary].preBoosted && (proposal.winningVote == proposal.voters[_beneficiary].vote )) {
        //give back reputation for the voter
            returnReputation = (reputation * params.votersReputationLossRatio)/100;
        }
        return returnReputation + (reputation * ((proposal.lostReputation * params.votersGainRepRatioFromLostRep)/100)/proposal.totalVotes);
    }

    /**
     * @dev getRedeemableReputationStaker return the redeemable reputation which a staker is entitle to.
     * @param _proposalId the ID of the proposal
     * @param _beneficiary the beneficiary .
     * @return uint staker redeem reputation amount.
     */
    function getRedeemableReputationStaker(bytes32 _proposalId,address _beneficiary) public view returns(uint) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        uint rep;
        if (proposal.state == ProposalState.Closed) {
           //no reputation flow occurs so no reputation flow for staker
            return 0;
        }
        uint amount = proposal.stakers[_beneficiary].amount;
        if ((amount>0) &&
            (proposal.stakers[_beneficiary].vote == proposal.winningVote)) {
            rep = (amount * ( proposal.lostReputation - ((proposal.lostReputation * params.votersGainRepRatioFromLostRep)/100)))/proposal.stakes[proposal.winningVote];
        }
        return rep;
    }

    /**
     * @dev hash the parameters, save them if necessary, and return the hash value
     * @param _params a parameters array
     *    _params[0] - _preBoostedVoteRequiredPercentage,
     *    _params[1] - _preBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.
     *    _params[2] -_boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.
     *    _params[3] -_thresholdConstA
     *    _params[4] -_thresholdConstB
     *    _params[5] -_minimumStakingFee
     *    _params[6] -_quietEndingPeriod
     *    _params[7] -_proposingRepRewardConstA
     *    _params[8] -_proposingRepRewardConstB
     *    _params[9] -_stakerFeeRatioForVoters
     *    _params[10] -_votersReputationLossRatio
     *    _params[11] -_votersGainRepRatioFromLostRep
     *    _params[12] - _daoBountyConst
     *    _params[13] - _daoBountyLimit
    */
    function setParameters(
        uint[14] _params //use array here due to stack too deep issue.
    )
    public
    returns(bytes32)
    {
        require(_params[0] <= 100 && _params[0] > 0); //preBoostedVoteRequiredPercentage
        require(_params[4] > 0 && _params[4] <= 100000000); //_thresholdConstB cannot be zero.
        require(_params[3] <= 100000000 ether); //_thresholdConstA
        require(_params[9] <= 100); //stakerFeeRatioForVoters
        require(_params[10] <= 100); //votersReputationLossRatio
        require(_params[11] <= 100); //votersGainRepRatioFromLostRep
        require(_params[2] >= _params[6]); //boostedVotePeriodLimit >= quietEndingPeriod
        require(_params[7] <= 100000000); //_proposingRepRewardConstA
        require(_params[8] <= 100000000); //_proposingRepRewardConstB
        require(_params[12] < (2 * _params[9])); //_daoBountyConst < 2 * stakerFeeRatioForVoters
        require(_params[12] > _params[9]);//_daoBountyConst > stakerFeeRatioForVoters


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
            votersGainRepRatioFromLostRep:_params[11],
            daoBountyConst:_params[12],
            daoBountyLimit:_params[13]
        });
        return paramsHash;
    }

  /**
   * @dev hashParameters returns a hash of the given parameters
   */
    function getParametersHash(
        uint[14] _params) //use array here due to stack too deep issue.
        public
        pure
        returns(bytes32)
        {
        return keccak256(
            abi.encodePacked(
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
            _params[11],
            _params[12],
            _params[13]));
    }

    /**
     * @dev staking function
     * @param _proposalId id of the proposal
     * @param _vote  NO(2) or YES(1).
     * @param _amount the betting amount
     * @param _staker the staker address
     * @return bool true - the proposal has been executed
     *              false - otherwise.
     */
    function _stake(bytes32 _proposalId, uint _vote, uint _amount,address _staker) internal returns(bool) {
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
        Staker storage lstaker = proposal.stakers[_staker];
        if ((lstaker.amount > 0) && (lstaker.vote != _vote)) {
            return false;
        }

        uint amount = _amount;
        Parameters memory params = parameters[proposal.paramsHash];
        require(amount >= params.minimumStakingFee);
        require(stakingToken.transferFrom(_staker, address(this), amount));
        proposal.totalStakes[1] = proposal.totalStakes[1].add(amount); //update totalRedeemableStakes
        lstaker.amount += amount;
        lstaker.amountForBounty = lstaker.amount;
        lstaker.vote = _vote;

        proposal.votersStakes += (params.stakerFeeRatioForVoters * amount)/100;
        proposal.stakes[_vote] = amount.add(proposal.stakes[_vote]);
        amount = amount - ((params.stakerFeeRatioForVoters*amount)/100);
        proposal.totalStakes[0] = amount.add(proposal.totalStakes[0]);
      // Event:
        emit Stake(_proposalId, proposal.avatar, _staker, _vote, _amount);
      // execute the proposal if this vote was decisive:
        return execute(_proposalId);
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
    function internalVote(bytes32 _proposalId, address _voter, uint _vote, uint _rep) internal returns(bool) {
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
                if (proposal.state != ProposalState.QuietEndingPeriod) {
                    proposalsExpiredTimes[proposal.avatar].remove(proposal.boostedPhaseTime + proposal.currentBoostedVotePeriodLimit);
                    proposal.currentBoostedVotePeriodLimit = params.quietEndingPeriod;
                    proposalsExpiredTimes[proposal.avatar].insert(_now + proposal.currentBoostedVotePeriodLimit);
                    proposal.state = ProposalState.QuietEndingPeriod;
                }
                proposal.boostedPhaseTime = _now;
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
            ControllerInterface(Avatar(proposal.avatar).owner()).burnReputation(reputationDeposit,_voter,proposal.avatar);
        }
        // Event:
        emit VoteProposal(_proposalId, proposal.avatar, _voter, _vote, rep);
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

    /**
      * @dev _isVotable check if the proposal is votable
      * @param _proposalId the ID of the proposal
      * @return bool true or false
    */
    function _isVotable(bytes32 _proposalId) private view returns(bool) {
        ProposalState pState = proposals[_proposalId].state;
        return ((pState == ProposalState.PreBoosted)||(pState == ProposalState.Boosted)||(pState == ProposalState.QuietEndingPeriod));
    }
}
