# TokenCapConstraint
[see the source](https://github.com/daostack/arc/tree/master/contracts/constraints/TokenCapConstraint.sol)
> Token Cap Constraint


**Execution cost**: less than 20507 gas

**Deployment cost**: less than 167400 gas

**Combined cost**: less than 187907 gas

## Constructor






## Methods
### init(address,uint256)


**Execution cost**: less than 40930 gas


Params:

1. **_token** *of type `address`*
2. **_cap** *of type `uint256`*


--- 
### post(address,bytes32)
>
> check the total supply cap.


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### pre(address,bytes32)
>
> check the constraint after the action. This constraint only checks the state after the action, so here we just return true:


**Execution cost**: less than 307 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:

> true

1. **output_0** *of type `bool`*

--- 
### when()
>
> when return if this constraint is pre, post or both.


**Execution cost**: less than 289 gas

**Attributes**: constant



Returns:

> CallPhase enum indication Pre, Post or PreAndPost.

1. **output_0** *of type `uint8`*

[Back to the top ↑](#tokencapconstraint)
