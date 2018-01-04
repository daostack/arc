

















# OrganizationRegister

### Organizations can use this scheme to open a registry.

Other organizations can then add and promote themselves on this registry.


## Functions




### Constant functions



#### organizationsRegistery





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||organizationsRegistery|






#### parameters





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||parameters|











### State changing functions



#### addOrPromoteAddress

Adding or promoting an address on the registry.
An address(record) to add or promote can be organization address or any contract address.Adding a record is done by paying at least the minimum required by the registery params.Promoting a record is done by paying(adding)amount of token to the registery beneficiary.


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||The _avatar of the organization which own the registery.|


|1|_record|address||The address to add or promote.|


|2|_amount|uint||amount to pay for adding or promoting|






#### getParametersHash

Hash the parameters,and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_token|StandardToken||-  the token to pay for register or promotion an address.|


|1|_fee|uint|| - fee needed for register an address.|


|2|_beneficiary|address|| - the beneficiary payment address|






#### setParameters

Hash the parameters,save if needed and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_token|StandardToken||-  the token to pay for register or promotion an address.|


|1|_fee|uint|| - fee needed for register an address.|


|2|_beneficiary|address|| - the beneficiary payment address|












### Events



#### OrgAdded





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_registry|address|||


|1|_org|address|||






#### Promotion





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_registry|address|||


|1|_org|address|||


|2|_amount|uint|||










### Enums







### Structs



#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|fee|uint|||


|1|token|StandardToken|||


|2|beneficiary|address|||





