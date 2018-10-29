# DAOToken
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/DAOToken.sol)
> DAOToken, base on zeppelin contract.


**Execution cost**: No bound available

**Deployment cost**: less than 1012000 gas

**Combined cost**: No bound available

## Constructor




## Events
### Approval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **owner** *of type `address`*
2. **spender** *of type `address`*
3. **value** *of type `uint256`*

--- 
### Burn(address,uint256)


**Execution cost**: No bound available


Params:

1. **burner** *of type `address`*
2. **value** *of type `uint256`*

--- 
### Mint(address,uint256)


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*
2. **amount** *of type `uint256`*

--- 
### MintFinished()


**Execution cost**: No bound available



--- 
### OwnershipRenounced(address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### Transfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **value** *of type `uint256`*


## Methods
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22339 gas




--- 
### mintingFinished()


**Execution cost**: less than 470 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### approve(address,uint256)
>
> Approve the passed address to spend the specified amount of tokens on behalf of msg.sender. Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: less than 22376 gas


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_value** *of type `uint256`*

    > The amount of tokens to be spent.


Returns:


1. **output_0** *of type `bool`*

--- 
### allowance(address,address)
>
> Function to check the amount of tokens that an owner allowed to a spender.


**Execution cost**: less than 1214 gas

**Attributes**: constant


Params:

1. **_owner** *of type `address`*

    > address The address which owns the funds.

2. **_spender** *of type `address`*

    > address The address which will spend the funds.


Returns:

> A uint256 specifying the amount of tokens still available for the spender.

1. **output_0** *of type `uint256`*

--- 
### increaseApproval(address,uint256)
>
> Increase the amount of tokens that an owner allowed to a spender. approve should be called when allowed[_spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_addedValue** *of type `uint256`*

    > The amount of tokens to increase the allowance by.


Returns:


1. **output_0** *of type `bool`*

--- 
### decimals()


**Execution cost**: less than 303 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### cap()


**Execution cost**: less than 516 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### init(address,string,string,uint256)
>
> Init function - initializes the instance of the contract


**Execution cost**: No bound available


Params:

1. **_owner** *of type `address`*
2. **_name** *of type `string`*

    > - token name

3. **_symbol** *of type `string`*

    > - token symbol

4. **_cap** *of type `uint256`*

    > - token cap - 0 value means no cap



--- 
### mint(address,uint256)
>
> Function to mint tokens


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*

    > The address that will receive the minted tokens.

2. **_amount** *of type `uint256`*

    > The amount of tokens to mint.


Returns:

> A boolean that indicates if the operation was successful.

1. **output_0** *of type `bool`*

--- 
### burn(uint256)
>
> Burns a specific amount of tokens.


**Execution cost**: No bound available


Params:

1. **_value** *of type `uint256`*

    > The amount of token to be burned.



--- 
### decreaseApproval(address,uint256)
>
> Decrease the amount of tokens that an owner allowed to a spender. approve should be called when allowed[_spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_subtractedValue** *of type `uint256`*

    > The amount of tokens to decrease the allowance by.


Returns:


1. **output_0** *of type `bool`*

--- 
### balanceOf(address)
>
> Gets the balance of the specified address.


**Execution cost**: less than 851 gas

**Attributes**: constant


Params:

1. **_owner** *of type `address`*

    > The address to query the the balance of.


Returns:

> An uint256 representing the amount owned by the passed address.

1. **output_0** *of type `uint256`*

--- 
### decreaseApprovalAndCall(address,uint256,bytes)
>
> Addition to StandardToken methods. Decrease the amount of tokens that an owner allowed to a spender and execute a call with the sent data. approve should be called when allowed[_spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_subtractedValue** *of type `uint256`*

    > The amount of tokens to decrease the allowance by.

3. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_spender` address.


Returns:


1. **output_0** *of type `bool`*

--- 
### finishMinting()
>
> Function to stop minting new tokens.


**Execution cost**: less than 22136 gas



Returns:

> True if the operation was successful.

1. **output_0** *of type `bool`*

--- 
### approveAndCall(address,uint256,bytes)
>
> Addition to ERC20 token methods. It allows to approve the transfer of value and execute a call with the sent data. Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_spender** *of type `address`*

    > The address that will spend the funds.

2. **_value** *of type `uint256`*

    > The amount of tokens to be spent.

3. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_spender` address.


Returns:

> true if the call function was executed successfully

1. **output_0** *of type `bool`*

--- 
### increaseApprovalAndCall(address,uint256,bytes)
>
> Addition to StandardToken methods. Increase the amount of tokens that an owner allowed to a spender and execute a call with the sent data. approve should be called when allowed[_spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_addedValue** *of type `uint256`*

    > The amount of tokens to increase the allowance by.

3. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_spender` address.


Returns:


1. **output_0** *of type `bool`*

--- 
### name()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### owner()


**Execution cost**: less than 845 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### symbol()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### totalSupply()
>
> Total number of tokens in existence


**Execution cost**: less than 451 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transfer(address,uint256)
>
> Transfer token for a specified address


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*

    > The address to transfer to.

2. **_value** *of type `uint256`*

    > The amount to be transferred.


Returns:


1. **output_0** *of type `bool`*

--- 
### transferAndCall(address,uint256,bytes)
>
> Addition to ERC20 token methods. Transfer tokens to a specified address and execute a call with the sent data on the same transaction


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_to** *of type `address`*

    > address The address which you want to transfer to

2. **_value** *of type `uint256`*

    > uint256 the amout of tokens to be transfered

3. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_to` address.


Returns:

> true if the call function was executed successfully

1. **output_0** *of type `bool`*

--- 
### transferFrom(address,address,uint256)
>
> Transfer tokens from one address to another


**Execution cost**: No bound available


Params:

1. **_from** *of type `address`*

    > address The address which you want to send tokens from

2. **_to** *of type `address`*

    > address The address which you want to transfer to

3. **_value** *of type `uint256`*

    > uint256 the amount of tokens to be transferred


Returns:


1. **output_0** *of type `bool`*

--- 
### transferFromAndCall(address,address,uint256,bytes)
>
> Addition to ERC20 token methods. Transfer tokens from one address to another and make a contract call on the same transaction


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_from** *of type `address`*

    > The address which you want to send tokens from

2. **_to** *of type `address`*

    > The address which you want to transfer to

3. **_value** *of type `uint256`*

    > The amout of tokens to be transferred

4. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_to` address.


Returns:

> true if the call function was executed successfully

1. **output_0** *of type `bool`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23288 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#daotoken)
