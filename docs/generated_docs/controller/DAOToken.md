# DAOToken
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/DAOToken.sol)

*Code deposit cost: **less than 687800 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> DAOToken, base on zeppelin contract.

## Constructors
### DAOToken(string, string)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_name** *of type string*
2. **_symbol** *of type string*


## Events
### Transfer(address, address, uint256)
*Params:*

1. **from** *of type address*
2. **to** *of type address*
3. **value** *of type uint256*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### MintFinished()
*Params:*

*Nothing*

---
### Mint(address, uint256)
*Params:*

1. **to** *of type address*
2. **amount** *of type uint256*

---
### Burn(address, uint256)
*Params:*

1. **burner** *of type address*
2. **value** *of type uint256*

---
### Approval(address, address, uint256)
*Params:*

1. **owner** *of type address*
2. **spender** *of type address*
3. **value** *of type uint256*


## Fallback
*Nothing*
## Functions
### balanceOf(address)
> Gets the balance of the specified address.

*Execution cost: **less than 796 gas.***

**constant | view**

*Inputs:*

1. **_owner** *of type address- The address to query the the balance of.*

An uint256 representing the amount owned by the passed address.
---
### mintingFinished()

*Execution cost: **less than 459 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bool*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23118 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### totalSupply()
> total number of tokens in existence

*Execution cost: **less than 439 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*

---
### transferFrom(address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_from** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### transfer(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_to** *of type address*
2. **_value** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### symbol()

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type string*

---
### owner()

*Execution cost: **less than 793 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### name()

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type string*

---
### mint(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_to** *of type address*
2. **_amount** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### increaseApproval(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_spender** *of type address*
2. **_addedValue** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### finishMinting()
> Function to stop minting new tokens.

*Execution cost: **less than 22080 gas.***

**nonpayable**

*Inputs:*

*Nothing*

True if the operation was successful.
---
### destroyAndSend(address)

*Execution cost: **less than 30980 gas.***

**nonpayable**

*Inputs:*

1. **_recipient** *of type address*

*Returns:*

*Nothing*

---
### destroy()
> Transfers the current balance to the owner and terminates the contract.

*Execution cost: **less than 30945 gas.***

**nonpayable**

*Inputs:*

*Nothing*

*Returns:*

*Nothing*

---
### decreaseApproval(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_spender** *of type address*
2. **_subtractedValue** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### burn(uint256)
> Burns a specific amount of tokens.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_value** *of type uint256- The amount of token to be burned.*

*Returns:*

*Nothing*

---
### approve(address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_spender** *of type address*
2. **_value** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### allowance(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_owner** *of type address*
2. **_spender** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### DECIMAL()

*Execution cost: **less than 349 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type uint256*


