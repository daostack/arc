
# *contract* SchemeRegistrar is  


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

 2. **_voteRemoveParams** *of type bytes32*

 3. **_intVote** *of type IntVoteInterface*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_voteRegisterParams** *of type bytes32*

 2. **_voteRemoveParams** *of type bytes32*

 3. **_intVote** *of type IntVoteInterface*




###  proposeScheme

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_scheme** *of type address*

 3. **_parametersHash** *of type bytes32*

 4. **_isRegistering** *of type bool*

 5. **_tokenFee** *of type StandardToken*

 6. **_fee** *of type uint*

 7. **_autoRegisterOrganization** *of type bool*




###  proposeToRemoveScheme

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_scheme** *of type address*



