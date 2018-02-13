# Controller
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Controller.sol)
> Controller contract


**Execution cost**: No bound available

**Deployment cost**: less than 2596800 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **_avatar** *of type `address`*

## Events
### ExternalTokenTransfer(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_externalToken** *of type `address`*
3. **_to** *of type `address`*
4. **_value** *of type `uint256`*

--- 
### MintReputation(address,address,int256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `int256`*

--- 
### AddGlobalConstraint(address,bytes32,uint8)


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*
2. **_params** *of type `bytes32`*
3. **_when** *of type `uint8`*

--- 
### ExternalTokenDecreaseApproval(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_externalToken** *of type `address`*
3. **_spender** *of type `address`*
4. **_value** *of type `uint256`*

--- 
### GenericAction(address,bytes32[])


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_params** *of type `bytes32[]`*

--- 
### ExternalTokenIncreaseApproval(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_externalToken** *of type `address`*
3. **_spender** *of type `address`*
4. **_value** *of type `uint256`*

--- 
### ExternalTokenTransferFrom(address,address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_externalToken** *of type `address`*
3. **_from** *of type `address`*
4. **_to** *of type `address`*
5. **_value** *of type `uint256`*

--- 
### MintTokens(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### RegisterScheme(address,address)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_scheme** *of type `address`*

--- 
### RemoveGlobalConstraint(address,uint256,bool)


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*
2. **_index** *of type `uint256`*
3. **_isPre** *of type `bool`*

--- 
### SendEther(address,uint256,address)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_amountInWei** *of type `uint256`*
3. **_to** *of type `address`*

--- 
### UnregisterScheme(address,address)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_scheme** *of type `address`*

--- 
### UpgradeController(address,address)


**Execution cost**: No bound available


Params:

1. **_oldController** *of type `address`*
2. **_newController** *of type `address`*

## Fallback


**Execution cost**: less than 764 gas



## Methods
### globalConstraintsRegisterPost(address)


**Execution cost**: less than 1148 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **register** *of type `bool`*
2. **index** *of type `uint256`*

--- 
### externalTokenTransferFrom(address,address,address,uint256,address)
>
> transfer token "from" address "to" address     One must to approve the amount of tokens which can be spend from the     "from" account.This can be done using externalTokenApprove.


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_from** *of type `address`*

    > address of the account to send from

3. **_to** *of type `address`*

    > address of the beneficiary

4. **_value** *of type `uint256`*

    > the amount of ether (in Wei) to send

5. **param_4** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### addGlobalConstraint(address,bytes32,address)
>
> add or update Global Constraint


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*

    > the address of the global constraint to be added.

2. **_params** *of type `bytes32`*

    > the constraint parameters hash.

3. **param_2** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenDecreaseApproval(address,address,uint256,address)
>
> decrease approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_spender** *of type `address`*

    > address

3. **_subtractedValue** *of type `uint256`*

    > the amount of ether (in Wei) which the approval is referring to.

4. **param_3** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenTransfer(address,address,uint256,address)
>
> send some amount of arbitrary ERC20 Tokens


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_to** *of type `address`*

    > address of the beneficiary

3. **_value** *of type `uint256`*

    > the amount of ether (in Wei) to send

4. **param_3** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenIncreaseApproval(address,address,uint256,address)
>
> increase approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_spender** *of type `address`*

    > address

3. **_addedValue** *of type `uint256`*

    > the amount of ether (in Wei) which the approval is referring to.

4. **param_3** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### avatar()


**Execution cost**: less than 746 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getSchemePermissions(address,address)


**Execution cost**: less than 1213 gas

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `bytes4`*

--- 
### removeGlobalConstraint(address,address)
>
> remove Global Constraint


**Execution cost**: No bound available


Params:

1. **_globalConstraint** *of type `address`*

    > the address of the global constraint to be remove.

2. **param_1** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### isGlobalConstraintRegistered(address,address)


**Execution cost**: less than 1641 gas

**Attributes**: constant


Params:

1. **_globalConstraint** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintTokens(uint256,address,address)
>
> mint tokens .


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*

    > amount of token to mint

2. **_beneficiary** *of type `address`*

    > beneficiary address

3. **param_2** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### globalConstraintsPre(uint256)


**Execution cost**: less than 1258 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **gcAddress** *of type `address`*
2. **params** *of type `bytes32`*

--- 
### globalConstraintsPost(uint256)


**Execution cost**: less than 1698 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **gcAddress** *of type `address`*
2. **params** *of type `bytes32`*

--- 
### mintReputation(int256,address,address)
>
> mint reputation .


**Execution cost**: No bound available


Params:

1. **_amount** *of type `int256`*

    > amount of reputation to mint

2. **_beneficiary** *of type `address`*

    > beneficiary address

3. **param_2** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### globalConstraintsRegisterPre(address)


**Execution cost**: less than 862 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **register** *of type `bool`*
2. **index** *of type `uint256`*

--- 
### globalConstraintsCount(address)
>
> globalConstraintsCount return the global constraint pre and post count


**Execution cost**: less than 1076 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:

> uint globalConstraintsPre count.uint globalConstraintsPost count.

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### nativeReputation()


**Execution cost**: less than 944 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### genericAction(bytes32[],address)
>
> do a generic delegate call to the contract which called us. This function use delegatecall and might expose the organization to security risk. Use this function only if you really knows what you are doing.


**Execution cost**: No bound available


Params:

1. **_params** *of type `bytes32[]`*

    > the params for the call.

2. **param_1** *of type `address`*

Returns:

> bool which represents success

1. **output_0** *of type `bool`*

--- 
### isSchemeRegistered(address,address)


**Execution cost**: less than 1172 gas

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerScheme(address,bytes32,bytes4,address)
>
> register a scheme


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme

2. **_paramsHash** *of type `bytes32`*

    > a hashed configuration of the usage of the scheme

3. **_permissions** *of type `bytes4`*

    > the permissions the new scheme will have

4. **param_3** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### newController()


**Execution cost**: less than 658 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getSchemeParameters(address,address)


**Execution cost**: less than 722 gas

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### nativeToken()


**Execution cost**: less than 1076 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### schemes(address)


**Execution cost**: less than 1433 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **paramsHash** *of type `bytes32`*
2. **permissions** *of type `bytes4`*

--- 
### sendEther(uint256,address,address)
>
> send some ether


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*

    > the amount of ether (in Wei) to send

2. **_to** *of type `address`*

    > address of the beneficiary

3. **param_2** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### unregisterScheme(address,address)
>
> unregister a scheme


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme

2. **param_1** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### unregisterSelf(address)
>
> unregister the caller's scheme


**Execution cost**: less than 28009 gas


Params:

1. **param_0** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### upgradeController(address,address)
>
> upgrade the Controller     The function will trigger an event 'UpgradeController'.


**Execution cost**: No bound available


Params:

1. **_newController** *of type `address`*

    > the address of the new controller.

2. **param_1** *of type `address`*

Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

[Back to the top ↑](#controller)
