# GenesisProtocol
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/GenesisProtocol.sol)
> GenesisProtocol implementation -an organization's voting machine scheme.


**Execution cost**: less than 43094 gas

**Deployment cost**: less than 2281600 gas

**Combined cost**: less than 2324694 gas

## Constructor



Params:

1. **_stakingToken** *of type `address`*

## Events
### ExecuteProposal(bytes32,uint256,uint256,uint8)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_decision** *of type `uint256`*
3. **_totalReputation** *of type `uint256`*
4. **_executionState** *of type `uint8`*

--- 
### NewProposal(bytes32,uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_numOfChoices** *of type `uint256`*
3. **_proposer** *of type `address`*
4. **_paramsHash** *of type `bytes32`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### Redeem(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### RedeemReputation(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### Stake(bytes32,address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_voter** *of type `address`*
3. **_vote** *of type `uint256`*
4. **_amount** *of type `uint256`*

--- 
### VoteProposal(bytes32,address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_voter** *of type `address`*
3. **_vote** *of type `uint256`*
4. **_reputation** *of type `uint256`*


## Methods
### owner()


**Execution cost**: less than 1051 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### hashedParameters()


**Execution cost**: less than 1360 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### getRedeemableReputationProposer(bytes32)
>
> getRedeemableReputationProposer return the redeemable reputation which a proposer is entitle to.


**Execution cost**: less than 5256 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint proposer redeem reputation.

1. **output_0** *of type `uint256`*

--- 
### NO()


**Execution cost**: less than 302 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getRedeemableReputationVoter(bytes32,address)
>
> getRedeemableReputationVoter return the redeemable reputation which a voter is entitle to.


**Execution cost**: less than 6954 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_beneficiary** *of type `address`*

    > the beneficiary .


Returns:

> uint voter redeem reputation amount.

1. **output_0** *of type `uint256`*

--- 
### execute(bytes32)
>
> execute check if the proposal has been decided, and if so, execute the proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the id of the proposal


Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### getRedeemableTokensVoter(bytes32,address)
>
> getRedeemableTokensVoter return the redeemable amount which a voter is entitle to.


**Execution cost**: less than 2149 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_beneficiary** *of type `address`*

    > the beneficiary .


Returns:

> uint voter redeem token amount.

1. **output_0** *of type `uint256`*

--- 
### YES()


**Execution cost**: less than 874 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getRedeemableTokensStaker(bytes32,address)
>
> getRedeemableTokensStaker return the redeem amount which a certain staker is entitle to.


**Execution cost**: less than 2611 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_beneficiary** *of type `address`*

    > the beneficiary .


Returns:

> uint redeem amount .

1. **output_0** *of type `uint256`*

--- 
### getNumberOfChoices(bytes32)
>
> getNumberOfChoices returns the number of choices possible in this proposal


**Execution cost**: less than 1086 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposals


Returns:

> uint that contains number of choices

1. **output_0** *of type `uint256`*

--- 
### getRedeemableReputationStaker(bytes32,address)
>
> getRedeemableReputationStaker return the redeemable reputation which a staker is entitle to.


**Execution cost**: less than 6470 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_beneficiary** *of type `address`*

    > the beneficiary .


Returns:

> uint staker redeem reputation amount.

1. **output_0** *of type `uint256`*

--- 
### cancelProposal(bytes32)
>
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.


**Execution cost**: less than 492 gas


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### NUM_OF_CHOICES()


**Execution cost**: less than 742 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### cancelVote(bytes32)
>
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct


**Execution cost**: less than 1722 gas


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal



--- 
### getParametersHash(uint256[12])
>
> hashParameters returns a hash of the given parameters


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_params** *of type `uint256[12]`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### updateParameters(bytes32)


**Execution cost**: less than 20660 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


--- 
### parameters(bytes32)


**Execution cost**: less than 3101 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **preBoostedVoteRequiredPercentage** *of type `uint256`*
2. **preBoostedVotePeriodLimit** *of type `uint256`*
3. **boostedVotePeriodLimit** *of type `uint256`*
4. **thresholdConstA** *of type `uint256`*
5. **thresholdConstB** *of type `uint256`*
6. **minimumStakingFee** *of type `uint256`*
7. **quietEndingPeriod** *of type `uint256`*
8. **proposingRepRewardConstA** *of type `uint256`*
9. **proposingRepRewardConstB** *of type `uint256`*
10. **stakerFeeRatioForVoters** *of type `uint256`*
11. **votersReputationLossRatio** *of type `uint256`*
12. **votersGainRepRatioFromLostRep** *of type `uint256`*

--- 
### orgBoostedProposalsCnt(address)


**Execution cost**: less than 1419 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### isVotable(bytes32)
>
> isVotable check if the proposal is votable


**Execution cost**: less than 1914 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### ownerVote(bytes32,uint256,address)
>
> voting function with owner functionality (can vote on behalf of someone else)


**Execution cost**: less than 564 gas


Params:

1. **param_0** *of type `bytes32`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `address`*

Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### isAbstainAllow()
>
> isAbstainAllow returns if the voting machine allow abstain (0)


**Execution cost**: less than 529 gas

**Attributes**: constant



Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### proposalsCnt()


**Execution cost**: less than 568 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### scoreThresholdParams(address)
>
> scoreThresholdParams return the score threshold params for a given organization.


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_avatar** *of type `address`*

    > the organization's avatar


Returns:

> uint thresholdConstAuint thresholdConstB

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### proposalAvatar(bytes32)
>
> proposalAvatar return the avatar for a given proposal


**Execution cost**: less than 1563 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint total reputation supply

1. **output_0** *of type `address`*

