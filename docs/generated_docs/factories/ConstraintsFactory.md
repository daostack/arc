# ConstraintsFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/ConstraintsFactory.sol)


**Execution cost**: less than 20568 gas

**Deployment cost**: less than 259600 gas

**Combined cost**: less than 280168 gas


## Events
### CloneCreated(address,address)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **clone** *of type `address`*

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
### TokenCapConstraintCreated(address)


**Execution cost**: No bound available


Params:

1. **_newConstraintAddress** *of type `address`*

--- 
### TokenCapConstraintLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*


## Methods
### createTokenCapConstraint(address,uint256)


**Execution cost**: No bound available


Params:

1. **_token** *of type `address`*
2. **_cap** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### owner()


**Execution cost**: less than 559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22072 gas




--- 
### setTokenCapConstraintLibraryAddress(address)


**Execution cost**: less than 22680 gas


Params:

1. **_tokenCapConstraintLibraryAddress** *of type `address`*


--- 
### tokenCapConstraintLibraryAddress()


**Execution cost**: less than 603 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22870 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#constraintsfactory)
