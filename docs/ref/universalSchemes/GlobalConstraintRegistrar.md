# *contract* GlobalConstraintRegistrar ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/GlobalConstraintRegistrar.sol))
*Code deposit cost: **less than 851800 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 851800 gas.***

> A scheme to manage global constaintg for organizations


## Reference
- [Constructors](#constructors)
    - [GlobalConstraintRegistrar(address, uint256, address)](#constructor-globalconstraintregistraraddress-uint256-address)
- [Events](#events)
    - [RemoveGlobalConstraintsProposal](#event-removeglobalconstraintsproposal)
    - [ProposalExecuted](#event-proposalexecuted)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [NewGlobalConstraintsProposal](#event-newglobalconstraintsproposal)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewProposal](#event-lognewproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [parameters](#function-parameters)
    - [proposeToRemoveGC](#function-proposetoremovegc)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [proposeGlobalConstraint](#function-proposeglobalconstraint)
    - [updateParameters](#function-updateparameters)
    - [owner](#function-owner)
    - [organizationsData](#function-organizationsdata)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [beneficiary](#function-beneficiary)
### Constructors
### *constructor* GlobalConstraintRegistrar(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* RemoveGlobalConstraintsProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*


### *event* ProposalExecuted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* NewGlobalConstraintsProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*
5. **_params** *of type bytes32*
6. **_voteToRemoveParams** *of type bytes32*


### *event* LogProposalDeleted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### Fallback
*Nothing*
### Functions
### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* parameters

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*


### *function* proposeToRemoveGC

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_gc** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23184 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* proposeGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_gc** *of type address*
3. **_params** *of type bytes32*
4. **_voteToRemoveParams** *of type bytes32*

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


### *function* owner

*Execution cost: **less than 787 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizationsData

*Execution cost: **less than 1013 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*


### *function* organizations

*Execution cost: **less than 749 gas.***

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

*Execution cost: **less than 788 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

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

*Execution cost: **less than 699 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


