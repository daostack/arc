

















# VoteInOrganizationScheme

### VoteInOrganizationScheme




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



#### action

do the actual voting in the other organization in behalf of the organization's avatar.
This function is deleted called by the organization._params[0] - the address of the voting machine._params[1] - the proposalId._params[2] - the voting machins params.


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_params|bytes32||array represent the voting .|






#### execute

execution of proposals, can only be called by the voting machine in which the vote is held.
This function will trigger ProposalDeleted and ProposalExecuted events


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32||the ID of the voting in the voting machine|


|1|_avatar|address||address of the controller|


|2|_param|int||a parameter of the voting result 0 to numOfChoices .|






#### getParametersHash

Hash the parameters,and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteParams|bytes32||-  voting parameters|


|1|_intVote|IntVoteInterface|| - voting machine contract.|






#### proposeVote

propose to vote in other organization
The function trigger NewVoteProposal event


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||avatar of the organization|


|1|_originalIntVote|IntVoteInterface||the other organization voting machine|


|2|_originalProposalId|bytes32||the other organization proposal id|






#### setParameters

Hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteParams|bytes32||-  voting parameters|


|1|_intVote|IntVoteInterface|| - voting machine contract.|












### Events



#### NewVoteProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_originalIntVote|IntVoteInterface|||


|4|_originalProposalId|bytes32|||


|5|_originalNumOfChoices|uint|||






#### ProposalExecuted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||






#### ProposalDeleted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||










### Enums







### Structs



#### VoteProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|originalIntVote|IntVoteInterface|||


|1|originalProposalId|bytes32|||


|2|originalNumOfChoices|uint|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|intVote|IntVoteInterface|||


|1|voteParams|bytes32|||





