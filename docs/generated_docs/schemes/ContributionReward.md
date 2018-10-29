# ContributionReward
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/ContributionReward.sol)
> A scheme for proposing and rewarding contributions to an organization


**Execution cost**: less than 22522 gas

**Deployment cost**: less than 2099000 gas

**Combined cost**: less than 2121522 gas

## Constructor




## Events
### NewContributionProposal(bytes32,bytes32,int256,uint256[5],address,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_contributionDescription** *of type `bytes32`*
3. **_reputationChange** *of type `int256`*
4. **_rewards** *of type `uint256[5]`*
5. **_externalToken** *of type `address`*
6. **_beneficiary** *of type `address`*

--- 
### ProposalExecuted(bytes32,int256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_param** *of type `int256`*

--- 
### RedeemEther(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### RedeemExternalToken(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### RedeemNativeToken(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### RedeemReputation(bytes32,address,int256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `int256`*


## Methods
### reputationOf(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_owner** *of type `address`*
2. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### burnReputation(uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### avatar()


**Execution cost**: less than 798 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### executeProposal(bytes32,int256)
>
> execution of proposals, can only be called by the voting machine in which the vote is held.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_param** *of type `int256`*

    > a parameter of the voting result, 1 yes and 2 is no.


Returns:


1. **output_0** *of type `bool`*

--- 
### getPeriodsToPay(bytes32,uint256)
>
> getPeriodsToPay return the periods left to be paid for reputation,nativeToken,ether or externalToken. The function ignore the reward amount to be paid (which can be zero).


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_redeemType** *of type `uint256`*

    > - the type of the reward  :        0 - reputation        1 - nativeTokenReward        2 - Ether        3 - ExternalToken


Returns:

> periods left to be paid.

1. **output_0** *of type `uint256`*

--- 
### getProposalEthReward(bytes32)


**Execution cost**: less than 833 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### redeemExternalToken(bytes32)
>
> RedeemNativeToken reward for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine


Returns:

> amount the external token redeemed amount

1. **amount** *of type `uint256`*

--- 
### getProposalExternalTokenReward(bytes32)


**Execution cost**: less than 679 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### redeemEther(bytes32)
>
> RedeemEther reward for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine


Returns:

> amount ether redeemed amount

1. **amount** *of type `uint256`*

--- 
### init(address,address,bytes32,uint256)


**Execution cost**: less than 81306 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteApproveParams** *of type `bytes32`*
4. **_orgNativeTokenFee** *of type `uint256`*


--- 
### getProposalExecutionTime(bytes32)


**Execution cost**: less than 745 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### getProposalExternalToken(bytes32)


**Execution cost**: less than 920 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### getRedeemedPeriods(bytes32,uint256)
>
> getRedeemedPeriods return the already redeemed periods for reputation, nativeToken, ether or externalToken.


**Execution cost**: less than 595 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_redeemType** *of type `uint256`*

    > - the type of the reward:        0 - reputation        1 - nativeTokenReward        2 - Ether        3 - ExternalToken


Returns:

> redeemed period.

1. **output_0** *of type `uint256`*

--- 
### redeem(bytes32,bool[4])
>
> redeem rewards for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_whatToRedeem** *of type `bool[4]`*

    > whatToRedeem array:        whatToRedeem[0] - reputation        whatToRedeem[1] - nativeTokenReward        whatToRedeem[2] - Ether        whatToRedeem[3] - ExternalToken


Returns:

> result boolean array for each redeem type.

1. **reputationReward** *of type `int256`*
2. **nativeTokenReward** *of type `uint256`*
3. **etherReward** *of type `uint256`*
4. **externalTokenReward** *of type `uint256`*

--- 
### orgNativeTokenFee()


**Execution cost**: less than 579 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### intVote()


**Execution cost**: less than 930 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getTotalReputationSupply(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### proposeContributionReward(bytes32,int256,uint256[5],address,address)
>
> Submit a proposal for a reward for a contribution:


**Execution cost**: No bound available


Params:

1. **_contributionDescriptionHash** *of type `bytes32`*

    > A hash of the contribution's description

2. **_reputationChange** *of type `int256`*

    > - Amount of reputation change requested .Can be negative.

3. **_rewards** *of type `uint256[5]`*

    > rewards array:        rewards[0] - Amount of tokens requested per period        rewards[1] - Amount of ETH requested per period        rewards[2] - Amount of external tokens requested per period        rewards[3] - Period length - if set to zero it allows immediate redeeming after execution.        rewards[4] - Number of periods

4. **_externalToken** *of type `address`*

    > Address of external token, if reward is requested there

5. **_beneficiary** *of type `address`*

    > Who gets the rewards


Returns:


1. **output_0** *of type `bytes32`*

--- 
### organizationProposals(bytes32)


**Execution cost**: less than 3267 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **contributionDescriptionHash** *of type `bytes32`*
2. **nativeTokenReward** *of type `uint256`*
3. **reputationChange** *of type `int256`*
4. **ethReward** *of type `uint256`*
5. **externalToken** *of type `address`*
6. **externalTokenReward** *of type `uint256`*
7. **beneficiary** *of type `address`*
8. **periodLength** *of type `uint256`*
9. **numberOfPeriods** *of type `uint256`*
10. **executionTime** *of type `uint256`*

--- 
### mintReputation(uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### redeemNativeToken(bytes32)
>
> RedeemNativeToken reward for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine


Returns:

> amount the redeemed nativeToken.

1. **amount** *of type `uint256`*

--- 
### redeemReputation(bytes32)
>
> RedeemReputation reward for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine


Returns:

> reputation the redeemed reputation.

1. **reputation** *of type `int256`*

--- 
### stakingTokenTransfer(address,address,uint256,bytes32)


**Execution cost**: No bound available


Params:

1. **_stakingToken** *of type `address`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*
4. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### voteApproveParams()


**Execution cost**: less than 843 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#contributionreward)
