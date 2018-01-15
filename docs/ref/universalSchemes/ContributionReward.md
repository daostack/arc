# *contract* ContributionReward ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/ContributionReward.sol))
*Code deposit cost: **less than 911000 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 911000 gas.***

> A scheme for proposing and rewarding contributions to an organization


## Reference
- [Constructors](#constructors)
    - [ContributionReward(address, uint256, address)](#constructor-contributionrewardaddress-uint256-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewProposal](#event-lognewproposal)
    - [LogNewContributionProposal](#event-lognewcontributionproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [registerOrganization](#function-registerorganization)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [setParameters](#function-setparameters)
    - [updateParameters](#function-updateparameters)
    - [proposeContributionReward](#function-proposecontributionreward)
    - [owner](#function-owner)
    - [organizationsProposals](#function-organizationsproposals)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [beneficiary](#function-beneficiary)
### Constructors
### *constructor* ContributionReward(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* LogProposalExecuted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogProposalDeleted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### *event* LogNewContributionProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_contributionDesciption** *of type bytes32*
5. **_nativeTokenReward** *of type uint256*
6. **_reputationReward** *of type uint256*
7. **_ethReward** *of type uint256*
8. **_externalTokenReward** *of type uint256*
9. **_externalToken** *of type address*
10. **_beneficiary** *of type address*


### Fallback
*Nothing*
### Functions
### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* parameters

*Execution cost: **less than 1381 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **orgNativeTokenFee** *of type uint256*
2. **voteApproveParams** *of type bytes32*
3. **schemeNativeTokenFee** *of type uint256*
4. **intVote** *of type address*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23184 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256*
2. **_schemeNativeTokenFee** *of type uint256*
3. **_voteApproveParams** *of type bytes32*
4. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* updateParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* proposeContributionReward

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


### *function* owner

*Execution cost: **less than 743 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizationsProposals

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


### *function* organizations

*Execution cost: **less than 705 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* nativeToken

*Execution cost: **less than 875 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* isRegistered

*Execution cost: **less than 912 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* hashedParameters

*Execution cost: **less than 766 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_orgNativeTokenFee** *of type uint256*
2. **_schemeNativeTokenFee** *of type uint256*
3. **_voteApproveParams** *of type bytes32*
4. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* fee

*Execution cost: **less than 700 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*
1. **unnamed** *of type bool*


### *function* beneficiary

*Execution cost: **less than 655 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


