

















# ContributionReward

### An agent can ask an organization to recognize a contribution and reward

him with token, reputation, ether or any combination.


## Functions




### Constant functions



#### organizationsProposals





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||organizationsProposals|






#### parameters





##### Inputs



empty list




##### Returns



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|return0|[object Object]||parameters|











### State changing functions



#### execute

execution of proposals, can only be called by the voting machine in which the vote is held.



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_proposalId|bytes32||the ID of the voting in the voting machine|


|1|_avatar|address||address of the controller|


|2|_param|int||a parameter of the voting result, 0 is no and 1 is yes.|






#### getParametersHash





##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_orgNativeTokenFee|uint|||


|1|_schemeNativeTokenFee|uint|||


|2|_voteApproveParams|bytes32|||


|3|_intVote|IntVoteInterface|||






#### proposeContributionReward

Submit a proposal for a reward for a contribution:
rewards[0] - Amount of tokens requestedrewards[1] - Amount of reputation requestedrewards[2] - Amount of ETH requestedrewards[3] - Amount of extenral tokens requested


##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|Avatar||Avatar of the organization that the contribution was made for|


|1|_contributionDesciptionHash|bytes32||A hash of the contribution's description|


|2|_rewards|uint||rewards array:|


|3|_externalToken|StandardToken||Address of external token, if reward is requested there|


|4|_beneficiary|address||Who gets the rewards|






#### setParameters

hash the parameters, save them if necessary, and return the hash value



##### Inputs



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_orgNativeTokenFee|uint|||


|1|_schemeNativeTokenFee|uint|||


|2|_voteApproveParams|bytes32|||


|3|_intVote|IntVoteInterface|||












### Events



#### LogNewContributionProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||


|2|_intVoteInterface|address|||


|3|_contributionDesciption|bytes32|||


|4|_nativeTokenReward|uint|||


|5|_reputationReward|uint|||


|6|_ethReward|uint|||


|7|_externalTokenReward|uint|||


|8|_externalToken|StandardToken|||


|9|_beneficiary|address|||






#### LogProposalExecuted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||






#### LogProposalDeleted





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|_avatar|address|||


|1|_proposalId|bytes32|||










### Enums







### Structs



#### ContributionProposal





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|contributionDescriptionHash|bytes32|||


|1|nativeTokenReward|uint|||


|2|reputationReward|uint|||


|3|ethReward|uint|||


|4|externalToken|StandardToken|||


|5|externalTokenReward|uint|||


|6|beneficiary|address|||






#### Parameters





##### Params



|#  |Param|Type|TypeHint|Description|
|---|-----|----|--------|-----------|


|0|orgNativeTokenFee|uint|||


|1|voteApproveParams|bytes32|||


|2|schemeNativeTokenFee|uint|||


|3|intVote|IntVoteInterface|||





