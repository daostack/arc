# *contract* DAOToken ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/DAOToken.sol))
DAOToken, base on zeppelin contract.

- [Events](#events)
    - [Transfer](#event-transfer)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [MintFinished](#event-mintfinished)
    - [Mint](#event-mint)
    - [Burn](#event-burn)
    - [Approval](#event-approval)
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

## Events
### *event* Transfer
*Parameters:*
1. **from** *of type address*
2. **to** *of type address*
3. **value** *of type uint256*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* MintFinished
*Parameters:*
*Nothing*

### *event* Mint
*Parameters:*
1. **to** *of type address*
2. **amount** *of type uint256*

### *event* Burn
*Parameters:*
1. **burner** *of type address*
2. **value** *of type uint256*

### *event* Approval
*Parameters:*
1. **owner** *of type address*
2. **spender** *of type address*
3. **value** *of type uint256*

## Functions
### *function* balanceOf
**constant**
**payable**
**view**

Gets the balance of the specified address.
*Inputs:*
1. **_owner** *of type address* - The address to query the the balance of.

*Returns:*
An uint256 representing the amount owned by the passed address.

### *function* mintingFinished
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bool**

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

### *function* transferFrom
**nonpayable**

Transfer tokens from one address to another
*Inputs:*
1. **_from** *of type address* - address The address which you want to send tokens from
2. **_to** *of type address* - address The address which you want to transfer to
3. **_value** *of type uint256* - uint256 the amount of tokens to be transferred

*Returns:*
*Nothing*

### *function* transfer
**nonpayable**

transfer token for a specified address
*Inputs:*
1. **_to** *of type address* - The address to transfer to.
2. **_value** *of type uint256* - The amount to be transferred.

*Returns:*
*Nothing*

### *function* symbol
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **string**

### *function* owner
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* name
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **string**

### *function* mint
**nonpayable**

Function to mint tokens
*Inputs:*
1. **_to** *of type address* - The address that will receive the minted tokens.
2. **_amount** *of type uint256* - The amount of tokens to mint.

*Returns:*
A boolean that indicates if the operation was successful.

### *function* increaseApproval
**nonpayable**

Increase the amount of tokens that an owner allowed to a spender.   * approve should be called when allowed[_spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol
*Inputs:*
1. **_spender** *of type address* - The address which will spend the funds.
2. **_addedValue** *of type uint256* - The amount of tokens to increase the allowance by.

*Returns:*
*Nothing*

### *function* finishMinting
**nonpayable**

Function to stop minting new tokens.
*Inputs:*
*Nothing*

*Returns:*
True if the operation was successful.

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

### *function* decreaseApproval
**nonpayable**

Decrease the amount of tokens that an owner allowed to a spender.   * approve should be called when allowed[_spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol
*Inputs:*
1. **_spender** *of type address* - The address which will spend the funds.
2. **_subtractedValue** *of type uint256* - The amount of tokens to decrease the allowance by.

*Returns:*
*Nothing*

### *function* burn
**nonpayable**

Burns a specific amount of tokens.
*Inputs:*
1. **_value** *of type uint256* - The amount of token to be burned.

*Returns:*
*Nothing*

### *function* approve
**nonpayable**

Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.   * Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
*Inputs:*
1. **_spender** *of type address* - The address which will spend the funds.
2. **_value** *of type uint256* - The amount of tokens to be spent.

*Returns:*
*Nothing*

### *function* allowance
**constant**
**payable**
**view**

Function to check the amount of tokens that an owner allowed to a spender.
*Inputs:*
1. **_owner** *of type address* - address The address which owns the funds.
2. **_spender** *of type address* - address The address which will spend the funds.

*Returns:*
A uint256 specifying the amount of tokens still available for the spender.

### *function* DECIMAL
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

