# *contract* ControllerInterface ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/ControllerInterface.sol))
*Code deposit cost: **No bound available.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> 

## Reference
- [Constructors](#constructors)

- [Events](#events)

- [Fallback](#fallback)
- [Functions](#functions)
    - [mintReputation](#function-mintreputation)
    - [unregisterScheme](#function-unregisterscheme)
    - [upgradeController](#function-upgradecontroller)
    - [unregisterSelf](#function-unregisterself)
    - [getSchemePermissions](#function-getschemepermissions)
    - [genericAction](#function-genericaction)
    - [mintTokens](#function-minttokens)
    - [isGlobalConstraintRegistered](#function-isglobalconstraintregistered)
    - [removeGlobalConstraint](#function-removeglobalconstraint)
    - [getSchemeParameters](#function-getschemeparameters)
    - [globalConstraintsCount](#function-globalconstraintscount)
    - [sendEther](#function-sendether)
    - [isSchemeRegistered](#function-isschemeregistered)
    - [registerScheme](#function-registerscheme)
    - [externalTokenTransferFrom](#function-externaltokentransferfrom)
    - [externalTokenTransfer](#function-externaltokentransfer)
    - [externalTokenIncreaseApproval](#function-externaltokenincreaseapproval)
    - [externalTokenDecreaseApproval](#function-externaltokendecreaseapproval)
    - [addGlobalConstraint](#function-addglobalconstraint)
### Constructors

### Events

### Fallback
*Nothing*
### Functions
### *function* mintReputation

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amount** *of type int256*
2. **_beneficiary** *of type address*
3. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* unregisterScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* upgradeController

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_newController** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* unregisterSelf

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* getSchemePermissions

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bytes4*


### *function* genericAction

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_params** *of type bytes32[]*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* mintTokens

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amount** *of type uint256*
2. **_beneficiary** *of type address*
3. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* isGlobalConstraintRegistered

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_globalConstraint** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* removeGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_globalConstraint** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* getSchemeParameters

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* globalConstraintsCount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type uint256*


### *function* sendEther

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amountInWei** *of type uint256*
2. **_to** *of type address*
3. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* isSchemeRegistered

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* registerScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_scheme** *of type address*
2. **_paramsHash** *of type bytes32*
3. **_permissions** *of type bytes4*
4. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenTransferFrom

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*
5. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenTransfer

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*
4. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenIncreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*
4. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenDecreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*
4. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* addGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


