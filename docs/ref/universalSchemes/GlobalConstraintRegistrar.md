# *contract* GlobalConstraintRegistrar ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/GlobalConstraintRegistrar.sol))
*Code deposit gas: **851800***
*Execution gas: **Infinite***
A scheme to manage global constaintg for organizations

- [Constructors](#constructors)
    - [GlobalConstraintRegistrar(address _nativeToken, uint256 _fee, address _beneficiary)](#constructor-globalconstraintregistraraddress-_nativetoken-uint256-_fee-address-_beneficiary)
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
## Constructors
### *constructor* GlobalConstraintRegistrar(address _nativeToken, uint256 _fee, address _beneficiary)
*Parameters:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

## Events
### *event* RemoveGlobalConstraintsProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*

### *event* ProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* NewGlobalConstraintsProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*
5. **_params** *of type bytes32*
6. **_voteToRemoveParams** *of type bytes32*

### *event* LogProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* setParameters
*Execution gas: **41209***
**nonpayable**

Hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_voteRegisterParams** *of type bytes32* - -  voting parameters for register global constraint
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* parameters
*Execution gas: **894***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **bytes32**
2. **address**

### *function* proposeToRemoveGC
*Execution gas: **Infinite***
**nonpayable**

propose to remove a global constraint:
*Inputs:*
1. **_avatar** *of type address* - the avatar of the organization that the constraint is proposed for
2. **_gc** *of type address* - the address of the global constraint that is being proposed

*Returns:*
bytes32 -the proposal id

### *function* transferOwnership
*Execution gas: **23184***
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* registerOrganization
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*

### *function* proposeGlobalConstraint
*Execution gas: **Infinite***
**nonpayable**

propose to add a new global constraint:
*Inputs:*
1. **_avatar** *of type address* - the avatar of the organization that the constraint is proposed for
2. **_gc** *of type address* - the address of the global constraint that is being proposed
3. **_params** *of type bytes32* - the parameters for the global contraint
4. **_voteToRemoveParams** *of type bytes32* - the conditions (on the voting machine) for removing this global constraint

*Returns:*
bytes32 -the proposal id

### *function* updateParameters
*Execution gas: **81368***
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* owner
*Execution gas: **787***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsData
*Execution gas: **1013***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bytes32**
2. **address**

### *function* organizations
*Execution gas: **749***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
*Execution gas: **875***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
*Execution gas: **912***
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
*Execution gas: **788***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
*Execution gas: **586***
**constant**
**pure**

Hash the parameters,and return the hash value
*Inputs:*
1. **_voteRegisterParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* fee
*Execution gas: **700***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* execute
*Execution gas: **Infinite***
**nonpayable**

execution of proposals, can only be called by the voting machine in which the vote is held.
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result, 0 is no and 1 is yes.

*Returns:*
bool which represents a successful of the function.

### *function* beneficiary
*Execution gas: **699***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

