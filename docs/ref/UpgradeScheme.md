

















# UpgradeScheme

### The schme is used to upgrade the controller of an organization to a new controller.




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

execution of proposals, can only be called by the voting machine in which the vote is held.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32||the ID of the voting in the voting machine|


|1|_avatar|address||address of the controller|


|2|_param|int||a parameter of the voting result, 0 is no and 1 is yes.|






#### getParametersHash

return a hash of the given parameters



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteParams|bytes32|||


|1|_intVote|IntVoteInterface|||






#### proposeChangeUpgradingScheme

propose to replace this scheme by another upgrading scheme



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||avatar of the organization|


|1|_scheme|address||address of the new upgrading scheme|


|2|_params|bytes32||???|


|3|_tokenFee|StandardToken|| ???|


|4|_fee|uint||???|






#### proposeUpgrade

propose an upgrade of the organization's controller



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||avatar of the organization|


|1|_newController|address||address of the new controller that is being proposed|






#### setParameters

hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteParams|bytes32|||


|1|_intVote|IntVoteInterface|||












### Events



#### LogNewUpgradeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_newController|address|||






#### LogChangeUpgradeSchemeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|newUpgradeScheme|address|||


|4|_params|bytes32|||


|5|tokenFee|StandardToken|||


|6|fee|uint|||






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



#### UpgradeProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|upgradeContract|address|||


|1|params|bytes32|||


|2|proposalType|uint|||


|3|tokenFee|StandardToken|||


|4|fee|uint|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|voteParams|bytes32|||


|1|intVote|IntVoteInterface|||





