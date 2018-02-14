# ContributionReward
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/ContributionReward.sol)
> A scheme for proposing and rewarding contributions to an organization


**Execution cost**: less than 21435 gas

**Deployment cost**: less than 1026400 gas

**Combined cost**: less than 1047835 gas

## Constructor




## Events
### NewContributionProposal(address,bytes32,address,bytes32,int256,uint256[5],address,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_contributionDescription** *of type `bytes32`*
5. **_reputationChange** *of type `int256`*
6. **_rewards** *of type `uint256[5]`*
7. **_externalToken** *of type `address`*
8. **_beneficiary** *of type `address`*

--- 
### NewProposal(bytes32)


**Execution cost**: No bound available


Params:

1. **proposalId** *of type `bytes32`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### ProposalDeleted(address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*

--- 
### ProposalExecuted(address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*

--- 
### RedeemEther(address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_amount** *of type `uint256`*

--- 
### RedeemExternalToken(address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_amount** *of type `uint256`*

--- 
### RedeemNativeToken(address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_amount** *of type `uint256`*

--- 
### RedeemReputation(address,bytes32,int256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_amount** *of type `int256`*


## Methods
### owner()


**Execution cost**: less than 699 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### hashedParameters()


**Execution cost**: less than 656 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### getParametersHash(uint256,bytes32,address)
>
> return a hash of the given parameters


**Execution cost**: less than 733 gas

**Attributes**: constant


Params:

1. **_orgNativeTokenFee** *of type `uint256`*

    > the fee for submitting a contribution in organizations native token

2. **_voteApproveParams** *of type `bytes32`*

    > parameters for the voting machine used to approve a contribution

3. **_intVote** *of type `address`*

    > the voting machine used to approve a contribution


Returns:

> a hash of the parameters

1. **output_0** *of type `bytes32`*

--- 
### execute(bytes32,address,int256)
>
> execution of proposals, can only be called by the voting machine in which the vote is held.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_avatar** *of type `address`*

    > address of the controller

3. **_param** *of type `int256`*

    > a parameter of the voting result, 1 yes and 2 is no.


Returns:


1. **output_0** *of type `bool`*

--- 
### organizationsProposals(address,bytes32)


**Execution cost**: less than 3214 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

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
11. **redeemedPeriods** *of type `uint256`*

--- 
### parameters(bytes32)


**Execution cost**: less than 1148 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **orgNativeTokenFee** *of type `uint256`*
2. **voteApproveParams** *of type `bytes32`*
3. **intVote** *of type `address`*

--- 
### proposeContributionReward(address,bytes32,int256,uint256[5],address,address)
>
> Submit a proposal for a reward for a contribution:


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > Avatar of the organization that the contribution was made for

2. **_contributionDescriptionHash** *of type `bytes32`*

    > A hash of the contribution's description

3. **_reputationChange** *of type `int256`*

    > - Amount of reputation change requested .Can be negative.

4. **_rewards** *of type `uint256[5]`*

    > rewards array:        rewards[0] - Amount of tokens requested per period        rewards[1] - Amount of ETH requested per period        rewards[2] - Amount of external tokens requested per period        rewards[3] - Period length        rewards[4] - Number of periods

5. **_externalToken** *of type `address`*

    > Address of external token, if reward is requested there

6. **_beneficiary** *of type `address`*

    > Who gets the rewards


Returns:


1. **output_0** *of type `bytes32`*

--- 
### redeem(bytes32,address,bool[4])
>
> redeem reward for proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_avatar** *of type `address`*

    > address of the controller

3. **_whatToRedeem** *of type `bool[4]`*

    > whatToRedeem array:        whatToRedeem[0] - reputation        whatToRedeem[1] - nativeTokenReward        whatToRedeem[2] - Ether        whatToRedeem[3] - ExternalToken


Returns:

> result boolean array for each redeem type.

1. **result** *of type `bool[4]`*

--- 
### setParameters(uint256,bytes32,address)
>
> hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 61132 gas


Params:

1. **_orgNativeTokenFee** *of type `uint256`*
2. **_voteApproveParams** *of type `bytes32`*
3. **_intVote** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23005 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20550 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#contributionreward)
