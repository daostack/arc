# MirrorContractICO
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/SimpleICO.sol)
> An avatar contract for ICO.


**Execution cost**: less than 61130 gas

**Deployment cost**: less than 155800 gas

**Combined cost**: less than 216930 gas

## Constructor



Params:

1. **_organization** *of type `address`*
2. **_simpleICO** *of type `address`*

## Events
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
### destroy()
>
> Transfers the current balance to the owner and terminates the contract.


**Execution cost**: No bound available




--- 
### destroyAndSend(address)


**Execution cost**: No bound available


Params:

1. **_recipient** *of type `address`*


--- 
### organization()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### owner()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### simpleICO()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: No bound available


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#mirrorcontractico)
