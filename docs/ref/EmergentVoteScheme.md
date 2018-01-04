
# *contract* EmergentVoteScheme is   


## Constructor

*Params:*

 1. **_nativeToken** *of type StandardToken*

 2. **_fee** *of type uint*

 3. **_beneficiary** *of type address*




## Functions


###  setOrgParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_reputationSystem** *of type Reputation*

 2. **_boostToken** *of type StandardToken*

 3. **_beneficiary** *of type address*

 4. **_attentionBandwidth** *of type uint*

 5. **_minBoostTimeFrame** *of type uint*

 6. **_maxBoostTimeFrame** *of type uint*

 7. **_minBoost** *of type uint*

 8. **_allowOwner** *of type bool*




###  getOrgParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_reputationSystem** *of type Reputation*

 2. **_boostToken** *of type StandardToken*

 3. **_beneficiary** *of type address*

 4. **_attentionBandwidth** *of type uint*

 5. **_minBoostTimeFrame** *of type uint*

 6. **_maxBoostTimeFrame** *of type uint*

 7. **_minBoost** *of type uint*

 8. **_allowOwner** *of type bool*




###  setProposalParameters

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_precReq** *of type uint*

 2. **_quorum** *of type uint*

 3. **_boostTimeFrame** *of type uint*




###  getProposalParametersHash

*Returns:*

 1. unnamed param *of type bytes32*


*Params:*

 1. **_precReq** *of type uint*

 2. **_quorum** *of type uint*

 3. **_boostTimeFrame** *of type uint*




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




### *constant*  proposalScore

*Returns:*

 1. unnamed param *of type uint*


*Params:*

 1. **_proposalId** *of type bytes32*




### *constant*  findMinScore

*Returns:*

 1. **index** *of type uint*

 2. **min** *of type uint*


*Params:*

 1. **_idsArray** *of type bytes32*




### *constant*  findMaxScore

*Returns:*

 1. **index** *of type uint*

 2. **max** *of type uint*


*Params:*

 1. **_idsArray** *of type bytes32*




###  findInArray

*Returns:*

 1. **isFound** *of type bool*

 2. **index** *of type uint*


*Params:*

 1. **_idsArray** *of type bytes32*

 2. **_id** *of type bytes32*




###  boostProposal

*Returns:*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_boostValue** *of type uint*




###  moveTopAwaitingBoostMode

*Returns:*


*Params:*

 1. **_avatar** *of type address*




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

 4. unnamed param *of type uint*




###  ownerVote

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_vote** *of type uint*

 3. **_voter** *of type address*




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


*Params:*

 1. **_proposalId** *of type bytes32*

 2. **_voter** *of type address*




### *constant*  proposalStatus

*Returns:*

 1. unnamed param *of type uint*


*Params:*

 1. **_proposalId** *of type bytes32*




### *constant*  isVotable

*Returns:*

 1. unnamed param *of type bool*


*Params:*

 1. **_proposalId** *of type bytes32*



