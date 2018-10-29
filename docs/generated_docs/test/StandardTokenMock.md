# StandardTokenMock
[see the source](https://github.com/daostack/arc/tree/master/contracts/test/StandardTokenMock.sol)


**Execution cost**: less than 40605 gas

**Deployment cost**: less than 342000 gas

**Combined cost**: less than 382605 gas

## Constructor



Params:

1. **initialAccount** *of type `address`*
2. **initialBalance** *of type `uint256`*

## Events
### Approval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **owner** *of type `address`*
2. **spender** *of type `address`*
3. **value** *of type `uint256`*

--- 
### Transfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **value** *of type `uint256`*


## Methods
### allowance(address,address)
>
> Function to check the amount of tokens that an owner allowed to a spender.


**Execution cost**: less than 862 gas

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
### approve(address,uint256)
>
> Approve the passed address to spend the specified amount of tokens on behalf of msg.sender. Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: less than 22332 gas


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_value** *of type `uint256`*

    > The amount of tokens to be spent.


Returns:


1. **output_0** *of type `bool`*

--- 
### balanceOf(address)
>
> Gets the balance of the specified address.


**Execution cost**: less than 697 gas

**Attributes**: constant


Params:

1. **_owner** *of type `address`*

    > The address to query the the balance of.


Returns:

> An uint256 representing the amount owned by the passed address.

1. **output_0** *of type `uint256`*

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
### totalSupply()
>
> Total number of tokens in existence


**Execution cost**: less than 406 gas

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

[Back to the top ↑](#standardtokenmock)
