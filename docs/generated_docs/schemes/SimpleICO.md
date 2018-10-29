# SimpleICO
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/SimpleICO.sol)
> SimpleICO scheme.


**Execution cost**: less than 61389 gas

**Deployment cost**: less than 543600 gas

**Combined cost**: less than 604989 gas

## Constructor




## Events
### DonationReceived(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*
2. **_incomingEther** *of type `uint256`*
3. **_tokensAmount** *of type `uint256`*

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
### Pause()


**Execution cost**: No bound available



--- 
### Unpause()


**Execution cost**: No bound available



## Fallback


**Execution cost**: less than 1864 gas

**Attributes**: payable



## Methods
### paused()


**Execution cost**: less than 646 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### donate(address)
>
> Donating ethers to get tokens. If the donation is higher than the remaining ethers in the "cap", The donator will get the change in ethers.


**Execution cost**: less than 1613 gas

**Attributes**: payable


Params:

1. **_beneficiary** *of type `address`*

    > The donator's address - which will receive the ICO's tokens.


Returns:

> uint number of tokens minted for the donation.

1. **output_0** *of type `uint256`*

--- 
### avatar()


**Execution cost**: less than 691 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### cap()


**Execution cost**: less than 450 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### beneficiary()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### pause()
>
> called by the owner to pause, triggers stopped state


**Execution cost**: less than 21999 gas




--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23090 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### isActive()
>
> Check is the ICO active (halted is still considered active). Active ICO: 1. The ICO didn't reach it's cap yet. 2. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"


**Execution cost**: less than 1123 gas

**Attributes**: constant



Returns:

> bool which represents a successful of the function

1. **output_0** *of type `bool`*

--- 
### endBlock()


**Execution cost**: less than 406 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22270 gas




--- 
### startBlock()


**Execution cost**: less than 516 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 779 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### price()


**Execution cost**: less than 648 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### totalEthRaised()


**Execution cost**: less than 670 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### init(address,address,uint256,uint256,uint256,uint256,address)


**Execution cost**: less than 141829 gas


Params:

1. **_owner** *of type `address`*
2. **_avatar** *of type `address`*
3. **_cap** *of type `uint256`*
4. **_price** *of type `uint256`*
5. **_startBlock** *of type `uint256`*
6. **_endBlock** *of type `uint256`*
7. **_beneficiary** *of type `address`*


--- 
### unpause()
>
> called by the owner to unpause, returns to normal state


**Execution cost**: less than 21823 gas




[Back to the top ↑](#simpleico)
