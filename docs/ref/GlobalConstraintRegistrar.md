
# *contract* GlobalConstraintRegistrar is  


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

 1. **_voteRegisterParams** *of type bytes32*

 2. **_intVote** *of type IntVoteInterface*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_voteRegisterParams** *of type bytes32*

 2. **_intVote** *of type IntVoteInterface*




###  proposeGlobalConstraint

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_gc** *of type address*

 3. **_params** *of type bytes32*

 4. **_voteToRemoveParams** *of type bytes32*




###  proposeToRemoveGC

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_gc** *of type address*