--- 
### propose(uint256,bytes32,address,address,address)
>
> register a new proposal with the given parameters. Every proposal has a unique ID which is being generated by calculating keccak256 of a incremented counter.


**Execution cost**: No bound available


Params:

1. **_numOfChoices** *of type `uint256`*

    > number of voting choices

2. **param_1** *of type `bytes32`*
3. **_avatar** *of type `address`*

    > an address to be sent as the payload to the _executable contract.

4. **_executable** *of type `address`*

    > This contract will be executed when vote is over.

5. **_proposer** *of type `address`*

    > address


Returns:

> proposal's id.

1. **output_0** *of type `bytes32`*

--- 
### score(bytes32)
>
> score return the proposal score


**Execution cost**: less than 1634 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint proposal score.

1. **output_0** *of type `int256`*

--- 
### proposals(bytes32)


**Execution cost**: less than 4147 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **avatar** *of type `address`*
2. **numOfChoices** *of type `uint256`*
3. **executable** *of type `address`*
4. **totalVotes** *of type `uint256`*
5. **votersStakes** *of type `uint256`*
6. **lostReputation** *of type `uint256`*
7. **submittedTime** *of type `uint256`*
8. **boostedPhaseTime** *of type `uint256`*
9. **state** *of type `uint8`*
10. **winningVote** *of type `uint256`*
11. **proposer** *of type `address`*
12. **currentBoostedVotePeriodLimit** *of type `uint256`*
13. **paramsHash** *of type `bytes32`*

--- 
### redeem(bytes32,address)
>
> redeem a reward for a successful stake, vote or proposing. The function use a beneficiary address as a parameter (and not msg.sender) to enable users to redeem on behalf of someone else.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_beneficiary** *of type `address`*

    > - the beneficiary address


Returns:

> bool true or false.

1. **output_0** *of type `bool`*

--- 
### proposalStatus(bytes32)
>
> proposalStatus return the total votes and stakes for a given proposal


**Execution cost**: less than 1637 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint totalVotesuint stakersStakesuint totalRedeemableStakesuint voterStakes

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*
3. **output_2** *of type `uint256`*
4. **output_3** *of type `uint256`*

--- 
### voteInfo(bytes32,address)
>
> voteInfo returns the vote and the amount of reputation of the user committed to this proposal


**Execution cost**: less than 1533 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_voter** *of type `address`*

    > the address of the voter


Returns:

> uint vote - the voters vote       uint reputation - amount of reputation committed by _voter to _proposalId

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### state(bytes32)
>
> voteStake return the state for a given proposal


**Execution cost**: less than 892 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> ProposalState proposal state

1. **output_0** *of type `uint8`*

--- 
### stake(bytes32,uint256,uint256)
>
> staking function


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal

2. **_vote** *of type `uint256`*

    > NO(2) or YES(1).

3. **_amount** *of type `uint256`*

    > the betting amount


Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### staker(bytes32,address)
>
> staker return the vote and stake amount for a given proposal and staker


**Execution cost**: less than 1430 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_staker** *of type `address`*

    > staker address


Returns:

> uint voteuint amount

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### stakingToken()


**Execution cost**: less than 963 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### shouldBoost(bytes32)
>
> shouldBoost check if a proposal should be shifted to boosted phase.


**Execution cost**: less than 7073 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> bool true or false.

1. **output_0** *of type `bool`*

--- 
### setParameters(uint256[12])
>
> hash the parameters, save them if necessary, and return the hash value


**Execution cost**: No bound available


Params:

1. **_params** *of type `uint256[12]`*

    > a parameters array   _params[0] - _preBoostedVoteRequiredPercentage,   _params[1] - _preBoostedVotePeriodLimit, //the time limit for a proposal to be in an absolute voting mode.   _params[2] -_boostedVotePeriodLimit, //the time limit for a proposal to be in an relative voting mode.   _params[3] -_thresholdConstA,   _params[4] -_thresholdConstB,   _params[5] -_minimumStakingFee,   _params[6] -_quietEndingPeriod,   _params[7] -_proposingRepRewardConstA,   _params[8] -_proposingRepRewardConstB,   _params[9] -_stakerFeeRatioForVoters,   _params[10] -_votersReputationLossRatio,   _params[11] -_votersGainRepRatioFromLostRep


Returns:


1. **output_0** *of type `bytes32`*

--- 
### threshold(bytes32,address)
>
> threshold return the organization's score threshold which required by a proposal to shift to boosted state. This threshold is dynamically set and it depend on the number of boosted proposal.


**Execution cost**: less than 6559 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*
2. **_avatar** *of type `address`*

    > the organization avatar


Returns:

> int organization's score threshold.

1. **output_0** *of type `int256`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23687 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### vote(bytes32,uint256)
>
> voting function


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal

2. **_vote** *of type `uint256`*

    > NO(2) or YES(1).


Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### voteStake(bytes32,uint256)
>
> voteStake return the amount stakes for a given proposal and vote


**Execution cost**: less than 947 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_vote** *of type `uint256`*

    > vote number


Returns:

> uint stake amount

1. **output_0** *of type `uint256`*

--- 
### voteStatus(bytes32,uint256)
>
> voteStatus returns the reputation voted for a proposal for a specific voting choice.


**Execution cost**: less than 1255 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_choice** *of type `uint256`*

    > the index in the


Returns:

> voted reputation for the given choice

1. **output_0** *of type `uint256`*

--- 
### voteWithSpecifiedAmounts(bytes32,uint256,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_vote** *of type `uint256`*
3. **_rep** *of type `uint256`*
4. **param_3** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### winningVote(bytes32)
>
> voteStake return the winningVote for a given proposal


**Execution cost**: less than 778 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint winningVote

1. **output_0** *of type `uint256`*

[Back to the top ↑](#genesisprotocol)
