# Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Reputation.sol)
> Reputation system


**Execution cost**: less than 40630 gas

**Deployment cost**: less than 234600 gas

**Combined cost**: less than 275230 gas


## Events
### Burn(address,uint256)


**Execution cost**: No bound available


Params:

1. **_from** *of type `address`*
2. **_amount** *of type `uint256`*

--- 
### Mint(address,uint256)


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*
2. **_amount** *of type `uint256`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*


## Methods
### balances(address)


**Execution cost**: less than 542 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### burn(address,uint256)
>
> Burns `_amount` of reputation from `_from` if _amount tokens to burn > balances[_from] the balance of _from will turn to zero.


**Execution cost**: No bound available


Params:

1. **_from** *of type `address`*

    > The address that will lose the reputation

2. **_amount** *of type `uint256`*

    > The quantity of reputation to burn


Returns:

> True if the reputation are burned correctly

1. **output_0** *of type `bool`*

--- 
### decimals()


**Execution cost**: less than 417 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### mint(address,uint256)
>
> Generates `_amount` of reputation that are assigned to `_to`


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*

    > The address that will be assigned the new reputation

2. **_amount** *of type `uint256`*

    > The quantity of reputation to be generated


Returns:

> True if the reputation are generated correctly

1. **output_0** *of type `bool`*

--- 
### owner()


**Execution cost**: less than 617 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### reputationOf(address)
>
> return the reputation amount of a given owner


**Execution cost**: less than 727 gas

**Attributes**: constant


Params:

1. **_owner** *of type `address`*

    > an address of the owner which we want to get his reputation


Returns:


1. **balance** *of type `uint256`*

--- 
### totalSupply()


**Execution cost**: less than 373 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22898 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#reputation)
