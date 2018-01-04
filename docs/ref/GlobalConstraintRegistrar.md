

















# GlobalConstraintRegistrar

### The scheme is used to register or remove new global constraints




## Functions




### Constant functions



#### organizationsData





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||organizationsData|






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

Hash the parameters,and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteRegisterParams|bytes32||-  voting parameters|


|1|_intVote|IntVoteInterface|| - voting machine contract.|






#### proposeGlobalConstraint





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar|||


|1|_gc|address|||


|2|_params|bytes32|||


|3|_voteToRemoveParams|bytes32|||






#### proposeToRemoveGC

propose to remove a global constraint:



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||the avatar of the organization that the constraint is proposed for|


|1|_gc|address||the address of the global constraint that is being proposed|






#### setParameters

Hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteRegisterParams|bytes32||-  voting parameters for register global constraint|


|1|_intVote|IntVoteInterface|| - voting machine contract.|












### Events



#### NewGlobalConstraintsProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_gc|address|||


|4|_params|bytes32|||


|5|_voteToRemoveParams|bytes32|||






#### RemoveGlobalConstraintsProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_gc|address|||






#### ProposalExecuted





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



#### GCProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|gc|address|||


|1|params|bytes32|||


|2|proposalType|uint|||


|3|voteToRemoveParams|bytes32|||






#### Organization





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|voteRegisterParams|bytes32|||


|1|intVote|IntVoteInterface|||


|2|proposals|[object Object]|||


|3|voteToRemoveParams|[object Object]|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|voteRegisterParams|bytes32|||


|1|intVote|IntVoteInterface|||





