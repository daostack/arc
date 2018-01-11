# *contract* ActionMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/ActionMock.sol))
*Code deposit upper limit: **142000 gas***
*Executionas upper limit: **185 gas***

- [Constructors](#constructors)

- [Events](#events)
    - [Action](#event-action)
- [Fallback](#fallback)
- [Functions](#functions)
    - [genericAction](#function-genericaction)
    - [action](#function-action)
## Constructors

## Events
### *event* Action
*Params:*
    1. **_sender** *of type address*
    2. **_param** *of type bytes32*


## Fallback
*Nothing*
## Functions
### *function* genericAction
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **avatar** *of type address*
    2. **params** *of type bytes32[]*

*Returns:*
    1. **unnamed** *of type bool*


### *function* action
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **params** *of type bytes32[]*

*Returns:*
    1. **unnamed** *of type bool*


