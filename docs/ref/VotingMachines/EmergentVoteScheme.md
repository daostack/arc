# *contract* EmergentVoteScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/VotingMachines/EmergentVoteScheme.sol))
*Code deposit cost: **less than 2035400 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 2035400 gas.***

> 

## Reference
- [Constructors](#constructors)
    - [EmergentVoteScheme(address, uint256, address)](#constructor-emergentvoteschemeaddress-uint256-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogVoteProposal](#event-logvoteproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogExecuteProposal](#event-logexecuteproposal)
    - [LogCancelVoting](#event-logcancelvoting)
    - [LogCancelProposal](#event-logcancelproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [owner](#function-owner)
    - [organizationsParameters](#function-organizationsparameters)
    - [voteInfo](#function-voteinfo)
    - [transferOwnership](#function-transferownership)
    - [setProposalParameters](#function-setproposalparameters)
    - [proposals](#function-proposals)
    - [ownerVote](#function-ownervote)
    - [voteWithSpecifiedAmounts](#function-votewithspecifiedamounts)
    - [proposalScore](#function-proposalscore)
    - [vote](#function-vote)
    - [updateParameters](#function-updateparameters)
    - [setOrgParameters](#function-setorgparameters)
    - [proposalsParameters](#function-proposalsparameters)
    - [registerOrganization](#function-registerorganization)
    - [proposalStatus](#function-proposalstatus)
    - [propose](#function-propose)
    - [isRegistered](#function-isregistered)
    - [boostProposal](#function-boostproposal)
    - [organizations](#function-organizations)
    - [cancelVote](#function-cancelvote)
    - [hashedParameters](#function-hashedparameters)
    - [getNumberOfChoices](#function-getnumberofchoices)
    - [cancelProposal](#function-cancelproposal)
    - [getOrgParametersHash](#function-getorgparametershash)
    - [isVotable](#function-isvotable)
    - [findMinScore](#function-findminscore)
    - [getProposalParametersHash](#function-getproposalparametershash)
    - [findMaxScore](#function-findmaxscore)
    - [fee](#function-fee)
    - [nativeToken](#function-nativetoken)
    - [execute](#function-execute)
    - [findInArray](#function-findinarray)
    - [moveTopAwaitingBoostMode](#function-movetopawaitingboostmode)
    - [beneficiary](#function-beneficiary)
    - [MAX_NUM_OF_CHOICES](#function-maxnumofchoices)
### Constructors
### *constructor* EmergentVoteScheme(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* LogVoteProposal
*Params:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*
5. **_isOwnerVote** *of type bool*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### *event* LogNewProposal
*Params:*
1. **_proposalId** *of type bytes32*
2. **_proposer** *of type address*
3. **_paramsHash** *of type bytes32*


### *event* LogExecuteProposal
*Params:*
1. **_proposalId** *of type bytes32*
2. **_decision** *of type uint256*


### *event* LogCancelVoting
*Params:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*


### *event* LogCancelProposal
*Params:*
1. **_proposalId** *of type bytes32*


### Fallback
*Nothing*
### Functions
### *function* owner

*Execution cost: **less than 963 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizationsParameters

*Execution cost: **less than 2370 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **reputationSystem** *of type address*
2. **boostToken** *of type address*
3. **beneficiary** *of type address*
4. **attentionBandwidth** *of type uint256*
5. **minBoostTimeFrame** *of type uint256*
6. **maxBoostTimeFrame** *of type uint256*
7. **minBoost** *of type uint256*
8. **allowOwner** *of type bool*


### *function* voteInfo

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*
1. **unnamed** *of type uint256[2]*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23580 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* setProposalParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_precReq** *of type uint256*
2. **_quorum** *of type uint256*
3. **_boostTimeFrame** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* proposals

*Execution cost: **less than 2807 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **owner** *of type address*
2. **avatar** *of type address*
3. **numOfChoices** *of type uint256*
4. **executable** *of type address*
5. **paramsHash** *of type bytes32*
6. **totalVotes** *of type uint256*
7. **opened** *of type bool*
8. **isBoostModeActive** *of type bool*
9. **isAwaitingBoost** *of type bool*
10. **closingTime** *of type uint256*
11. **boostedFunds** *of type uint256*


### *function* ownerVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_voter** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* voteWithSpecifiedAmounts

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **unnamed** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* proposalScore
> Get the score of a specific proposal The score is evaluated by multiplying the number of votes with the funds that are invested

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the proposal ID*

uint Proposal's score

### *function* vote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* updateParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* setOrgParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_reputationSystem** *of type address*
2. **_boostToken** *of type address*
3. **_beneficiary** *of type address*
4. **_attentionBandwidth** *of type uint256*
5. **_minBoostTimeFrame** *of type uint256*
6. **_maxBoostTimeFrame** *of type uint256*
7. **_minBoost** *of type uint256*
8. **_allowOwner** *of type bool*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* proposalsParameters

*Execution cost: **less than 1255 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **precReq** *of type uint256*
2. **quorum** *of type uint256*
3. **boostTimeFrame** *of type uint256*


### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* proposalStatus
> proposalStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

int[10] array that contains the proposal's info: number of yes, no, and abstain, and if the voting for the proposal has ended

### *function* propose

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_numOfChoices** *of type uint256*
2. **_paramsHash** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* isRegistered

*Execution cost: **less than 1220 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* boostProposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_boostValue** *of type uint256*

*Returns:*
*Nothing*


### *function* organizations

*Execution cost: **less than 1126 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **isRegistered** *of type bool*
2. **boostedProposals** *of type uint256*


### *function* cancelVote
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*
*Nothing*


### *function* hashedParameters

*Execution cost: **less than 1162 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getNumberOfChoices

*Execution cost: **less than 976 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type uint256*


### *function* cancelProposal
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- the proposal ID*

bool True if the proposal is canceled and False if it wasn't

### *function* getOrgParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_reputationSystem** *of type address*
2. **_boostToken** *of type address*
3. **_beneficiary** *of type address*
4. **_attentionBandwidth** *of type uint256*
5. **_minBoostTimeFrame** *of type uint256*
6. **_maxBoostTimeFrame** *of type uint256*
7. **_minBoost** *of type uint256*
8. **_allowOwner** *of type bool*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* isVotable
> isVotable check if the proposal is open

*Execution cost: **less than 1054 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false

### *function* findMinScore
> Get the minimum score of a given list proposal ids

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_idsArray** *of type bytes32[]- the proposal ids that will be checked*

uint index the index of the proposal containing the smallest score in the listuint min the minimum score in the list

### *function* getProposalParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_precReq** *of type uint256*
2. **_quorum** *of type uint256*
3. **_boostTimeFrame** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* findMaxScore
> Get the maximum score of a given list proposal ids

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_idsArray** *of type bytes32[]- the proposal ids that will be checked*

uint index the index of the proposal containing the highest score in the listuint max the maximum score in the list

### *function* fee

*Execution cost: **less than 1052 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* nativeToken

*Execution cost: **less than 1227 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* execute
> check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- the id of the proposal*

bool is the proposal has been executed or not?

### *function* findInArray

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_idsArray** *of type bytes32[]*
2. **_id** *of type bytes32*

*Returns:*
1. **isFound** *of type bool*
2. **index** *of type uint256*


### *function* moveTopAwaitingBoostMode
> Move the top proposal form the waiting list to the boosted proposals

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address- avatar of the organization*

*Returns:*
*Nothing*


### *function* beneficiary

*Execution cost: **less than 787 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* MAX_NUM_OF_CHOICES

*Execution cost: **less than 588 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


