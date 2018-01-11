# *contract* MirrorContractICO ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SimpleICO.sol))
*Code deposit upper limit: **158400 gas***
*Executionas upper limit: **61130 gas***

An avatar contract for ICO.
- [Constructors](#constructors)
    - [MirrorContractICO(address, address)](#constructor-mirrorcontracticoaddress-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
- [Fallback](#fallback)
- [Functions](#functions)
    - [transferOwnership](#function-transferownership)
    - [simpleICO](#function-simpleico)
    - [owner](#function-owner)
    - [organization](#function-organization)
    - [destroyAndSend](#function-destroyandsend)
    - [destroy](#function-destroy)
## Constructors
### *constructor* MirrorContractICO(address, address)
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Params:*
    1. **_organization** *of type address*
    2. **_simpleICO** *of type address*


## Events
### *event* OwnershipTransferred
*Params:*
    1. **previousOwner** *of type address*
    2. **newOwner** *of type address*


## Fallback
*Execution cost upper limit: **Infinite gas***
**payable**


## Functions
### *function* transferOwnership
*Execution cost upper limit: **Infinite gas***
**nonpayable**
Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
    1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* simpleICO
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* owner
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* organization
*Execution cost upper limit: **Infinite gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* destroyAndSend
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_recipient** *of type address*

*Returns:*
*Nothing*


### *function* destroy
*Execution cost upper limit: **Infinite gas***
**nonpayable**
Transfers the current balance to the owner and terminates the contract.
*Inputs:*
*Nothing*

*Returns:*
*Nothing*


