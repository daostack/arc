# Controller
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Controller.sol)

*Code deposit cost: **less than 2596800 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> Controller contract

## Constructors
### Controller(address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_avatar** *of type address*


## Events
### ExternalTokenTransfer(address, address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

---
### RemoveGlobalConstraint(address, uint256, bool)
*Params:*

1. **_globalConstraint** *of type address*
2. **_index** *of type uint256*
3. **_isPre** *of type bool*

---
### UpgradeController(address, address)
*Params:*

1. **_oldController** *of type address*
2. **_newController** *of type address*

---
### UnregisterScheme(address, address)
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*

---
### SendEther(address, uint256, address)
*Params:*

1. **_sender** *of type address*
2. **_amountInWei** *of type uint256*
3. **_to** *of type address*

---
### RegisterScheme(address, address)
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*

---
### MintTokens(address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*

---
### MintReputation(address, address, int256)
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*

---
### GenericAction(address, bytes32[])
*Params:*

1. **_sender** *of type address*
2. **_params** *of type bytes32[]*

---
### ExternalTokenTransferFrom(address, address, address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_from** *of type address*
4. **_to** *of type address*
5. **_value** *of type uint256*

---
### ExternalTokenIncreaseApproval(address, address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*

---
### ExternalTokenDecreaseApproval(address, address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*

---
### AddGlobalConstraint(address, bytes32, uint8)
*Params:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **_when** *of type uint8*


## Fallback
*Execution cost: **less than 764 gas.***

**nonpayable**



## Functions
### globalConstraintsRegisterPost(address)

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **register** *of type bool*
2. **index** *of type uint256*

---
### unregisterScheme(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### unregisterSelf(address)
> unregister the caller's scheme

*Execution cost: **less than 28009 gas.***

**nonpayable**

*Inputs:*

1. **unnamed** *of type address*

bool which represents a success
---
### upgradeController(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_newController** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### nativeReputation()

*Execution cost: **less than 944 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### newController()

*Execution cost: **less than 658 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### removeGlobalConstraint(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **unnamed** *of type address*

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
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### schemes(address)

*Execution cost: **less than 1433 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **paramsHash** *of type bytes32*
2. **permissions** *of type bytes4*

---
### sendEther(uint256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amountInWei** *of type uint256*
2. **_to** *of type address*
3. **unnamed** *of type address*

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
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### mintTokens(uint256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type uint256*
2. **_beneficiary** *of type address*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### nativeToken()

*Execution cost: **less than 1076 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### externalTokenDecreaseApproval(address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### mintReputation(int256, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type int256*
2. **_beneficiary** *of type address*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### genericAction(bytes32[], address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type bytes32[]*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### globalConstraintsCount(address)
> globalConstraintsCount return the global constraint pre and post count

*Execution cost: **less than 1076 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

uint globalConstraintsPre count.uint globalConstraintsPost count.
---
### isGlobalConstraintRegistered(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### isSchemeRegistered(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### globalConstraintsPost(uint256)

*Execution cost: **less than 1698 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type uint256*

*Returns:*

1. **gcAddress** *of type address*
2. **params** *of type bytes32*

---
### globalConstraintsRegisterPre(address)

*Execution cost: **less than 862 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **register** *of type bool*
2. **index** *of type uint256*

---
### globalConstraintsPre(uint256)

*Execution cost: **less than 1258 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type uint256*

*Returns:*

1. **gcAddress** *of type address*
2. **params** *of type bytes32*

---
### getSchemePermissions(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bytes4*

---
### getSchemeParameters(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### externalTokenTransferFrom(address, address, address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*
5. **unnamed** *of type address*

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
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### avatar()

*Execution cost: **less than 746 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### addGlobalConstraint(address, bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


