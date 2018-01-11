# *contract* Reputation ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Reputation.sol))
*Total creation gas: **222600***
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
*Parameters:*
*Nothing*

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* Mint
*Parameters:*
1. **to** *of type address*
2. **amount** *of type int256*

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* transferOwnership
*Execution gas: **22854***
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* totalSupply
*Execution gas: **373***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* setReputation
*Execution gas: **Infinite***
**nonpayable**

setting reputation amount for a given address, updating the total supply as well
*Inputs:*
1. **_to** *of type address* - the address which we set it's reputation amount
2. **_amount** *of type uint256* - the new reputation amount to be setted

*Returns:*
bool which represents a success

### *function* reputationOf
*Execution gas: **683***
**constant**
**view**

return the reputation amount of a given owner
*Inputs:*
1. **_owner** *of type address* - an address of the owner which we want to get his reputation

*Returns:*
*Nothing*

### *function* owner
*Execution gas: **573***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* mint
*Execution gas: **Infinite***
**nonpayable**

adding/reducing reputation of a given address, updating the total supply, and triggering an event of the operation
*Inputs:*
1. **_to** *of type address* - the address which we gives/takes reputation amount
2. **_amount** *of type int256* - the reputation amount to be added/reduced

*Returns:*
bool which represents a successful of the function

### *function* decimals
*Execution gas: **395***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

