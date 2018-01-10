# *contract* Reputation
Simple static reputation storage

- [Events](#events)
    - [OwnershipTransferred](#event-OwnershipTransferred)
    - [Mint](#event-Mint)
- [Functions](#functions)
    - [transferOwnership](#function-transferOwnership)
    - [totalSupply](#function-totalSupply)
    - [setReputation](#function-setReputation)
    - [reputationOf](#function-reputationOf)
    - [owner](#function-owner)
    - [mint](#function-mint)
    - [decimals](#function-decimals)

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* Mint
*Parameters:*
1. **to** *of type address*
2. **amount** *of type int256*

## Functions
### *function* transferOwnership

**nonpayable**


Allows the current owner to transfer control of the contract to a newOwner.

*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* totalSupply

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* setReputation

**nonpayable**


setting reputation amount for a given address, updating the total supply as well

*Inputs:*
1. **_to** *of type address* - the address which we set it's reputation amount
2. **_amount** *of type uint256* - the new reputation amount to be setted

*Returns:*
bool which represents a success

### *function* reputationOf

**constant**
**payable**
**view**


return the reputation amount of a given owner

*Inputs:*
1. **_owner** *of type address* - an address of the owner which we want to get his reputation

*Returns:*
*Nothing*

### *function* owner

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* mint

**nonpayable**


adding/reducing reputation of a given address, updating the total supply, and triggering an event of the operation

*Inputs:*
1. **_to** *of type address* - the address which we gives/takes reputation amount
2. **_amount** *of type int256* - the reputation amount to be added/reduced

*Returns:*
bool which represents a successful of the function

### *function* decimals

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

