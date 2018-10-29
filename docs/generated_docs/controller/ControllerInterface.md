# ControllerInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/ControllerInterface.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available




## Methods
### externalTokenIncreaseApproval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_addedValue** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getNativeReputation()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### burnReputation(uint256,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_from** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### constraintsCount()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### genericCall(address,bytes)


**Execution cost**: No bound available


Params:

1. **_contract** *of type `address`*
2. **_data** *of type `bytes`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### externalTokenTransfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_to** *of type `address`*
3. **_value** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### externalTokenDecreaseApproval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_subtractedValue** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### externalTokenTransferFrom(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_from** *of type `address`*
3. **_to** *of type `address`*
4. **_value** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### addConstraint(address)


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### upgradeController(address)


**Execution cost**: No bound available


Params:

1. **_newController** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isSchemeRegistered(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getSchemePermissions(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*

Returns:


1. **output_0** *of type `bytes4`*

--- 
### isConstraintRegistered(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_constraint** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintReputation(uint256,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_to** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintTokens(uint256,address)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerScheme(address,bytes4)


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*
2. **_permissions** *of type `bytes4`*

Returns:


1. **output_0** *of type `bool`*

--- 
### removeConstraint(address)


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### sendEther(uint256,address)


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*
2. **_to** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### unregisterScheme(address)


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### unregisterSelf()


**Execution cost**: No bound available



Returns:


1. **output_0** *of type `bool`*

[Back to the top ↑](#controllerinterface)
