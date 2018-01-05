
# *contract* Controller 


## Constructor

*Params:*

 1. **_avatar** *of type Avatar*

 2. **_schemes** *of type address*

 3. **_params** *of type bytes32*

 4. **_permissions** *of type bytes4*




## Functions




###  mintReputation

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_amount** *of type int256*

 2. **_beneficiary** *of type address*




###  mintTokens

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_amount** *of type uint256*

 2. **_beneficiary** *of type address*




###  registerScheme

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_scheme** *of type address*

 2. **_paramsHash** *of type bytes32*

 3. **_permissions** *of type bytes4*




###  unregisterScheme

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_scheme** *of type address*




###  unregisterSelf

*Returns:*

 1. unnamed param *of type bool*


*Params:*




### *constant*  isSchemeRegistered

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_scheme** *of type address*




### *constant*  getSchemeParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_scheme** *of type address*




### *constant*  getSchemePermissions

*Returns:*

 1. unnamed param *of type bytes4*


*Params:*

 1. **_scheme** *of type address*




### *constant*  globalConstraintsCount

*Returns:*

 1. unnamed param *of type uint*


*Params:*




### *constant*  isGlobalConstraintRegister

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_globalConstraint** *of type address*




###  addGlobalConstraint

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_globalConstraint** *of type address*

 2. **_params** *of type bytes32*




###  removeGlobalConstraint

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_globalConstraint** *of type address*




###  upgradeController

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_newController** *of type address*




###  genericAction

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_params** *of type bytes32*




###  sendEther

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_amountInWei** *of type uint*

 2. **_to** *of type address*




###  externalTokenTransfer

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_externalToken** *of type StandardToken*

 2. **_to** *of type address*

 3. **_value** *of type uint*




###  externalTokenTransferFrom

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_externalToken** *of type StandardToken*

 2. **_from** *of type address*

 3. **_to** *of type address*

 4. **_value** *of type uint*




###  externalTokenIncreaseApproval

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_externalToken** *of type StandardToken*

 2. **_spender** *of type address*

 3. **_addedValue** *of type uint*




###  externalTokenDecreaseApproval

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_externalToken** *of type StandardToken*

 2. **_spender** *of type address*

 3. **_subtractedValue** *of type uint*



