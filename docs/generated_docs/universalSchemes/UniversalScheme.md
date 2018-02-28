# UniversalScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/UniversalScheme.sol)


**Execution cost**: less than 20496 gas

**Deployment cost**: less than 98600 gas

**Combined cost**: less than 119096 gas


## Events
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*


## Methods
### hashedParameters()


**Execution cost**: less than 439 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### owner()


**Execution cost**: less than 548 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22788 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20443 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#universalscheme)
