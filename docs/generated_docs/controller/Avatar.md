# Avatar
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Avatar.sol)

*Code deposit cost: **less than 475800 gas.***

*Execution cost: **less than 81478 gas.***

*Total deploy cost(deposit + execution): **less than 557278 gas.***

> An Avatar holds tokens, reputation and ether for a controller

## Constructors
### Avatar(bytes32, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_orgName** *of type bytes32*
2. **_nativeToken** *of type address*
3. **_nativeReputation** *of type address*


## Events
### SendEther(uint256, address)
*Params:*

1. **_amountInWei** *of type uint256*
2. **_to** *of type address*

---
### ReceiveEther(address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_value** *of type uint256*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### GenericAction(address, bytes32[])
*Params:*

1. **_action** *of type address*
2. **_params** *of type bytes32[]*

---
### ExternalTokenTransferFrom(address, address, address, uint256)
*Params:*

1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

---
### ExternalTokenTransfer(address, address, uint256)
*Params:*

1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

---
### ExternalTokenIncreaseApproval(address, address, uint256)
*Params:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*

---
### ExternalTokenDecreaseApproval(address, address, uint256)
*Params:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*


## Fallback
*Execution cost: **less than 1870 gas.***

**payable**



## Functions
### externalTokenTransferFrom(address, address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23027 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### sendEther(uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amountInWei** *of type uint256*
2. **_to** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### owner()

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### orgName()

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### nativeToken()

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### nativeReputation()

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### genericAction(address, bytes32[])

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_action** *of type address*
2. **_params** *of type bytes32[]*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenTransfer(address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenIncreaseApproval(address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenDecreaseApproval(address, address, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*


