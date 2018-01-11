# *contract* OrganizationRegister ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/OrganizationRegister.sol))
*Total creation gas: **507200***
A universal organization registry.

- [Constructors](#constructors)
    - [OrganizationRegister(address _nativeToken, uint256 _fee, address _beneficiary)](#constructor-organizationregisteraddress-_nativetoken-uint256-_fee-address-_beneficiary)
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
## Constructors
### *constructor* OrganizationRegister(address _nativeToken, uint256 _fee, address _beneficiary)
*Parameters:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

## Events
### *event* Promotion
*Parameters:*
1. **_registry** *of type address*
2. **_org** *of type address*
3. **_amount** *of type uint256*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* OrgAdded
*Parameters:*
1. **_registry** *of type address*
2. **_org** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* setParameters
*Execution gas: **61809***
**nonpayable**

Hash the parameters,save if needed and return the hash value
*Inputs:*
1. **_token** *of type address* - -  the token to pay for register or promotion an address.
2. **_fee** *of type uint256* - - fee needed for register an address.
3. **_beneficiary** *of type address* - - the beneficiary payment address

*Returns:*
bytes32 -the parameters hash

### *function* parameters
*Execution gas: **1157***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **uint256**
2. **address**
3. **address**

### *function* transferOwnership
*Execution gas: **23093***
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

### *function* updateParameters
*Execution gas: **81255***
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* owner
*Execution gas: **721***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsRegistery
*Execution gas: **714***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type address*

*Returns:*
1. **uint256**

### *function* organizations
*Execution gas: **705***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
*Execution gas: **853***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* isRegistered
*Execution gas: **890***
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* hashedParameters
*Execution gas: **744***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
*Execution gas: **788***
**constant**
**pure**

Hash the parameters,and return the hash value
*Inputs:*
1. **_token** *of type address* - -  the token to pay for register or promotion an address.
2. **_fee** *of type uint256* - - fee needed for register an address.
3. **_beneficiary** *of type address* - - the beneficiary payment address

*Returns:*
bytes32 -the parameters hash

### *function* fee
*Execution gas: **678***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* beneficiary
*Execution gas: **655***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* addOrPromoteAddress
*Execution gas: **Infinite***
**nonpayable**

Adding or promoting an address on the registry.     An address(record) to add or promote can be organization address or any contract address.     Adding a record is done by paying at least the minimum required by the registery params.     Promoting a record is done by paying(adding)amount of token to the registery beneficiary.
*Inputs:*
1. **_avatar** *of type address* - The _avatar of the organization which own the registery.
2. **_record** *of type address* - The address to add or promote.
3. **_amount** *of type uint256* - amount to pay for adding or promoting

*Returns:*
*Nothing*

