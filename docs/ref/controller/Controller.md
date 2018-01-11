# *contract* Controller ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Controller.sol))
Controller contract

- [Constructors](#constructors)
    - [Controller(address _avatar, address[] _schemes, bytes32[] _params, bytes4[] _permissions)](#constructor-controlleraddress-_avatar-address-_schemes-bytes32-_params-bytes4-_permissions)
- [Events](#events)
    - [ExternalTokenTransfer](#event-externaltokentransfer)
    - [UpgradeController](#event-upgradecontroller)
    - [ExternalTokenTransferFrom](#event-externaltokentransferfrom)
    - [RegisterScheme](#event-registerscheme)
    - [RemoveGlobalConstraint](#event-removeglobalconstraint)
    - [SendEther](#event-sendether)
    - [UnregisterScheme](#event-unregisterscheme)
    - [MintTokens](#event-minttokens)
    - [MintReputation](#event-mintreputation)
    - [GenericAction](#event-genericaction)
    - [ExternalTokenIncreaseApproval](#event-externaltokenincreaseapproval)
    - [ExternalTokenDecreaseApproval](#event-externaltokendecreaseapproval)
    - [AddGlobalConstraint](#event-addglobalconstraint)
- [Fallback](#fallback)
- [Functions](#functions)
    - [isSchemeRegistered](#function-isschemeregistered)
    - [nativeToken](#function-nativetoken)
    - [schemes](#function-schemes)
    - [sendEther](#function-sendether)
    - [newController](#function-newcontroller)
    - [upgradeController](#function-upgradecontroller)
    - [registerScheme](#function-registerscheme)
    - [removeGlobalConstraint](#function-removeglobalconstraint)
    - [unregisterSelf](#function-unregisterself)
    - [unregisterScheme](#function-unregisterscheme)
    - [externalTokenTransferFrom](#function-externaltokentransferfrom)
    - [isGlobalConstraintRegister](#function-isglobalconstraintregister)
    - [mintReputation](#function-mintreputation)
    - [mintTokens](#function-minttokens)
    - [nativeReputation](#function-nativereputation)
    - [genericAction](#function-genericaction)
    - [globalConstraintsRegister](#function-globalconstraintsregister)
    - [globalConstraintsCount](#function-globalconstraintscount)
    - [globalConstraints](#function-globalconstraints)
    - [getSchemePermissions](#function-getschemepermissions)
    - [getSchemeParameters](#function-getschemeparameters)
    - [externalTokenTransfer](#function-externaltokentransfer)
    - [externalTokenIncreaseApproval](#function-externaltokenincreaseapproval)
    - [externalTokenDecreaseApproval](#function-externaltokendecreaseapproval)
    - [avatar](#function-avatar)
    - [addGlobalConstraint](#function-addglobalconstraint)
## Constructors
### *constructor* Controller(address _avatar, address[] _schemes, bytes32[] _params, bytes4[] _permissions)
*Parameters:*
1. **_avatar** *of type address*
2. **_schemes** *of type address[]*
3. **_params** *of type bytes32[]*
4. **_permissions** *of type bytes4[]*

## Events
### *event* ExternalTokenTransfer
*Parameters:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

### *event* UpgradeController
*Parameters:*
1. **_oldController** *of type address*
2. **_newController** *of type address*

### *event* ExternalTokenTransferFrom
*Parameters:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_from** *of type address*
4. **_to** *of type address*
5. **_value** *of type uint256*

### *event* RegisterScheme
*Parameters:*
1. **_sender** *of type address*
2. **_scheme** *of type address*

### *event* RemoveGlobalConstraint
*Parameters:*
1. **_globalConstraint** *of type address*
2. **_index** *of type uint256*

### *event* SendEther
*Parameters:*
1. **_sender** *of type address*
2. **_amountInWei** *of type uint256*
3. **_to** *of type address*

### *event* UnregisterScheme
*Parameters:*
1. **_sender** *of type address*
2. **_scheme** *of type address*

### *event* MintTokens
*Parameters:*
1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*

### *event* MintReputation
*Parameters:*
1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*

### *event* GenericAction
*Parameters:*
1. **_sender** *of type address*
2. **_params** *of type bytes32[]*

### *event* ExternalTokenIncreaseApproval
*Parameters:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*

### *event* ExternalTokenDecreaseApproval
*Parameters:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*

### *event* AddGlobalConstraint
*Parameters:*
1. **_globalconstraint** *of type address*
2. **_params** *of type bytes32*

## Fallback
**nonpayable**

## Functions
### *function* isSchemeRegistered
**constant**
**view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **bool**

### *function* nativeToken
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* schemes
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bytes32**
2. **bytes4**

### *function* sendEther
**nonpayable**

send some ether
*Inputs:*
1. **_amountInWei** *of type uint256* - the amount of ether (in Wei) to send
2. **_to** *of type address* - address of the beneficary

*Returns:*
bool which represents a success

### *function* newController
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* upgradeController
**nonpayable**

upgrade the Controller     The function will trigger an event 'UpgradeController'.
*Inputs:*
1. **_newController** *of type address* - the address of the new controller.

*Returns:*
bool which represents a success

### *function* registerScheme
**nonpayable**

register a scheme
*Inputs:*
1. **_scheme** *of type address* - the address of the scheme
2. **_paramsHash** *of type bytes32* - a hashed configuration of the usage of the scheme
3. **_permissions** *of type bytes4* - the permissions the new scheme will have

*Returns:*
bool which represents a success

### *function* removeGlobalConstraint
**nonpayable**

remove Global Constraint
*Inputs:*
1. **_globalConstraint** *of type address* - the address of the global constraint to be remove.

*Returns:*
bool which represents a success

### *function* unregisterSelf
**nonpayable**

unregister the caller's scheme
*Inputs:*
*Nothing*

*Returns:*
bool which represents a success

### *function* unregisterScheme
**nonpayable**

unregister a scheme
*Inputs:*
1. **_scheme** *of type address* - the address of the scheme

*Returns:*
bool which represents a success

### *function* externalTokenTransferFrom
**nonpayable**

transfer token "from" address "to" address     One must to approve the amount of tokens which can be spend from the     "from" account.This can be done using externalTokenApprove.
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_from** *of type address* - address of the account to send from
3. **_to** *of type address* - address of the beneficary
4. **_value** *of type uint256* - the amount of ether (in Wei) to send

*Returns:*
bool which represents a success

### *function* isGlobalConstraintRegister
**constant**
**view**

*Inputs:*
1. **_globalConstraint** *of type address*

*Returns:*
1. **bool**

### *function* mintReputation
**nonpayable**

mint reputation .
*Inputs:*
1. **_amount** *of type int256* - amount of reputation to mint
2. **_beneficiary** *of type address* - beneficiary address

*Returns:*
bool which represents a success

### *function* mintTokens
**nonpayable**

mint tokens .
*Inputs:*
1. **_amount** *of type uint256* - amount of token to mint
2. **_beneficiary** *of type address* - beneficiary address

*Returns:*
bool which represents a success

### *function* nativeReputation
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* genericAction
**nonpayable**

do a generic deligate call to the contract which called us. This function use deligatecall and might expose the organization to security risk. Use this function only if you really knows what you are doing.
*Inputs:*
1. **_params** *of type bytes32[]* - the params for the call.

*Returns:*
bool which represents success

### *function* globalConstraintsRegister
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**
2. **uint256**

### *function* globalConstraintsCount
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* globalConstraints
**constant**
**view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **address**
2. **bytes32**

### *function* getSchemePermissions
**constant**
**view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **bytes4**

### *function* getSchemeParameters
**constant**
**view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **bytes32**

### *function* externalTokenTransfer
**nonpayable**

send some amount of arbitrary ERC20 Tokens
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_to** *of type address* - address of the beneficary
3. **_value** *of type uint256* - the amount of ether (in Wei) to send

*Returns:*
bool which represents a success

### *function* externalTokenIncreaseApproval
**nonpayable**

increase approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_spender** *of type address* - address
3. **_addedValue** *of type uint256* - the amount of ether (in Wei) which the approval is refering to.

*Returns:*
bool which represents a success

### *function* externalTokenDecreaseApproval
**nonpayable**

decrease approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_spender** *of type address* - address
3. **_subtractedValue** *of type uint256* - the amount of ether (in Wei) which the approval is refering to.

*Returns:*
bool which represents a success

### *function* avatar
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* addGlobalConstraint
**nonpayable**

add or update Global Constraint
*Inputs:*
1. **_globalConstraint** *of type address* - the address of the global constraint to be added.
2. **_params** *of type bytes32* - the constraint parameters hash.

*Returns:*
bool which represents a success

