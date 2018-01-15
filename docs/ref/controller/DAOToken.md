# *contract* DAOToken ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/DAOToken.sol))
*Code deposit cost: **less than 683600 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 683600 gas.***

> DAOToken, base on zeppelin contract.


## Reference
- [Constructors](#constructors)
    - [DAOToken(string, string)](#constructor-daotokenstring-string)
- [Events](#events)
    - [Transfer](#event-transfer)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [MintFinished](#event-mintfinished)
    - [Mint](#event-mint)
    - [Burn](#event-burn)
    - [Approval](#event-approval)
- [Fallback](#fallback)
- [Functions](#functions)
    - [balanceOf](#function-balanceof)
    - [mintingFinished](#function-mintingfinished)
    - [transferOwnership](#function-transferownership)
    - [totalSupply](#function-totalsupply)
    - [transferFrom](#function-transferfrom)
    - [transfer](#function-transfer)
    - [symbol](#function-symbol)
    - [owner](#function-owner)
    - [name](#function-name)
    - [mint](#function-mint)
    - [increaseApproval](#function-increaseapproval)
    - [finishMinting](#function-finishminting)
    - [destroyAndSend](#function-destroyandsend)
    - [destroy](#function-destroy)
    - [decreaseApproval](#function-decreaseapproval)
    - [burn](#function-burn)
    - [approve](#function-approve)
    - [allowance](#function-allowance)
    - [DECIMAL](#function-decimal)
### Constructors
### *constructor* DAOToken(string, string)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_name** *of type string*
2. **_symbol** *of type string*


### Events
### *event* Transfer
*Params:*
1. **from** *of type address*
2. **to** *of type address*
3. **value** *of type uint256*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* MintFinished
*Params:*
*Nothing*


### *event* Mint
*Params:*
1. **to** *of type address*
2. **amount** *of type uint256*


### *event* Burn
*Params:*
1. **burner** *of type address*
2. **value** *of type uint256*


### *event* Approval
*Params:*
1. **owner** *of type address*
2. **spender** *of type address*
3. **value** *of type uint256*


### Fallback
*Nothing*
### Functions
### *function* balanceOf
> Gets the balance of the specified address.

*Execution cost: **less than 793 gas.***

**constant | view**

*Inputs:*
1. **_owner** *of type address- The address to query the the balance of.*

An uint256 representing the amount owned by the passed address.

### *function* mintingFinished

*Execution cost: **less than 459 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bool*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23118 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* totalSupply

*Execution cost: **less than 439 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* transferFrom

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_from** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* transfer

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_to** *of type address*
2. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* symbol

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type string*


### *function* owner

*Execution cost: **less than 793 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* name

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type string*


### *function* mint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_to** *of type address*
2. **_amount** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* increaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_spender** *of type address*
2. **_addedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* finishMinting
> Function to stop minting new tokens.

*Execution cost: **less than 22080 gas.***

**nonpayable**

*Inputs:*
*Nothing*

True if the operation was successful.

### *function* destroyAndSend

*Execution cost: **less than 30980 gas.***

**nonpayable**

*Inputs:*
1. **_recipient** *of type address*

*Returns:*
*Nothing*


### *function* destroy
> Transfers the current balance to the owner and terminates the contract.

*Execution cost: **less than 30945 gas.***

**nonpayable**

*Inputs:*
*Nothing*

*Returns:*
*Nothing*


### *function* decreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_spender** *of type address*
2. **_subtractedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* burn
> Burns a specific amount of tokens.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_value** *of type uint256- The amount of token to be burned.*

*Returns:*
*Nothing*


### *function* approve

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_spender** *of type address*
2. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* allowance

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_owner** *of type address*
2. **_spender** *of type address*

*Returns:*
1. **unnamed** *of type uint256*


### *function* DECIMAL

*Execution cost: **less than 349 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


