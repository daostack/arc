

















# IntVoteInterface

### IntVoteInterface




## Functions




### Constant functions



#### getNumberOfChoices





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||





##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|param0|uint|||






#### isVotable





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||





##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|param0|bool|||











### State changing functions



#### cancelProposal





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||






#### cancelVote





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||






#### execute





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||






#### ownerVote





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||


|1|_vote|uint|||


|2|_voter|address|||






#### propose





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_numOfChoices|uint|||


|1|_proposalParameters|bytes32|||


|2|_avatar|address|||


|3|_executable|ExecutableInterface|||






#### vote





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||


|1|_vote|uint|||






#### voteWithSpecifiedAmounts





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32|||


|1|_vote|uint|||


|2|_rep|uint|||


|3|_token|uint|||












### Events







### Enums







### Structs


