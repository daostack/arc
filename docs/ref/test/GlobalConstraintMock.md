# *contract* GlobalConstraintMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/GlobalConstraintMock.sol))
*Code deposit upper limit: **192400 gas***
*Executionas upper limit: **233 gas***

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
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **method** *of type bytes*
    2. **pre** *of type bool*
    3. **post** *of type bool*

*Returns:*
    1. **unnamed** *of type bool*


### *function* pre
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*
    2. **unnamed** *of type bytes32*
    3. **method** *of type bytes*

*Returns:*
    1. **unnamed** *of type bool*


### *function* post
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*
    2. **unnamed** *of type bytes32*
    3. **method** *of type bytes*

*Returns:*
    1. **unnamed** *of type bool*


