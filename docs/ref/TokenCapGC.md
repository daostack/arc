

















# TokenCapGC

### A simple global contraint to cap the number of tokens.




## Functions




### Constant functions



#### params





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||params|











### State changing functions



#### getParametersHash

calculate and returns the hash of the given parameters



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_token|StandardToken|||


|1|_cap|uint||the cap to check the total supply against.|






#### post

check the total supply cap.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0||bytes|||


|1|_paramsHash|bytes32|||


|2||bytes|||






#### pre

check the constraint after the action.
This global contraint only checks the state after the action, so here we just return true:


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0||bytes|||


|1||bytes|||


|2||bytes|||






#### setParameters

adding a new set of parametrs



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_token|StandardToken|||


|1|_cap|uint||the cap to check the total supply against.|












### Events







### Enums







### Structs



#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|token|StandardToken|||


|1|cap|uint|||





