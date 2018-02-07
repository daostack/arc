# GenesisProtocol
[see the source](https://github.com/daostack/daostack/tree/master/contracts/VotingMachines/GenesisProtocol.sol)

*Code deposit cost: **less than 2967800 gas.***

*Execution cost: **less than 43908 gas.***

*Total deploy cost(deposit + execution): **less than 3011708 gas.***

> A governance contract -an organization's voting machine scheme.


## Reference
### Constructors
#### *constructor* GenesisProtocol(address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_stakingToken** *of type address*


### Events
#### *event* VoteProposal
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*


#### *event* Stake
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_amount** *of type uint256*


#### *event* RedeemReputation
*Params:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*


#### *event* Redeem
*Params:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*


#### *event* OwnershipTransferred
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


#### *event* NewProposal
*Params:*

1. **_proposalId** *of type bytes32*
2. **_numOfChoices** *of type uint256*
3. **_proposer** *of type address*
4. **_paramsHash** *of type bytes32*


#### *event* ExecuteProposal
*Params:*

1. **_proposalId** *of type bytes32*
2. **_decision** *of type uint256*


### Fallback
*Nothing*
### Functions
#### *function* shouldBoost
> shouldBoost check if a proposal should be shifted to boosted phase.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.

#### *function* parameters

*Execution cost: **less than 3496 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **preBoostedVoteRequiredPercentage** *of type uint256*
2. **preBoostedVotePeriodLimit** *of type uint256*
3. **boostedVotePeriodLimit** *of type uint256*
4. **thresholdConstA** *of type uint256*
5. **thresholdConstB** *of type uint256*
6. **governanceFormulasInterface** *of type address*
7. **minimumStakingFee** *of type uint256*
8. **quietEndingPeriod** *of type uint256*
9. **proposingRepRewardConstA** *of type uint256*
10. **proposingRepRewardConstB** *of type uint256*
11. **stakerFeeRatioForVoters** *of type uint256*
12. **votersReputationLossRatio** *of type uint256*
13. **votersGainRepRatioFromLostRep** *of type uint256*


#### *function* voteInfo

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*


#### *function* redeemAmount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* updateParameters

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* stake

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_amount** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* redeemVoterReputation

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type int256*


#### *function* proposals

*Execution cost: **less than 4088 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **avatar** *of type address*
2. **numOfChoices** *of type uint256*
3. **executable** *of type address*
4. **totalVotes** *of type uint256*
5. **totalStakes** *of type uint256*
6. **votersStakes** *of type uint256*
7. **lostReputation** *of type uint256*
8. **submittedTime** *of type uint256*
9. **boostedPhaseTime** *of type uint256*
10. **state** *of type uint8*
11. **winningVote** *of type uint256*
12. **proposer** *of type address*
13. **boostedVotePeriodLimit** *of type uint256*


#### *function* proposalAvatar
> proposalAvatar return the avatar for a given proposal

*Execution cost: **less than 1475 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply

#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23668 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* redeemStakerRepAmount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type int256*


#### *function* winningVote
> voteStake return the winningVote for a given proposal

*Execution cost: **less than 756 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint winningVote

#### *function* scoreThresholdParams
> scoreThresholdParams return the score threshold params for a given organization.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization's avatar*

uint thresholdConstAuint thresholdConstB

#### *function* redeemProposerReputation
> redeemProposerReputation return the redeem amount which a proposer is entitle to.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

int proposer redeem reputation.

#### *function* state
> voteStake return the state for a given proposal

*Execution cost: **less than 870 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

ProposalState proposal state

#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type uint256[12]*
2. **_governanceFormulasInterface** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* voteStake

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* stakingToken

*Execution cost: **less than 963 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* proposalStatus
> proposalStatus return the total votes and stakes for a given proposal

*Execution cost: **less than 1396 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint totalVotesuint totalStakesuint voterStakes

#### *function* propose

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_numOfChoices** *of type uint256*
2. **_paramsHash** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*
5. **_proposer** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* staker

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_staker** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*


#### *function* score
> score return the proposal score

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint proposal score.

#### *function* votesStatus
> votesStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

votes array of votes for each choice

#### *function* totalReputationSupply
> totalReputationSupply return the total reputation supply for a given proposal

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply

#### *function* vote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* redeem

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* redeemVoterAmount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* voteWithSpecifiedAmounts

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **unnamed** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* threshold
> threshold return the organization's score threshold which required by a proposal to shift to boosted state. This threshold is dynamically set and it depend on the number of boosted proposal.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization avatar*

int thresholdConstA.

#### *function* ownerVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **unnamed** *of type uint256*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* owner

*Execution cost: **less than 1051 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* orgBoostedProposalsCnt

*Execution cost: **less than 1353 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* isVotable
> isVotable check if the proposal is votable

*Execution cost: **less than 1848 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false

#### *function* hashedParameters

*Execution cost: **less than 1272 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_params** *of type uint256[12]*
2. **_governanceFormulasInterface** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* getNumberOfChoices
> getNumberOfChoices returns the number of choices possible in this proposal

*Execution cost: **less than 1064 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposals*

uint that contains number of choices

#### *function* execute
> execute check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the id of the proposal*

bool true - the proposal has been executed             false - otherwise.

#### *function* cancelVote
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Execution cost: **less than 1744 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*

*Nothing*


#### *function* cancelProposal
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **less than 1507 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the proposal ID*

*Returns:*

1. **unnamed** *of type bool*


