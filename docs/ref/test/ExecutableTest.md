# *contract* ExecutableTest ([source](https://github.com/daostack/daostack/tree/master/./contracts/test/ExecutableTest.sol))
*Code deposit upper limit: **74000 gas***
*Executionas upper limit: **118 gas***

- [Constructors](#constructors)

- [Events](#events)
    - [LogUint](#event-loguint)
    - [LogString](#event-logstring)
    - [LogInt](#event-logint)
    - [LogBytes32](#event-logbytes32)
    - [LogBytes](#event-logbytes)
    - [LogBool](#event-logbool)
    - [LogAddress](#event-logaddress)
- [Fallback](#fallback)
- [Functions](#functions)
    - [execute](#function-execute)
## Constructors

## Events
### *event* LogUint
*Params:*
    1. **_msg** *of type uint256*


### *event* LogString
*Params:*
    1. **_msg** *of type string*


### *event* LogInt
*Params:*
    1. **_msg** *of type int256*


### *event* LogBytes32
*Params:*
    1. **_msg** *of type bytes32*


### *event* LogBytes
*Params:*
    1. **_msg** *of type bytes*


### *event* LogBool
*Params:*
    1. **_msg** *of type bool*


### *event* LogAddress
*Params:*
    1. **_msg** *of type address*


## Fallback
*Nothing*
## Functions
### *function* execute
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_proposalId** *of type bytes32*
    2. **_avatar** *of type address*
    3. **_param** *of type int256*

*Returns:*
    1. **unnamed** *of type bool*


