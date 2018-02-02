# Controller
[see the source](https://github.com/daostack/daostack/tree/master/contracts/controller/Controller.sol)

*Code deposit cost: **less than 2358800 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> Controller contract

The *Controller* is the central part of a DAO, it glues together all other components in a single smart contract.

![Controller Illustration](/img/controller.png)

## Reference
### Constructors
#### *constructor* Controller(address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

1. **_avatar** *of type address*


### Events
#### *event* ExternalTokenTransfer
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*


#### *event* UpgradeController
*Params:*

1. **_oldController** *of type address*
2. **_newController** *of type address*


#### *event* ExternalTokenTransferFrom
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_from** *of type address*
4. **_to** *of type address*
5. **_value** *of type uint256*


#### *event* RegisterScheme
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*


#### *event* RemoveGlobalConstraint
*Params:*

1. **_globalConstraint** *of type address*
2. **_index** *of type uint256*


#### *event* SendEther
*Params:*

1. **_sender** *of type address*
2. **_amountInWei** *of type uint256*
3. **_to** *of type address*


#### *event* UnregisterScheme
*Params:*

1. **_sender** *of type address*
2. **_scheme** *of type address*


#### *event* MintTokens
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type uint256*


#### *event* MintReputation
*Params:*

1. **_sender** *of type address*
2. **_beneficiary** *of type address*
3. **_amount** *of type int256*


#### *event* GenericAction
*Params:*

1. **_sender** *of type address*
2. **_params** *of type bytes32[]*


#### *event* ExternalTokenIncreaseApproval
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*


#### *event* ExternalTokenDecreaseApproval
*Params:*

1. **_sender** *of type address*
2. **_externalToken** *of type address*
3. **_spender** *of type address*
4. **_value** *of type uint256*


#### *event* AddGlobalConstraint
*Params:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*


### Fallback
*Execution cost: **less than 720 gas.***

**nonpayable**



### Functions
#### *function* mintReputation

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type int256*
2. **_beneficiary** *of type address*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* unregisterScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* unregisterSelf
> unregister the caller's scheme

*Execution cost: **less than 28009 gas.***

**nonpayable**

*Inputs:*

1. **unnamed** *of type address*

bool which represents a success

#### *function* upgradeController

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_newController** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* nativeReputation

*Execution cost: **less than 922 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* removeGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* schemes

*Execution cost: **less than 1411 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **paramsHash** *of type bytes32*
2. **permissions** *of type bytes4*


#### *function* sendEther

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amountInWei** *of type uint256*
2. **_to** *of type address*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* isSchemeRegistered

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* mintTokens

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_amount** *of type uint256*
2. **_beneficiary** *of type address*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* registerScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_scheme** *of type address*
2. **_paramsHash** *of type bytes32*
3. **_permissions** *of type bytes4*
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* nativeToken

*Execution cost: **less than 1054 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* newController

*Execution cost: **less than 636 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* externalTokenDecreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* getSchemeParameters

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* isGlobalConstraintRegistered

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* getSchemePermissions

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_scheme** *of type address*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bytes4*


#### *function* globalConstraintsRegister

*Execution cost: **less than 1060 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **register** *of type bool*
2. **index** *of type uint256*


#### *function* globalConstraints

*Execution cost: **less than 1390 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type uint256*

*Returns:*

1. **gcAddress** *of type address*
2. **params** *of type bytes32*


#### *function* globalConstraintsCount

*Execution cost: **less than 827 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* genericAction

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type bytes32[]*
2. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* externalTokenTransferFrom

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


#### *function* externalTokenTransfer

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* externalTokenIncreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*
4. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


#### *function* avatar

*Execution cost: **less than 702 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* addGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_globalConstraint** *of type address*
2. **_params** *of type bytes32*
3. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bool*


