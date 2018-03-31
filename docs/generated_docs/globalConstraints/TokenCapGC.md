# TokenCapGC
[see the source](https://github.com/daostack/arc/tree/master/contracts/globalConstraints/TokenCapGC.sol)
> Token Cap Global Constraint


**Execution cost**: less than 209 gas

**Deployment cost**: less than 169800 gas

**Combined cost**: less than 170009 gas




## Methods
### getParametersHash(address,uint256)
>
> calculate and returns the hash of the given parameters


**Execution cost**: less than 485 gas

**Attributes**: constant


Params:

1. **_token** *of type `address`*

    > the token to add to the params.

2. **_cap** *of type `uint256`*

    > the cap to check the total supply against.


Returns:

> the calculated parameters hash

1. **output_0** *of type `bytes32`*

--- 
### parameters(bytes32)


**Execution cost**: less than 846 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **token** *of type `address`*
2. **cap** *of type `uint256`*

--- 
### post(address,bytes32,bytes32)
>
> check the total supply cap.


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **_paramsHash** *of type `bytes32`*

    > the parameters hash to check the total supply cap against.

3. **param_2** *of type `bytes32`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### pre(address,bytes32,bytes32)
>
> check the constraint after the action. This global constraint only checks the state after the action, so here we just return true:


**Execution cost**: less than 347 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*
3. **param_2** *of type `bytes32`*

Returns:

> true

1. **output_0** *of type `bool`*

--- 
### setParameters(address,uint256)
>
> adding a new set of parameters


**Execution cost**: less than 40998 gas


Params:

1. **_token** *of type `address`*

    > the token to add to the params.

2. **_cap** *of type `uint256`*

    > the cap to check the total supply against.


Returns:

> the calculated parameters hash

1. **output_0** *of type `bytes32`*

--- 
### when()
>
> when return if this globalConstraints is pre, post or both.


**Execution cost**: less than 325 gas

**Attributes**: constant



Returns:

> CallPhase enum indication  Pre, Post or PreAndPost.

1. **output_0** *of type `uint8`*

[Back to the top ↑](#tokencapgc)
