
# *contract* AbsoluteVote is  



## Functions


###  setParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_reputationSystem** *of type Reputation*

 2. **_precReq** *of type uint*

 3. **_allowOwner** *of type bool*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_reputationSystem** *of type Reputation*

 2. **_precReq** *of type uint*

 3. **_allowOwner** *of type bool*




###  propose

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_numOfChoices** *of type uint*

 2. **_paramsHash** *of type bytes32*

 3. **_avatar** *of type address*

 4. **_executable** *of type ExecutableInterface*




###  cancelProposal

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*




###  vote

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*




###  ownerVote

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*

 3. **_voter** *of type address*




###  voteWithSpecifiedAmounts

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*

 3. **_rep** *of type uint*

 4. unnamed param *of type uint*




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




### *constant*  voteInfo

*Returns:*

 1. unnamed param *of type uint*

 2. unnamed param *of type uint*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_voter** *of type address*




### *constant*  votesStatus

*Returns:*

 1. **votes** *of type uint*


*Params:*

 1. **_proposalId** *of type bytes32*




### *constant*  isVotable

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*



