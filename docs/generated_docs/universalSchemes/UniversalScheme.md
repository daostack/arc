# UniversalScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/UniversalScheme.sol)

*Code deposit cost: **less than 98600 gas.***

*Execution cost: **less than 20496 gas.***

*Total deploy cost(deposit + execution): **less than 119096 gas.***

> 
## Constructors
*Nothing*
## Events
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
### updateParameters(bytes32)

*Execution cost: **less than 20443 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22788 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### owner()

*Execution cost: **less than 548 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### hashedParameters()

*Execution cost: **less than 439 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*


