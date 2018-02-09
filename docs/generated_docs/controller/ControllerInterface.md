# ControllerInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/ControllerInterface.sol)

*Code deposit cost: **No bound available.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> 
## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### mintReputation(int256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type int256*
2. **_beneficiary** *of type address*
3. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### unregisterScheme(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### upgradeController(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_newController** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### unregisterSelf(address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### getSchemePermissions(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bytes4*

---
### genericAction(bytes32[], address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type bytes32[]*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### mintTokens(uint256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type uint256*
2. **_beneficiary** *of type address*
3. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### isGlobalConstraintRegistered(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### removeGlobalConstraint(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### getSchemeParameters(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### globalConstraintsCount(address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*

---
### sendEther(uint256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amountInWei** *of type uint256*
2. **_to** *of type address*
3. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### isSchemeRegistered(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### registerScheme(address, bytes32, bytes4, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_scheme** *of type address*
2. **_paramsHash** *of type bytes32*
3. **_permissions** *of type bytes4*
4. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenTransferFrom(address, address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*
5. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenTransfer(address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*
4. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenIncreaseApproval(address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*
4. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### externalTokenDecreaseApproval(address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*
4. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### addGlobalConstraint(address, bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bool*


