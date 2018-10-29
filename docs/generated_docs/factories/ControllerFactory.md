# ControllerFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/ControllerFactory.sol)


**Execution cost**: less than 40917 gas

**Deployment cost**: less than 220800 gas

**Combined cost**: less than 261717 gas

## Constructor



Params:

1. **_controllerLibraryAddress** *of type `address`*

## Events
### CloneCreated(address,address)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **clone** *of type `address`*

--- 
### ControllerCreated(address)


**Execution cost**: No bound available


Params:

1. **newControllerAddress** *of type `address`*

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


## Methods
### controllerLibraryAddress()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createController(address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### owner()


**Execution cost**: less than 581 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22094 gas




--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22826 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#controllerfactory)
