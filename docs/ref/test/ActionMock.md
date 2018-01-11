# *contract* ActionMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/ActionMock.sol))


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
*Parameters:*
1. **_sender** *of type address*
2. **_param** *of type bytes32*

## Fallback
*Nothing*
## Functions
### *function* genericAction
**nonpayable**

*Inputs:*
1. **avatar** *of type address*
2. **params** *of type bytes32[]*

*Returns:*
1. **bool**

### *function* action
**nonpayable**

*Inputs:*
1. **params** *of type bytes32[]*

*Returns:*
1. **bool**

