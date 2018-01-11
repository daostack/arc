# *contract* ActionMock ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/ActionMock.sol))
*Total creation gas: **142000***


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
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* genericAction
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **avatar** *of type address*
2. **params** *of type bytes32[]*

*Returns:*
1. **bool**

### *function* action
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **params** *of type bytes32[]*

*Returns:*
1. **bool**

