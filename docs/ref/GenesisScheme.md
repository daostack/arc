












# GenesisScheme

### Genesis Scheme that creates organizations



## Functions



### Constant functions

#### addressArray




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|index|uint|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|address|||


#### bytes32Array




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|index|uint|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|bytes32|||


#### bytes4Array




##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|index|uint|||


##### Returns

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|return0|bytes4|||






### State changing functions

#### forgeOrg

Create a new organization
receive in the new organizationfounders receive in the new organization

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_orgName|bytes32||The name of the new organization|
|1|_tokenName|string||The name of the token associated with the organization|
|2|_tokenSymbol|string||The symbol of the token|
|3|_founders|address||An array with the addresses of the founders of the organization|
|4|_foundersTokenAmount|uint||An array of amount of tokens that the founders|
|5|_foundersReputationAmount|int||An array of amount of reputation that the|


#### setSchemes

Set initial schemes for the organization.
spend on behalf of the organization's avatar

##### Inputs

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_avatar|Avatar||organization avatar (returns from forgeOrg)|
|1|_schemes|address||the schemes to register for the organization|
|2|_params|bytes32||the schemes's params|
|3|_token|StandardToken||the tokens these schemes are using and will be allowed to|
|4|_isUniversal|bool||is this scheme is universal scheme (true or false)|
|5|_permissions|bytes4||the schemes permissins.|






### Events

#### NewOrg




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_avatar|address|||


#### InitialSchemesSet




##### Params

|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|
|0|_avatar|address|||





### Enums




### Structs



