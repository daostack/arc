# *contract* SchemeRegistrar ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SchemeRegistrar.sol))
A registrar for Schemes for organizations

- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogRemoveSchemeProposal](#event-logremoveschemeproposal)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewSchemeProposal](#event-lognewschemeproposal)
    - [LogNewProposal](#event-lognewproposal)
- [Functions](#functions)
    - [organizations](#function-organizations)
    - [parameters](#function-parameters)
    - [setParameters](#function-setparameters)
    - [proposeScheme](#function-proposescheme)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [updateParameters](#function-updateparameters)
    - [proposeToRemoveScheme](#function-proposetoremovescheme)
    - [owner](#function-owner)
    - [organizationsProposals](#function-organizationsproposals)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [beneficiary](#function-beneficiary)

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogRemoveSchemeProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*

### *event* LogProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogNewSchemeProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*
5. **_parametersHash** *of type bytes32*
6. **_isRegistering** *of type bool*
7. **_tokenFee** *of type address*
8. **_fee** *of type uint256*
9. **_autoRegisterOrganization** *of type bool*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

## Functions
### *function* organizations
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* parameters
**constant**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **bytes32**
2. **bytes32**
3. **address**

### *function* setParameters
**nonpayable**

hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_voteRegisterParams** *of type bytes32*
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*
*Nothing*

### *function* proposeScheme
**nonpayable**

create a proposal to register a schemeNB: not only proposes the vote, but also votes for it
*Inputs:*
1. **_avatar** *of type address* - the address of the organization the scheme will be registered for
2. **_scheme** *of type address* - the address of the scheme to be registered
3. **_parametersHash** *of type bytes32* - a hash of the configuration of the _scheme
4. **_isRegistering** *of type bool* - a boolean represent if the scheme is a registering scheme     that can register other schemes
5. **_tokenFee** *of type address* - a token that will be used to pay any fees needed for registering the avatar
6. **_fee** *of type uint256* - the fee to be paid
7. **_autoRegisterOrganization** *of type bool* - undefined

*Returns:*
a proposal Id

### *function* transferOwnership
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* registerOrganization
**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*

### *function* updateParameters
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* proposeToRemoveScheme
**nonpayable**

propose to remove a scheme for a controller
*Inputs:*
1. **_avatar** *of type address* - the address of the controller from which we want to remove a scheme
2. **_scheme** *of type address* - the address of the scheme we want to remove     * NB: not only registers the proposal, but also votes for it

*Returns:*
*Nothing*

### *function* owner
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsProposals
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **bytes32**
3. **uint256**
4. **bool**
5. **address**
6. **uint256**
7. **bool**

### *function* nativeToken
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
**constant**
**pure**

*Inputs:*
1. **_voteRegisterParams** *of type bytes32*
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*
1. **bytes32**

### *function* fee
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* execute
**nonpayable**

execute a  proposal This method can only be called by the voting machine in which the vote is held.
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the proposal in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - identifies the action to be taken

*Returns:*
*Nothing*

### *function* beneficiary
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

