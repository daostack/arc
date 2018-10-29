# Controller
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Controller.sol)
> Controller contract


**Execution cost**: less than 24088 gas

**Deployment cost**: less than 3402200 gas

**Combined cost**: less than 3426288 gas

## Constructor




## Events
### AddConstraint(address,uint8)


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*
2. **_when** *of type `uint8`*

--- 
### BurnReputation(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_from** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### MintReputation(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_to** *of type `address`*
3. **_amount** *of type `uint256`*

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
### RemoveConstraint(address,uint256,bool)


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*
2. **_idx** *of type `uint256`*
3. **_isPre** *of type `bool`*

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


**Execution cost**: less than 917 gas



## Methods
### isSchemeRegistered(address)


**Execution cost**: less than 1090 gas

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getNativeReputation()
>
> getNativeReputation


**Execution cost**: less than 601 gas

**Attributes**: constant



Returns:

> organization native reputation

1. **output_0** *of type `address`*

--- 
### constraintsPre(uint256)


**Execution cost**: less than 944 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### constraintsPost(uint256)


**Execution cost**: less than 966 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### burnReputation(uint256,address)
>
> Burns `_amount` of reputation from `_from`


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*

    > amount of reputation to burn

2. **_from** *of type `address`*

    > The address that will lose the reputation


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenTransfer(address,address,uint256)
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


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### constraintsCount()
>
> constraintsCount return the constraints pre and post count


**Execution cost**: less than 785 gas

**Attributes**: constant



Returns:

> uint constraints count.

1. **output_0** *of type `uint256`*

--- 
### genericCall(address,bytes)
>
> perform a generic call to an arbitrary contract


**Execution cost**: No bound available


Params:

1. **_contract** *of type `address`*

    > the contract's address to call

2. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_contract` address.


Returns:

> bytes32  - the return value of the called _contract's function.

1. **returnValue** *of type `bytes32`*

--- 
### avatar()


**Execution cost**: less than 776 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### externalTokenDecreaseApproval(address,address,uint256)
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


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenTransferFrom(address,address,address,uint256)
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


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### addConstraint(address)
>
> add or update constraint


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

    > the address of the constraint to be added.


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### externalTokenIncreaseApproval(address,address,uint256)
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


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### sendEther(uint256,address)
>
> send some ether


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*

    > the amount of ether (in Wei) to send

2. **_to** *of type `address`*

    > address of the beneficiary


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### init(address,address)


**Execution cost**: No bound available


Params:

1. **creator** *of type `address`*
2. **_avatar** *of type `address`*


--- 
### getSchemePermissions(address)


**Execution cost**: less than 1107 gas

**Attributes**: constant


Params:

1. **_scheme** *of type `address`*

Returns:


1. **output_0** *of type `bytes4`*

--- 
### registerScheme(address,bytes4)
>
> register a scheme


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme

2. **_permissions** *of type `bytes4`*

    > the permissions the new scheme will have


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### isConstraintRegistered(address)


**Execution cost**: less than 945 gas

**Attributes**: constant


Params:

1. **_constraint** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### mintReputation(uint256,address)
>
> Mint `_amount` of reputation that are assigned to `_to` .


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*

    > amount of reputation to mint

2. **_to** *of type `address`*

    > beneficiary address


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### mintTokens(uint256,address)
>
> mint tokens .


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*

    > amount of token to mint

2. **_beneficiary** *of type `address`*

    > beneficiary address


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### nativeReputation()


**Execution cost**: less than 908 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nativeToken()


**Execution cost**: less than 1150 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### newController()


**Execution cost**: less than 710 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### removeConstraint(address)
>
> remove constraint


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

    > the address of the constraint to be remove.


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### unregisterScheme(address)
>
> unregister a scheme


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### unregisterSelf()
>
> unregister the caller's scheme


**Execution cost**: less than 22789 gas



Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### upgradeController(address)
>
> upgrade the Controller     The function will trigger an event 'UpgradeController'.


**Execution cost**: No bound available


Params:

1. **_newController** *of type `address`*

    > the address of the new controller.


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

[Back to the top ↑](#controller)
