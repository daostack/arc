# Reputation
[see the source](https://github.com/daostack/daostack/tree/master/contracts/controller/Reputation.sol)

*Code deposit cost: **less than 168000 gas.***

*Execution cost: **less than 50663 gas.***

*Total deploy cost(deposit + execution): **less than 218663 gas.***

> Simple static reputation storage

A *Reputation* is a way of assigning importance to participants and their votes. 
*Reputation* is similar to regular tokens but with one crucial difference: **It is non-transferable**.
## Reference
### Constructors
#### *constructor* Reputation()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* OwnershipTransferred
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* Mint
*Params:*

1. **to** *of type address*
2. **amount** *of type int256*


### Fallback
*Nothing*
### Functions
#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22832 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* totalSupply

*Execution cost: **less than 373 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* reputationOf
> return the reputation amount of a given owner

*Execution cost: **less than 661 gas.***

**constant | view**

*Inputs:*

1. **_owner** *of type address- an address of the owner which we want to get his reputation*

*Returns:*

1. **balance** *of type uint256*


#### *function* owner

*Execution cost: **less than 573 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* mint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_to** *of type address*
2. **_amount** *of type int256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* decimals

*Execution cost: **less than 395 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


