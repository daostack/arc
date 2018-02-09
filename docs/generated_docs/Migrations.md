# Migrations
[see the source](https://github.com/daostack/arc/tree/master/contracts/Migrations.sol)

*Code deposit cost: **less than 97400 gas.***

*Execution cost: **less than 20515 gas.***

*Total deploy cost(deposit + execution): **less than 117915 gas.***

> 
## Constructors
### Migrations()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### upgrade(address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **newAddress** *of type address*

*Returns:*

*Nothing*

---
### setCompleted(uint256)

*Execution cost: **less than 20520 gas.***

**nonpayable**

*Inputs:*

1. **completed** *of type uint256*

*Returns:*

*Nothing*

---
### owner()

*Execution cost: **less than 570 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### last_completed_migration()

*Execution cost: **less than 395 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


