# *contract* UniversalScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/UniversalScheme.sol))


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
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

## Fallback
*Nothing*
## Functions
### *function* updateParameters
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

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

### *function* owner
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizations
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

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

### *function* fee
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* beneficiary
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

