# *contract* UpgradeScheme
A schme to manage the upgrade of an organization.

- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewUpgradeProposal](#event-lognewupgradeproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogChangeUpgradeSchemeProposal](#event-logchangeupgradeschemeproposal)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [proposeUpgrade](#function-proposeupgrade)
    - [proposeChangeUpgradingScheme](#function-proposechangeupgradingscheme)
    - [updateParameters](#function-updateparameters)
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

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogNewUpgradeProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_newController** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* LogChangeUpgradeSchemeProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **newUpgradeScheme** *of type address*
5. **_params** *of type bytes32*
6. **tokenFee** *of type address*
7. **fee** *of type uint256*

## Functions
### *function* setParameters
**nonpayable**

hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
*Nothing*

### *function* parameters
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **bytes32**
2. **address**

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

### *function* proposeUpgrade
**nonpayable**

propose an upgrade of the organization's controller
*Inputs:*
1. **_avatar** *of type address* - avatar of the organization
2. **_newController** *of type address* - address of the new controller that is being proposed

*Returns:*
an id which represents the proposal

### *function* proposeChangeUpgradingScheme
**nonpayable**

propose to replace this scheme by another upgrading scheme
*Inputs:*
1. **_avatar** *of type address* - avatar of the organization
2. **_scheme** *of type address* - address of the new upgrading scheme
3. **_params** *of type bytes32* - ???
4. **_tokenFee** *of type address* - ???
5. **_fee** *of type uint256* - ???

*Returns:*
an id which represents the proposal

### *function* updateParameters
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* owner
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsProposals
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **bytes32**
3. **uint256**
4. **address**
5. **uint256**

### *function* organizations
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
**constant**
**payable**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
**constant**
**payable**
**pure**

return a hash of the given parameters
*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
*Nothing*

### *function* fee
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* execute
**nonpayable**

execution of proposals, can only be called by the voting machine in which the vote is held.
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result, 0 is no and 1 is yes.

*Returns:*
*Nothing*

### *function* beneficiary
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

