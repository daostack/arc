
# *contract* ContributionReward is  


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

 1. **_orgNativeTokenFee** *of type uint*

 2. **_schemeNativeTokenFee** *of type uint*

 3. **_voteApproveParams** *of type bytes32*

 4. **_intVote** *of type IntVoteInterface*




###  getParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_orgNativeTokenFee** *of type uint*

 2. **_schemeNativeTokenFee** *of type uint*

 3. **_voteApproveParams** *of type bytes32*

 4. **_intVote** *of type IntVoteInterface*




###  proposeContributionReward

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_avatar** *of type Avatar*

 2. **_contributionDesciptionHash** *of type bytes32*

 3. **_rewards** *of type uint*

 4. **_externalToken** *of type StandardToken*

 5. **_beneficiary** *of type address*




###  execute

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_avatar** *of type address*

 3. **_param** *of type int*



