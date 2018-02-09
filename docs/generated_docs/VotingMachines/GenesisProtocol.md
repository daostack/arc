# GenesisProtocol
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/GenesisProtocol.sol)

*Code deposit cost: **less than 2888400 gas.***

*Execution cost: **less than 43815 gas.***

*Total deploy cost(deposit + execution): **less than 2932215 gas.***

> A governance contract -an organization's voting machine scheme.

## Constructors
### GenesisProtocol(address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_stakingToken** *of type address*


## Events
### VoteProposal(bytes32, address, uint256, uint256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*

---
### Stake(bytes32, address, uint256, uint256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_amount** *of type uint256*

---
### RedeemReputation(bytes32, address, int256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*

---
### Redeem(bytes32, address, uint256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*

---
### NewProposal(bytes32, uint256, address, bytes32)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_numOfChoices** *of type uint256*
3. **_proposer** *of type address*
4. **_paramsHash** *of type bytes32*

---
### ExecuteProposal(bytes32, uint256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_decision** *of type uint256*


## Fallback
*Nothing*
## Functions
### getRedeemableReputationStaker(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type int256*

---
### parameters(bytes32)

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

---
### proposalAvatar(bytes32)
> proposalAvatar return the avatar for a given proposal

*Execution cost: **less than 1519 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply
---
### voteInfo(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*

---
### updateParameters(bytes32)

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### stake(bytes32, uint256, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_amount** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### proposals(bytes32)

*Execution cost: **less than 4066 gas.***

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

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23712 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### score(bytes32)
> score return the proposal score

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint proposal score.
---
### winningVote(bytes32)
> voteStake return the winningVote for a given proposal

*Execution cost: **less than 712 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint winningVote
---
### scoreThresholdParams(address)
> scoreThresholdParams return the score threshold params for a given organization.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization's avatar*

uint thresholdConstAuint thresholdConstB
---
### state(bytes32)
> voteStake return the state for a given proposal

*Execution cost: **less than 804 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

ProposalState proposal state
---
### setParameters(uint256[12], address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type uint256[12]*
2. **_governanceFormulasInterface** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### voteStake(bytes32, uint256)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type uint256*

---
### stakingToken()

*Execution cost: **less than 897 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### proposalStatus(bytes32)
> proposalStatus return the total votes and stakes for a given proposal

*Execution cost: **less than 1330 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint totalVotesuint totalStakesuint voterStakes
---
### shouldBoost(bytes32)
> shouldBoost check if a proposal should be shifted to boosted phase.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.
---
### staker(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_staker** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*

---
### totalReputationSupply(bytes32)
> totalReputationSupply return the total reputation supply for a given proposal

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint total reputation supply
---
### redeem(bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### propose(uint256, bytes32, address, address, address)

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

---
### vote(bytes32, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### threshold(address)
> threshold return the organization's score threshold which required by a proposal to shift to boosted state. This threshold is dynamically set and it depend on the number of boosted proposal.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization avatar*

int thresholdConstA.
---
### voteWithSpecifiedAmounts(bytes32, uint256, uint256, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **unnamed** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### voteStatus(bytes32, uint256)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_choice** *of type uint256*

*Returns:*

1. **unnamed** *of type uint256*

---
### cancelProposal(bytes32)
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **less than 1485 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the proposal ID*

*Returns:*

1. **unnamed** *of type bool*

---
### hashedParameters()

*Execution cost: **less than 1316 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### isVotable(bytes32)
> isVotable check if the proposal is votable

*Execution cost: **less than 1826 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false
---
### ownerVote(bytes32, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **unnamed** *of type uint256*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### orgBoostedProposalsCnt(address)

*Execution cost: **less than 1397 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### owner()

*Execution cost: **less than 985 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### getRedeemableTokensVoter(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### getRedeemableTokensStaker(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### getRedeemableReputationVoter(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type int256*

---
### getRedeemableReputationProposer(bytes32)
> getRedeemableReputationProposer return the redeemable reputation which a proposer is entitle to.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

int proposer redeem reputation.
---
### getParametersHash(uint256[12], address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_params** *of type uint256[12]*
2. **_governanceFormulasInterface** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getNumberOfChoices(bytes32)
> getNumberOfChoices returns the number of choices possible in this proposal

*Execution cost: **less than 998 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposals*

uint that contains number of choices
---
### execute(bytes32)
> execute check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the id of the proposal*

bool true - the proposal has been executed             false - otherwise.
---
### cancelVote(bytes32)
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Execution cost: **less than 1656 gas.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*

*Nothing*

---
### YES()

*Execution cost: **less than 786 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*

---
### NO()

*Execution cost: **less than 280 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


