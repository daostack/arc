# GenesisProtocol
[see the source](https://github.com/daostack/daostack/tree/master/contracts/VotingMachines/GenesisProtocol.sol)

*Code deposit cost: **less than 2022200 gas.***

*Execution cost: **less than 42795 gas.***

*Total deploy cost(deposit + execution): **less than 2064995 gas.***

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
#### *function* staker

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_staker** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*


#### *function* parameters

*Execution cost: **less than 2119 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **reputationSystem** *of type address*
2. **nonBoostedVoteRequiredPercentage** *of type uint256*
3. **nonBoostedVotePeriodLimit** *of type uint256*
4. **boostedVotePeriodLimit** *of type uint256*
5. **scoreThreshold** *of type uint256*
6. **governanceFormulasInterface** *of type address*
7. **minimumStakingFee** *of type uint256*


#### *function* redeemAmount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_player** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* updateParameters

*Execution cost: **less than 20572 gas.***

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


#### *function* proposals

*Execution cost: **less than 2945 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **avatar** *of type address*
2. **numOfChoices** *of type uint256*
3. **executable** *of type address*
4. **totalVotes** *of type uint256*
5. **totalStakes** *of type uint256*
6. **submittedTime** *of type uint256*
7. **boostedPhaseTime** *of type uint256*
8. **state** *of type uint8*
9. **winningVote** *of type uint256*


#### *function* proposalAvatar
> proposalAvatar return the avatar for a given proposal

*Execution cost: **less than 1387 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply

#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23511 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* winningVote
> voteStake return the winningVote for a given proposal

*Execution cost: **less than 690 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint winningVote

#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_reputationSystem** *of type address*
2. **_nonBoostedVoteRequiredPercentage** *of type uint256*
3. **_nonBoostedVotePeriodLimit** *of type uint256*
4. **_boostedVotePeriodLimit** *of type uint256*
5. **_scoreThreshold** *of type uint256*
6. **_governanceFormulasInterface** *of type address*
7. **_minimumStakingFee** *of type uint256*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* scoreThreshold
> scoreThreshold return the initial scoreThreshold param which is set for a given organization.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization's avatar*

uint total reputation supply

#### *function* state
> voteStake return the state for a given proposal

*Execution cost: **less than 804 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

ProposalState proposal state

#### *function* voteStake

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* stakingToken

*Execution cost: **less than 875 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* proposalStatus
> proposalStatus return the total votes and stakes for a given proposal

*Execution cost: **less than 1070 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint totalVotesuint totalStakes

#### *function* shouldBoost
> shouldBoost check if a proposal should be shifted to boosted phase.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.

#### *function* propose

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_numOfChoices** *of type uint256*
2. **_paramsHash** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* voteInfo

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*


#### *function* redeem
> redeem redeem a reward for a successful stake.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.

#### *function* votesStatus
> votesStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

votes array of votes for each choice

#### *function* score
> score return the proposal score

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint proposal score.

#### *function* vote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* totalReputationSupply
> totalReputationSupply return the total reputation supply for a given proposal

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply

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

uint scoreThreshold.

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

*Execution cost: **less than 985 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* orgBoostedProposalsCnt

*Execution cost: **less than 1221 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* isVotable
> isVotable check if the proposal is votable

*Execution cost: **less than 1443 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false

#### *function* hashedParameters

*Execution cost: **less than 1184 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_reputationSystem** *of type address*
2. **_nonBoostedVoteRequiredPercentage** *of type uint256*
3. **_nonBoostedVotePeriodLimit** *of type uint256*
4. **_boostedVotePeriodLimit** *of type uint256*
5. **_scoreThreshold** *of type uint256*
6. **_governanceFormulasInterface** *of type address*
7. **_minimumStakingFee** *of type uint256*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* getNumberOfChoices
> getNumberOfChoices returns the number of choices possible in this proposal

*Execution cost: **less than 998 gas.***

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

*Execution cost: **less than 1321 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*

*Nothing*


#### *function* cancelProposal
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **less than 1106 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the proposal ID*

*Returns:*

1. **unnamed** *of type bool*


