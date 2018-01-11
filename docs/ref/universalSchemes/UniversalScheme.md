# *contract* UniversalScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/UniversalScheme.sol))
*Total creation gas: **244800***


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
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* updateParameters
*Execution gas: **81126***
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* transferOwnership
*Execution gas: **22920***
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

### *function* owner
*Execution gas: **592***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizations
*Execution gas: **576***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
*Execution gas: **680***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
*Execution gas: **717***
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
*Execution gas: **571***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* fee
*Execution gas: **505***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* beneficiary
*Execution gas: **526***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

