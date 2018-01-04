

















# Reputation

### The reputation is represented by the owner of the contract

which is usually the controller's address


## Functions




### Constant functions



#### decimals





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|uint||decimals|






#### reputationOf

return the reputation amount of a given owner



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_owner|address||an address of the owner which we want to get his reputation|





##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|balance|uint256|||






#### totalSupply





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|uint256||totalSupply|











### State changing functions



#### mint

adding/reducing reputation of a given address, updating the total supply,
and triggering an event of the operation


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_to|address||the address which we gives/takes reputation amount|


|1|_amount|int256||the reputation amount to be added/reduced|






#### setReputation

setting reputation amount for a given address, updating the total supply as well



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_to|address||the address which we set it's reputation amount|


|1|_amount|uint256||the new reputation amount to be setted|












### Events



#### Mint





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|to|address|||


|1|amount|int256|||










### Enums







### Structs


