# Migrations
[see the source](https://github.com/daostack/daostack/tree/master/contracts/Migrations.sol)

*Code deposit cost: **less than 97400 gas.***

*Execution cost: **less than 20515 gas.***

*Total deploy cost(deposit + execution): **less than 117915 gas.***

> 

## Reference
### Constructors
#### *constructor* Migrations()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
*Nothing*
### Fallback
*Nothing*
### Functions
#### *function* upgrade

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **newAddress** *of type address*

*Returns:*

*Nothing*


#### *function* setCompleted

*Execution cost: **less than 20520 gas.***

**nonpayable**

*Inputs:*

1. **completed** *of type uint256*

*Returns:*

*Nothing*


#### *function* owner

*Execution cost: **less than 570 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* last_completed_migration

*Execution cost: **less than 395 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


