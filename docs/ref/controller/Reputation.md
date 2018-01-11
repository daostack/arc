# *contract* Reputation ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Reputation.sol))
*Code deposit upper limit: **222600 gas***
*Executionas upper limit: **50712 gas***

Simple static reputation storage
- [Constructors](#constructors)
    - [Reputation()](#constructor-reputation)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [Mint](#event-mint)
- [Fallback](#fallback)
- [Functions](#functions)
    - [transferOwnership](#function-transferownership)
    - [totalSupply](#function-totalsupply)
    - [setReputation](#function-setreputation)
    - [reputationOf](#function-reputationof)
    - [owner](#function-owner)
    - [mint](#function-mint)
    - [decimals](#function-decimals)
## Constructors
### *constructor* Reputation()
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Params:*
*Nothing*


## Events
### *event* OwnershipTransferred
*Params:*
    1. **previousOwner** *of type address*
    2. **newOwner** *of type address*


### *event* Mint
*Params:*
    1. **to** *of type address*
    2. **amount** *of type int256*


## Fallback
*Nothing*
## Functions
### *function* transferOwnership
*Execution cost upper limit: **22854 gas***
**nonpayable**
Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
    1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* totalSupply
*Execution cost upper limit: **373 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type uint256*


### *function* setReputation
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_to** *of type address*
    2. **_amount** *of type uint256*

*Returns:*
    1. **unnamed** *of type bool*


### *function* reputationOf
*Execution cost upper limit: **683 gas***
**constant | view**
return the reputation amount of a given owner
*Inputs:*
    1. **_owner** *of type address- an address of the owner which we want to get his reputation*

*Returns:*
    1. **balance** *of type uint256*


### *function* owner
*Execution cost upper limit: **573 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* mint
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_to** *of type address*
    2. **_amount** *of type int256*

*Returns:*
    1. **unnamed** *of type bool*


### *function* decimals
*Execution cost upper limit: **395 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type uint256*


