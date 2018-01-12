# *contract* OrganizationRegister ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/OrganizationRegister.sol))
*Code deposit cost: **less than 507200 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 507200 gas.***

> A universal organization registry.


## Reference
- [Constructors](#constructors)
    - [OrganizationRegister(address, uint256, address)](#constructor-organizationregisteraddress-uint256-address)
- [Events](#events)
    - [Promotion](#event-promotion)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [OrgAdded](#event-orgadded)
    - [LogNewProposal](#event-lognewproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [updateParameters](#function-updateparameters)
    - [owner](#function-owner)
    - [organizationsRegistery](#function-organizationsregistery)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [beneficiary](#function-beneficiary)
    - [addOrPromoteAddress](#function-addorpromoteaddress)
### Constructors
### *constructor* OrganizationRegister(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* Promotion
*Params:*
1. **_registry** *of type address*
2. **_org** *of type address*
3. **_amount** *of type uint256*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* OrgAdded
*Params:*
1. **_registry** *of type address*
2. **_org** *of type address*


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
1. **_token** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* parameters

*Execution cost: **less than 1157 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **fee** *of type uint256*
2. **token** *of type address*
3. **beneficiary** *of type address*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23093 gas.***

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

*Execution cost: **less than 721 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizationsRegistery

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type uint256*


### *function* organizations

*Execution cost: **less than 705 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* nativeToken

*Execution cost: **less than 853 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* isRegistered

*Execution cost: **less than 890 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* hashedParameters

*Execution cost: **less than 744 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_token** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* fee

*Execution cost: **less than 678 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* beneficiary

*Execution cost: **less than 655 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* addOrPromoteAddress

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_record** *of type address*
3. **_amount** *of type uint256*

*Returns:*
*Nothing*


