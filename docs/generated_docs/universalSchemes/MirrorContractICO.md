# MirrorContractICO
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/SimpleICO.sol)

*Code deposit cost: **less than 158400 gas.***

*Execution cost: **less than 61130 gas.***

*Total deploy cost(deposit + execution): **less than 219530 gas.***

> An avatar contract for ICO.


## Reference
### Constructors
#### *constructor* MirrorContractICO(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_organization** *of type address*
2. **_simpleICO** *of type address*


### Events
#### *event* OwnershipTransferred
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### Fallback
*Execution cost: **No bound available.***

**payable**



### Functions
#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* simpleICO

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* owner

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* organization

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* destroyAndSend

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_recipient** *of type address*

*Returns:*

*Nothing*


#### *function* destroy
> Transfers the current balance to the owner and terminates the contract.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

*Nothing*

*Returns:*

*Nothing*


