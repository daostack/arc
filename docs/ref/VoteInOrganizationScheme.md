
# *contract* VoteInOrganizationScheme is    


## Constructor

*Params:*

 1. **_nativeToken** *of type StandardToken*

 2. **_fee** *of type uint*

 3. **_beneficiary** *of type address*




## Functions


###  setParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_voteParams** *of type bytes32*

 2. **_intVote** *of type IntVoteInterface*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_voteParams** *of type bytes32*

 2. **_intVote** *of type IntVoteInterface*




###  proposeVote

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_originalIntVote** *of type IntVoteInterface*

 3. **_originalProposalId** *of type bytes32*




###  execute

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_avatar** *of type address*

 3. **_param** *of type int*




###  action

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_params** *of type bytes32*



