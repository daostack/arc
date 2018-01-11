# *contract* MirrorContractICO ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SimpleICO.sol))
An avatar contract for ICO.

- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
- [Functions](#functions)
    - [transferOwnership](#function-transferownership)
    - [simpleICO](#function-simpleico)
    - [owner](#function-owner)
    - [organization](#function-organization)
    - [destroyAndSend](#function-destroyandsend)
    - [destroy](#function-destroy)

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

## Functions
### *function* transferOwnership
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* simpleICO
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* owner
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organization
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* destroyAndSend
**nonpayable**

*Inputs:*
1. **_recipient** *of type address*

*Returns:*
*Nothing*

### *function* destroy
**nonpayable**

Transfers the current balance to the owner and terminates the contract.
*Inputs:*
*Nothing*

*Returns:*
*Nothing*

