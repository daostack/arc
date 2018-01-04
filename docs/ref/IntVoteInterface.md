
# *contract* IntVoteInterface 



## Functions


###  propose

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_numOfChoices** *of type uint*

 2. **_proposalParameters** *of type bytes32*

 3. **_avatar** *of type address*

 4. **_executable** *of type ExecutableInterface*




###  cancelProposal

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*




###  ownerVote

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*

 3. **_voter** *of type address*




###  vote

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*




###  voteWithSpecifiedAmounts

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*

 3. **_rep** *of type uint*

 4. **_token** *of type uint*




###  cancelVote

*Returns:*


*Params:*

 1. **_proposalId** *of type bytes32*




###  execute

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*




### *constant*  getNumberOfChoices

*Returns:*

 1. unnamed param *of type uint*


*Params:*

 1. **_proposalId** *of type bytes32*




### *constant*  isVotable

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*



