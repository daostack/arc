

















# SchemeRegistrar

### The SchemeRegistrar is used for registering and unregistering schemes at organizations




## Functions




### Constant functions



#### organizationsProposals





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||organizationsProposals|






#### parameters





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||parameters|











### State changing functions



#### execute





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||


|1|_avatar|address|||


|2|_param|int|||






#### getParametersHash





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteRegisterParams|bytes32|||


|1|_voteRemoveParams|bytes32|||


|2|_intVote|IntVoteInterface|||






#### proposeScheme





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar|||


|1|_scheme|address|||


|2|_parametersHash|bytes32|||


|3|_isRegistering|bool|||


|4|_tokenFee|StandardToken|||


|5|_fee|uint|||


|6|_autoRegisterOrganization|bool|||






#### proposeToRemoveScheme

propose to remove a scheme for a controller
NB: not only registers the proposal, but also votes for it


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||the address of the controller from which we want to remove a scheme|


|1|_scheme|address||the address of the scheme we want to remove|






#### setParameters

hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteRegisterParams|bytes32|||


|1|_voteRemoveParams|bytes32|||


|2|_intVote|IntVoteInterface|||












### Events



#### LogNewSchemeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_scheme|address|||


|4|_parametersHash|bytes32|||


|5|_isRegistering|bool|||


|6|_tokenFee|StandardToken|||


|7|_fee|uint|||


|8|_autoRegisterOrganization|bool|||






#### LogRemoveSchemeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_scheme|address|||






#### LogProposalExecuted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||






#### LogProposalDeleted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||










### Enums







### Structs



#### SchemeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|scheme|address|||


|1|parametersHash|bytes32|||


|2|proposalType|uint|||


|3|isRegistering|bool|||


|4|tokenFee|StandardToken|||


|5|fee|uint|||


|6|autoRegisterOrganization|bool|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|voteRegisterParams|bytes32|||


|1|voteRemoveParams|bytes32|||


|2|intVote|IntVoteInterface|||





