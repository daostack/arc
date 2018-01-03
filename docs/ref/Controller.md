












# Controller

### A controller controls the organizations tokens,reputation and avatar.

It is subject to a set of schemes and constraints that determine its behavior.Each scheme has it own parameters and operation permmisions.

## Functions



### Constant functions

#### avatar




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|Avatar||avatar|


#### getSchemeParameters




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_scheme|address|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|param0|bytes32|||


#### getSchemePermissions




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_scheme|address|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|param0|bytes4|||


#### globalConstraints




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|index|uint|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|gcAddress|address|||
|1|params|bytes32|||


#### globalConstraintsCount




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|param0|uint|||


#### globalConstraintsRegister




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|[object Object]||globalConstraintsRegister|


#### isGlobalConstraintRegister




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_globalConstraint|address|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|param0|bool|||


#### isSchemeRegistered




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_scheme|address|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|param0|bool|||


#### nativeReputation




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|Reputation||nativeReputation|


#### nativeToken




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|DAOToken||nativeToken|


#### newController




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|address||newController|


#### schemes




##### Inputs

empty list


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|[object Object]||schemes|






### State changing functions

#### addGlobalConstraint

add or update Global Constraint


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_globalConstraint|address||the address of the global constraint to be added.|
|1|_params|bytes32||the constraint parameters hash.|


#### externalTokenDecreaseApproval

decrease approval for the spender address to spend a specified amount of tokens
on behalf of msg.sender.

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_externalToken|StandardToken||the address of the Token Contract|
|1|_spender|address||address|
|2|_subtractedValue|uint||the amount of ether (in Wei) which the approval is refering to.|


#### externalTokenIncreaseApproval

increase approval for the spender address to spend a specified amount of tokens
on behalf of msg.sender.

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_externalToken|StandardToken||the address of the Token Contract|
|1|_spender|address||address|
|2|_addedValue|uint||the amount of ether (in Wei) which the approval is refering to.|


#### externalTokenTransfer

send some amount of arbitrary ERC20 Tokens


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_externalToken|StandardToken||the address of the Token Contract|
|1|_to|address||address of the beneficary|
|2|_value|uint||the amount of ether (in Wei) to send|


#### externalTokenTransferFrom

transfer token "from" address "to" address
One must to approve the amount of tokens which can be spend from the"from" account.This can be done using externalTokenApprove.

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_externalToken|StandardToken||the address of the Token Contract|
|1|_from|address||address of the account to send from|
|2|_to|address||address of the beneficary|
|3|_value|uint||the amount of ether (in Wei) to send|


#### genericAction

do a generic deligate call to the contract which called us.
This function use deligatecall and might expose the organization to securityrisk. Use this function only if you really knows what you are doing.

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_params|bytes32||the params for the call.|


#### mintReputation

mint reputation .


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_amount|int256|||
|1|_beneficiary|address||beneficiary address|


#### mintTokens

mint tokens .


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_amount|uint256|||
|1|_beneficiary|address||beneficiary address|


#### 




##### Inputs

empty list


#### registerScheme

register a scheme


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_scheme|address||the address of the scheme|
|1|_paramsHash|bytes32||a hashed configuration of the usage of the scheme|
|2|_permissions|bytes4||the permissions the new scheme will have|


#### removeGlobalConstraint

remove Global Constraint


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_globalConstraint|address||the address of the global constraint to be remove.|


#### sendEther

send some ether


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_amountInWei|uint||the amount of ether (in Wei) to send|
|1|_to|address||address of the beneficary|


#### unregisterScheme

unregister a scheme


##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_scheme|address||the address of the scheme|


#### unregisterSelf

unregister the caller's scheme


##### Inputs

empty list


#### upgradeController

upgrade the Controller
The function will trigger an event 'UpgradeController'.

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_newController|address|||






### Events

#### MintReputation




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_beneficiary|address|||
|2|_amount|int256|||


#### MintTokens




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_beneficiary|address|||
|2|_amount|uint256|||


#### RegisterScheme




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_scheme|address|||


#### UnregisterScheme




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_scheme|address|||


#### GenericAction




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_params|bytes32|||


#### SendEther




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_amountInWei|uint|||
|2|_to|address|||


#### ExternalTokenTransfer




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_externalToken|address|||
|2|_to|address|||
|3|_value|uint|||


#### ExternalTokenTransferFrom




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_externalToken|address|||
|2|_from|address|||
|3|_to|address|||
|4|_value|uint|||


#### ExternalTokenIncreaseApproval




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_externalToken|StandardToken|||
|2|_spender|address|||
|3|_value|uint|||


#### ExternalTokenDecreaseApproval




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_sender|address|||
|1|_externalToken|StandardToken|||
|2|_spender|address|||
|3|_value|uint|||


#### AddGlobalConstraint




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_globalconstraint|address|||
|1|_params|bytes32|||


#### RemoveGlobalConstraint




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_globalConstraint|address|||
|1|_index|uint256|||


#### UpgradeController




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_oldController|address|||
|1|_newController|address|||





### Enums




### Structs

#### Scheme




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|paramsHash|bytes32|||
|1|permissions|bytes4|||


#### GlobalConstraint




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|gcAddress|address|||
|1|params|bytes32|||


#### GlobalConstraintRegister




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|register|bool|||
|1|index|uint|||




