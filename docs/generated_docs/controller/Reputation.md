# Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Reputation.sol)

*Code deposit cost: **less than 168000 gas.***

*Execution cost: **less than 50663 gas.***

*Total deploy cost(deposit + execution): **less than 218663 gas.***

> Simple static reputation storage

## Constructors
### Reputation()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### Mint(address, int256)
*Params:*

1. **to** *of type address*
2. **amount** *of type int256*


## Fallback
*Nothing*
## Functions
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22832 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### totalSupply()

*Execution cost: **less than 373 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*

---
### reputationOf(address)
> return the reputation amount of a given owner

*Execution cost: **less than 661 gas.***

**constant | view**

*Inputs:*

1. **_owner** *of type address- an address of the owner which we want to get his reputation*

*Returns:*

1. **balance** *of type uint256*

---
### owner()

*Execution cost: **less than 573 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### mint(address, int256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_to** *of type address*
2. **_amount** *of type int256*

*Returns:*

1. **unnamed** *of type bool*

---
### decimals()

*Execution cost: **less than 395 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


