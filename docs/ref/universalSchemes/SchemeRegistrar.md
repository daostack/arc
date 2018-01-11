# *contract* SchemeRegistrar ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SchemeRegistrar.sol))
*Code deposit upper limit: **1008400 gas***
*Executionas upper limit: **Infinite gas***

A registrar for Schemes for organizations
- [Constructors](#constructors)
    - [SchemeRegistrar(address, uint256, address)](#constructor-schemeregistraraddress-uint256-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogRemoveSchemeProposal](#event-logremoveschemeproposal)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewSchemeProposal](#event-lognewschemeproposal)
    - [LogNewProposal](#event-lognewproposal)
- [Fallback](#fallback)
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
## Constructors
### *constructor* SchemeRegistrar(address, uint256, address)
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Params:*
    1. **_nativeToken** *of type address*
    2. **_fee** *of type uint256*
    3. **_beneficiary** *of type address*


## Events
### *event* OwnershipTransferred
*Params:*
    1. **previousOwner** *of type address*
    2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
    1. **_avatar** *of type address*


### *event* LogRemoveSchemeProposal
*Params:*
    1. **_avatar** *of type address*
    2. **_proposalId** *of type bytes32*
    3. **_intVoteInterface** *of type address*
    4. **_scheme** *of type address*


### *event* LogProposalExecuted
*Params:*
    1. **_avatar** *of type address*
    2. **_proposalId** *of type bytes32*


### *event* LogProposalDeleted
*Params:*
    1. **_avatar** *of type address*
    2. **_proposalId** *of type bytes32*


### *event* LogNewSchemeProposal
*Params:*
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
*Params:*
    1. **proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
### *function* organizations
*Execution cost upper limit: **771 gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* parameters
*Execution cost upper limit: **1148 gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type bytes32*

*Returns:*
    1. **voteRegisterParams** *of type bytes32*
    2. **voteRemoveParams** *of type bytes32*
    3. **intVote** *of type address*


### *function* setParameters
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_voteRegisterParams** *of type bytes32*
    2. **_voteRemoveParams** *of type bytes32*
    3. **_intVote** *of type address*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* proposeScheme
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_avatar** *of type address*
    2. **_scheme** *of type address*
    3. **_parametersHash** *of type bytes32*
    4. **_isRegistering** *of type bool*
    5. **_tokenFee** *of type address*
    6. **_fee** *of type uint256*
    7. **_autoRegisterOrganization** *of type bool*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* transferOwnership
*Execution cost upper limit: **23206 gas***
**nonpayable**
Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
    1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* registerOrganization
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* updateParameters
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_nativeToken** *of type address*
    2. **_fee** *of type uint256*
    3. **_beneficiary** *of type address*
    4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* proposeToRemoveScheme
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_avatar** *of type address*
    2. **_scheme** *of type address*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* owner
*Execution cost upper limit: **809 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* organizationsProposals
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*
    2. **unnamed** *of type bytes32*

*Returns:*
    1. **scheme** *of type address*
    2. **parametersHash** *of type bytes32*
    3. **proposalType** *of type uint256*
    4. **isRegistering** *of type bool*
    5. **tokenFee** *of type address*
    6. **fee** *of type uint256*
    7. **autoRegisterOrganization** *of type bool*


### *function* nativeToken
*Execution cost upper limit: **897 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* isRegistered
*Execution cost upper limit: **934 gas***
**constant | view**

*Inputs:*
    1. **_avatar** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* hashedParameters
*Execution cost upper limit: **788 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* getParametersHash
*Execution cost upper limit: **Infinite gas***
**constant | pure**

*Inputs:*
    1. **_voteRegisterParams** *of type bytes32*
    2. **_voteRemoveParams** *of type bytes32*
    3. **_intVote** *of type address*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* fee
*Execution cost upper limit: **722 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type uint256*


### *function* execute
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_proposalId** *of type bytes32*
    2. **_avatar** *of type address*
    3. **_param** *of type int256*

*Returns:*
    1. **unnamed** *of type bool*


### *function* beneficiary
*Execution cost upper limit: **699 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


