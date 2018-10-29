# ActorsFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/ActorsFactory.sol)


**Execution cost**: less than 61332 gas

**Deployment cost**: less than 394200 gas

**Combined cost**: less than 455532 gas

## Constructor



Params:

1. **_avatarLibraryAddress** *of type `address`*
2. **_tokenLibraryAddress** *of type `address`*

## Events
### AvatarCreated(address)


**Execution cost**: No bound available


Params:

1. **newAvatarAddress** *of type `address`*

--- 
### CloneCreated(address,address)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **clone** *of type `address`*

--- 
### DAOTokenCreated(address)


**Execution cost**: No bound available


Params:

1. **newTokenAddress** *of type `address`*

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
### avatarLibraryAddress()


**Execution cost**: less than 603 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createAvatar(string,address,address)


**Execution cost**: No bound available


Params:

1. **_orgName** *of type `string`*
2. **_nativeToken** *of type `address`*
3. **_nativeReputation** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### createDAOToken(string,string,uint256)


**Execution cost**: No bound available


Params:

1. **_name** *of type `string`*
2. **_symbol** *of type `string`*
3. **_cap** *of type `uint256`*

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
### tokenLibraryAddress()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22892 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#actorsfactory)
