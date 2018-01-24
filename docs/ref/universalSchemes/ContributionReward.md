# *contract* ContributionReward ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/ContributionReward.sol))
*Code deposit cost: **less than 755000 gas.***

*Execution cost: **less than 21154 gas.***

*Total deploy cost(deposit + execution): **less than 776154 gas.***

> A scheme for proposing and rewarding contributions to an organization


## Reference
- [Constructors](#constructors)
    - [ContributionReward()](#constructor-contributionreward)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewProposal](#event-lognewproposal)
    - [LogNewContributionProposal](#event-lognewcontributionproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [updateParameters](#function-updateparameters)
    - [transferOwnership](#function-transferownership)
    - [setParameters](#function-setparameters)
    - [proposeContributionReward](#function-proposecontributionreward)
    - [parameters](#function-parameters)
    - [owner](#function-owner)
    - [organizationsProposals](#function-organizationsproposals)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [execute](#function-execute)
### Constructors
#### *constructor* ContributionReward()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
*Nothing*


### Events
#### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* LogProposalExecuted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


#### *event* LogProposalDeleted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


#### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


#### *event* LogNewContributionProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_contributionDesciption** *of type bytes32*
5. **_rewards** *of type uint256[4]*
6. **_externalToken** *of type address*
7. **_beneficiary** *of type address*


### Fallback
*Nothing*
### Functions
#### *function* updateParameters

*Execution cost: **less than 20550 gas.***

**nonpayable**

*Inputs:*
1. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22983 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256*
2. **_voteApproveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* proposeContributionReward

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_contributionDesciptionHash** *of type bytes32*
3. **_rewards** *of type uint256[4]*
4. **_externalToken** *of type address*
5. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* parameters

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **orgNativeTokenFee** *of type uint256*
2. **voteApproveParams** *of type bytes32*
3. **intVote** *of type address*


#### *function* owner

*Execution cost: **less than 721 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


#### *function* organizationsProposals

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **contributionDescriptionHash** *of type bytes32*
2. **nativeTokenReward** *of type uint256*
3. **reputationReward** *of type uint256*
4. **ethReward** *of type uint256*
5. **externalToken** *of type address*
6. **externalTokenReward** *of type uint256*
7. **beneficiary** *of type address*


#### *function* hashedParameters

*Execution cost: **less than 634 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256*
2. **_voteApproveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*
1. **unnamed** *of type bool*


