# *contract* GlobalConstraintMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/GlobalConstraintMock.sol))
*Code deposit gas: **192400***
*Execution gas: **233***


- [Constructors](#constructors)

- [Events](#events)

- [Fallback](#fallback)
- [Functions](#functions)
    - [setConstraint](#function-setconstraint)
    - [pre](#function-pre)
    - [post](#function-post)
## Constructors

## Events

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* setConstraint
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **method** *of type bytes*
2. **pre** *of type bool*
3. **post** *of type bool*

*Returns:*
1. **bool**

### *function* pre
*Execution gas: **Infinite***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*
1. **bool**

### *function* post
*Execution gas: **Infinite***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*
1. **bool**

