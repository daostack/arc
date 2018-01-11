# *contract* UniversalScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/UniversalScheme.sol))
*Code deposit upper limit: **244800 gas***
*Executionas upper limit: **20636 gas***

- [Constructors](#constructors)

- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogNewProposal](#event-lognewproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [updateParameters](#function-updateparameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [owner](#function-owner)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [fee](#function-fee)
    - [beneficiary](#function-beneficiary)
## Constructors

## Events
### *event* OwnershipTransferred
*Params:*
    1. **previousOwner** *of type address*
    2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
    1. **_avatar** *of type address*


### *event* LogNewProposal
*Params:*
    1. **proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
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


### *function* transferOwnership
*Execution cost upper limit: **22920 gas***
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


### *function* owner
*Execution cost upper limit: **592 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* organizations
*Execution cost upper limit: **576 gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* nativeToken
*Execution cost upper limit: **680 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* isRegistered
*Execution cost upper limit: **717 gas***
**constant | view**

*Inputs:*
    1. **_avatar** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* hashedParameters
*Execution cost upper limit: **571 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* fee
*Execution cost upper limit: **505 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type uint256*


### *function* beneficiary
*Execution cost upper limit: **526 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


