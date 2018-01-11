# *contract* GlobalConstraintMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/GlobalConstraintMock.sol))


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
*Nothing*
## Functions
### *function* setConstraint
**nonpayable**

*Inputs:*
1. **method** *of type bytes*
2. **pre** *of type bool*
3. **post** *of type bool*

*Returns:*
1. **bool**

### *function* pre
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*
1. **bool**

### *function* post
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*
3. **method** *of type bytes*

*Returns:*
1. **bool**

