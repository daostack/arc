# *contract* Controller ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Controller.sol))
*Code deposit cost: **less than 2327200 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 2327200 gas.***

> Controller contract


## Reference
- [Constructors](#constructors)
    - [Controller(address, address[], bytes32[], bytes4[])](#constructor-controlleraddress-address[]-bytes32[]-bytes4[])
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
### Constructors
### *constructor* Controller(address, address[], bytes32[], bytes4[])

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_avatar** *of type address*
2. **_schemes** *of type address[]*
3. **_params** *of type bytes32[]*
4. **_permissions** *of type bytes4[]*


### Events
### *event* ExternalTokenTransfer
*Params:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*


### *event* UpgradeController
*Params:*
1. **_oldController** *of type address*
2. **_newController** *of type address*


### *event* ExternalTokenTransferFrom
*Params:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_from** *of type address*
4. **_to** *of type address*
5. **_value** *of type uint256*


### *event* RegisterScheme
*Params:*
1. **_sender** *of type address*
2. **_scheme** *of type address*


### *event* RemoveGlobalConstraint
*Params:*
1. **_globalConstraint** *of type address*
2. **_index** *of type uint256*


### *event* SendEther
*Params:*
1. **_sender** *of type address*
2. **_amountInWei** *of type uint256*
3. **_to** *of type address*


### *event* UnregisterScheme
*Params:*
1. **_sender** *of type address*
2. **_scheme** *of type address*


### *event* MintTokens
*Params:*
1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*


### *event* MintReputation
*Params:*
1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*


### *event* GenericAction
*Params:*
1. **_sender** *of type address*
2. **_params** *of type bytes32[]*


### *event* ExternalTokenIncreaseApproval
*Params:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*


### *event* ExternalTokenDecreaseApproval
*Params:*
1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*


### *event* AddGlobalConstraint
*Params:*
1. **_globalconstraint** *of type address*
2. **_params** *of type bytes32*


### Fallback
*Execution cost: **less than 720 gas.***

**nonpayable**



### Functions
### *function* isSchemeRegistered

*Execution cost: **less than 1045 gas.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* nativeToken

*Execution cost: **less than 1142 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* schemes

*Execution cost: **less than 1499 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **paramsHash** *of type bytes32*
2. **permissions** *of type bytes4*


### *function* sendEther

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amountInWei** *of type uint256*
2. **_to** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* newController

*Execution cost: **less than 680 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* upgradeController
> upgrade the Controller     The function will trigger an event 'UpgradeController'.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_newController** *of type address- the address of the new controller.*

bool which represents a success

### *function* registerScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_scheme** *of type address*
2. **_paramsHash** *of type bytes32*
3. **_permissions** *of type bytes4*

*Returns:*
1. **unnamed** *of type bool*


### *function* removeGlobalConstraint
> remove Global Constraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_globalConstraint** *of type address- the address of the global constraint to be remove.*

bool which represents a success

### *function* unregisterSelf
> unregister the caller's scheme

*Execution cost: **less than 27918 gas.***

**nonpayable**

*Inputs:*
*Nothing*

bool which represents a success

### *function* unregisterScheme
> unregister a scheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_scheme** *of type address- the address of the scheme*

bool which represents a success

### *function* externalTokenTransferFrom

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* isGlobalConstraintRegister

*Execution cost: **less than 670 gas.***

**constant | view**

*Inputs:*
1. **_globalConstraint** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* mintReputation

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amount** *of type int256*
2. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* mintTokens

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amount** *of type uint256*
2. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* nativeReputation

*Execution cost: **less than 900 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* genericAction
> do a generic deligate call to the contract which called us. This function use deligatecall and might expose the organization to security risk. Use this function only if you really knows what you are doing.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_params** *of type bytes32[]- the params for the call.*

bool which represents success

### *function* globalConstraintsRegister

*Execution cost: **less than 1038 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **register** *of type bool*
2. **index** *of type uint256*


### *function* globalConstraintsCount

*Execution cost: **less than 920 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* globalConstraints

*Execution cost: **less than 1390 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **gcAddress** *of type address*
2. **params** *of type bytes32*


### *function* getSchemePermissions

*Execution cost: **less than 1174 gas.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **unnamed** *of type bytes4*


### *function* getSchemeParameters

*Execution cost: **less than 793 gas.***

**constant | view**

*Inputs:*
1. **_scheme** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* externalTokenTransfer

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenIncreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenDecreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* avatar

*Execution cost: **less than 768 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* addGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*

*Returns:*
1. **unnamed** *of type bool*


