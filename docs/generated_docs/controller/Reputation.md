# Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Reputation.sol)
> Simple static reputation storage


**Execution cost**: less than 50663 gas

**Deployment cost**: less than 168000 gas

**Combined cost**: less than 218663 gas

## Constructor




## Events
### Mint(address,int256)


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*
2. **amount** *of type `int256`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*


## Methods
### decimals()


**Execution cost**: less than 395 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### mint(address,int256)
>
> adding/reducing reputation of a given address, updating the total supply, and triggering an event of the operation.


**Execution cost**: less than 43407 gas


Params:

1. **_to** *of type `address`*

    > the address which we gives/takes reputation amount

2. **_amount** *of type `int256`*

    > the reputation amount to be added/reduced


Returns:

> bool which represents a successful of the function

1. **output_0** *of type `bool`*

--- 
### owner()


**Execution cost**: less than 573 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### reputationOf(address)
>
> return the reputation amount of a given owner


**Execution cost**: less than 661 gas

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


**Execution cost**: less than 22832 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#reputation)
