

















# VestingScheme

### Can be used without organization just as a vesting component.




## Functions




### Constant functions



#### agreements





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||agreements|






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



#### collect

Function for a beneficiary to collect.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint||the relevant agreement.|






#### createVestedAgreement

Creating a vesting agreement.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_token|StandardToken||the relevant token in the agreement.|


|1|_beneficiary|address||the beneficiary of the agreement.|


|2|_returnOnCancelAddress|address||where to send the tokens in case of stoping.|


|3|_startingBlock|uint||the block from which the agreement starts.|


|4|_amountPerPeriod|uint||amount of tokens per period.|


|5|_periodLength|uint||period length in blocks.|


|6|_numOfAgreedPeriods|uint||how many periods agreed on.|


|7|_cliffInPeriods|uint||the length of the cliff in periods.|


|8|_signaturesReqToCancel|uint||number of signatures required to cancel agreement.|


|9|_signersArray|address||avatar array of adresses that can sign to cancel agreement.|






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


|0|_voteParams|bytes32||-  voting parameters|


|1|_intVote|IntVoteInterface|| - voting machine contract.|






#### proposeVestingAgreement

Proposing a vesting agreement in an organization.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_beneficiary|address||the beneficiary of the agreement.|


|1|_returnOnCancelAddress|address||where to send the tokens in case of stoping.|


|2|_startingBlock|uint||the block from which the agreement starts.|


|3|_amountPerPeriod|uint||amount of tokens per period.|


|4|_periodLength|uint||period length in blocks.|


|5|_numOfAgreedPeriods|uint||how many periods agreed on.|


|6|_cliffInPeriods|uint||the length of the cliff in periods.|


|7|_signaturesReqToCancel|uint||number of signatures required to cancel agreement.|


|8|_signersArray|address||avatar array of adresses that can sign to cancel agreement.|


|9|_avatar|Avatar||avatar of the organization.|






#### revokeSignToCancelAgreement

Function to revoke vote for canceling agreement.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint||the relevant agreement.|






#### setParameters

Hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_voteParams|bytes32||-  voting parameters|


|1|_intVote|IntVoteInterface|| - voting machine contract.|






#### signToCancelAgreement

Function to sign to cancel an agreement.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint||the relevant agreement.|












### Events



#### LogRegisterOrg





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||






#### LogAgreementProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||






#### LogExecutaion





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_result|int|||






#### NewVestedAgreement





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint|||






#### SignToCancelAgreement





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint|||


|1|_signer|address|||






#### RevokeSignToCancelAgreement





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint|||


|1|_signer|address|||






#### LogAgreementCancel





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint|||






#### LogCollect





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_agreementId|uint|||










### Enums







### Structs



#### Agreement





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|token|StandardToken|||


|1|beneficiary|address|||


|2|returnOnCancelAddress|address|||


|3|startingBlock|uint|||


|4|amountPerPeriod|uint|||


|5|periodLength|uint|||


|6|numOfAgreedPeriods|uint|||


|7|cliffInPeriods|uint|||


|8|signaturesReqToCancel|uint|||


|9|collectedPeriods|uint|||


|10|signaturesReceivedCounter|uint|||


|11|signers|[object Object]|||


|12|signaturesReceived|[object Object]|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|voteParams|bytes32|||


|1|intVote|IntVoteInterface|||





