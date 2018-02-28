# GlobalConstraintMock
[see the source](https://github.com/daostack/arc/tree/master/contracts/test/GlobalConstraintMock.sol)


**Execution cost**: less than 178 gas

**Deployment cost**: less than 136400 gas

**Combined cost**: less than 136578 gas




## Methods
### currentCallPhase()


**Execution cost**: less than 421 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### post(address,bytes32,bytes32)


**Execution cost**: less than 562 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*
3. **method** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### pre(address,bytes32,bytes32)


**Execution cost**: less than 573 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*
3. **method** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setConstraint(bytes32,bool,bool)


**Execution cost**: less than 40910 gas


Params:

1. **method** *of type `bytes32`*
2. **pre** *of type `bool`*
3. **post** *of type `bool`*

Returns:


1. **output_0** *of type `bool`*

--- 
### testParams(bytes32)


**Execution cost**: less than 554 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **pre** *of type `bool`*
2. **post** *of type `bool`*

--- 
### when()


**Execution cost**: less than 531 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

[Back to the top ↑](#globalconstraintmock)
