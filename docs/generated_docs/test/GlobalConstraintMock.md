# GlobalConstraintMock
[see the source](https://github.com/daostack/arc/tree/master/contracts/test/GlobalConstraintMock.sol)

*Code deposit cost: **less than 225200 gas.***

*Execution cost: **less than 264 gas.***

*Total deploy cost(deposit + execution): **less than 225464 gas.***

> 
## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### when()

*Execution cost: **less than 487 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint8*

---
### setConstraint(bytes, bool, bool)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **method** *of type bytes*
2. **pre** *of type bool*
3. **post** *of type bool*

*Returns:*

1. **unnamed** *of type bool*

---
### pre(address, bytes32, bytes)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*

1. **unnamed** *of type bool*

---
### post(address, bytes32, bytes)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*

1. **unnamed** *of type bool*


