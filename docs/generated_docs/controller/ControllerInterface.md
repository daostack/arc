# ControllerInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/ControllerInterface.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available




## Methods
### globalConstraintsCount(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### externalTokenTransferFrom(address,address,address,uint256,address)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_from** *of type `address`*
3. **_to** *of type `address`*
4. **_value** *of type `uint256`*
5. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### addGlobalConstraint(address,bytes32,address)


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*
2. **_params** *of type `bytes32`*
3. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### externalTokenDecreaseApproval(address,address,uint256,address)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_subtractedValue** *of type `uint256`*
4. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### externalTokenTransfer(address,address,uint256,address)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_to** *of type `address`*
3. **_value** *of type `uint256`*
4. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### burnReputation(uint256,address,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_from** *of type `address`*
3. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### externalTokenIncreaseApproval(address,address,uint256,address)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_addedValue** *of type `uint256`*
4. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### genericAction(bytes32[],address)


**Execution cost**: No bound available


Params:

1. **_params** *of type `bytes32[]`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintTokens(uint256,address,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGlobalConstraintRegistered(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_globalConstraint** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getSchemeParameters(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### getNativeReputation(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### getSchemePermissions(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bytes4`*

--- 
### isSchemeRegistered(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintReputation(uint256,address,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_to** *of type `address`*
3. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerScheme(address,bytes32,bytes4,address)


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*
2. **_paramsHash** *of type `bytes32`*
3. **_permissions** *of type `bytes4`*
4. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### removeGlobalConstraint(address,address)


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### sendEther(uint256,address,address)


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*
2. **_to** *of type `address`*
3. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### unregisterScheme(address,address)


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### unregisterSelf(address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### upgradeController(address,address)


**Execution cost**: No bound available


Params:

1. **_newController** *of type `address`*
2. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

[Back to the top ↑](#controllerinterface)
