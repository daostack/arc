# UController
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/UController.sol)

*Code deposit cost: **less than 3446000 gas.***

*Execution cost: **less than 3847 gas.***

*Total deploy cost(deposit + execution): **less than 3449847 gas.***

> Universal Controller contract

## Constructors
### UController()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### ExternalTokenTransfer(address, address, address, uint256)
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

---
### RemoveGlobalConstraint(address, uint256, bool, address)
*Params:*

1. **_globalConstraint** *of type address*
2. **_index** *of type uint256*
3. **_isPre** *of type bool*
4. **_avatar** *of type address*

---
### UpgradeController(address, address, address)
*Params:*

1. **_oldController** *of type address*
2. **_newController** *of type address*
3. **_avatar** *of type address*

---
### UnregisterScheme(address, address, address)
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*
3. **_avatar** *of type address*

---
### SendEther(address, uint256, address)
*Params:*

1. **_sender** *of type address*
2. **_amountInWei** *of type uint256*
3. **_to** *of type address*

---
### RegisterScheme(address, address, address)
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*
3. **_avatar** *of type address*

---
### MintTokens(address, address, uint256, address)
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*
4. **_avatar** *of type address*

---
### MintReputation(address, address, int256, address)
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*
4. **_avatar** *of type address*

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
### AddGlobalConstraint(address, bytes32, uint8, address)
*Params:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **_when** *of type uint8*
4. **_avatar** *of type address*


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
> unregister the caller's scheme

*Execution cost: **less than 28509 gas.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address- the organization avatar.*

bool which represents a success
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
### newControllers(address)

*Execution cost: **less than 824 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type address*

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
### newOrganization(address)
> newOrganization set up a new organization with default daoCreator.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address- the organization avatar*

*Returns:*

*Nothing*

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
### getSchemeParameters(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

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
### isSchemeRegistered(address, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
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
### globalConstraintsCount(address)
> globalConstraintsCount return the global constraint pre and post count

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address*

uint globalConstraintsPre count.uint globalConstraintsPost count.
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


