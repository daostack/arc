# *contract* EmergentVoteScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/VotingMachines/EmergentVoteScheme.sol))
*Code deposit cost: **less than 1915600 gas.***

*Execution cost: **less than 22394 gas.***

*Total deploy cost(deposit + execution): **less than 1937994 gas.***

> 

## Reference
- [Constructors](#constructors)
    - [EmergentVoteScheme()](#constructor-emergentvotescheme)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [LogVoteProposal](#event-logvoteproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogExecuteProposal](#event-logexecuteproposal)
    - [LogCancelVoting](#event-logcancelvoting)
    - [LogCancelProposal](#event-logcancelproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [MAX_NUM_OF_CHOICES](#function-maxnumofchoices)
    - [organizationsParameters](#function-organizationsparameters)
    - [voteInfo](#function-voteinfo)
    - [transferOwnership](#function-transferownership)
    - [setProposalParameters](#function-setproposalparameters)
    - [updateParameters](#function-updateparameters)
    - [proposals](#function-proposals)
    - [ownerVote](#function-ownervote)
    - [voteWithSpecifiedAmounts](#function-votewithspecifiedamounts)
    - [proposalScore](#function-proposalscore)
    - [setOrgParameters](#function-setorgparameters)
    - [proposalsParameters](#function-proposalsparameters)
    - [vote](#function-vote)
    - [proposalStatus](#function-proposalstatus)
    - [propose](#function-propose)
    - [owner](#function-owner)
    - [getProposalParametersHash](#function-getproposalparametershash)
    - [findMinScore](#function-findminscore)
    - [organizations](#function-organizations)
    - [getNumberOfChoices](#function-getnumberofchoices)
    - [hashedParameters](#function-hashedparameters)
    - [getOrgParametersHash](#function-getorgparametershash)
    - [isVotable](#function-isvotable)
    - [moveTopAwaitingBoostMode](#function-movetopawaitingboostmode)
    - [findMaxScore](#function-findmaxscore)
    - [findInArray](#function-findinarray)
    - [execute](#function-execute)
    - [cancelVote](#function-cancelvote)
    - [cancelProposal](#function-cancelproposal)
    - [boostProposal](#function-boostproposal)
### Constructors
### *constructor* EmergentVoteScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
*Nothing*


### Events
### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


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
### *function* MAX_NUM_OF_CHOICES

*Execution cost: **less than 566 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


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

*Execution cost: **less than 23470 gas.***

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


### *function* updateParameters

*Execution cost: **less than 20616 gas.***

**nonpayable**

*Inputs:*
1. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* proposals

*Execution cost: **less than 2823 gas.***

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
> Get the score of a specific proposal The score is evaluated by multiplying the number of votes with the funds that are invested

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the proposal ID*

uint Proposal's score

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

*Execution cost: **less than 1233 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **precReq** *of type uint256*
2. **quorum** *of type uint256*
3. **boostTimeFrame** *of type uint256*


### *function* vote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* proposalStatus
> proposalStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

int[10] array that contains the proposal's info: number of yes, no, and abstain, and if the voting for the proposal has ended

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


### *function* owner

*Execution cost: **less than 941 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* getProposalParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_precReq** *of type uint256*
2. **_quorum** *of type uint256*
3. **_boostTimeFrame** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* findMinScore
> Get the minimum score of a given list proposal ids

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_idsArray** *of type bytes32[]- the proposal ids that will be checked*

uint index the index of the proposal containing the smallest score in the listuint min the minimum score in the list

### *function* organizations

*Execution cost: **less than 1104 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **isRegistered** *of type bool*
2. **boostedProposals** *of type uint256*


### *function* getNumberOfChoices

*Execution cost: **less than 932 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type uint256*


### *function* hashedParameters

*Execution cost: **less than 1052 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


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

*Execution cost: **less than 1010 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false

### *function* moveTopAwaitingBoostMode
> Move the top proposal form the waiting list to the boosted proposals

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address- avatar of the organization*

*Returns:*
*Nothing*


### *function* findMaxScore
> Get the maximum score of a given list proposal ids

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_idsArray** *of type bytes32[]- the proposal ids that will be checked*

uint index the index of the proposal containing the highest score in the listuint max the maximum score in the list

### *function* findInArray

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_idsArray** *of type bytes32[]*
2. **_id** *of type bytes32*

*Returns:*
1. **isFound** *of type bool*
2. **index** *of type uint256*


### *function* execute
> check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- the id of the proposal*

bool is the proposal has been executed or not?

### *function* cancelVote
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*
*Nothing*


### *function* cancelProposal
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- the proposal ID*

bool True if the proposal is canceled and False if it wasn't

### *function* boostProposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_boostValue** *of type uint256*

*Returns:*
*Nothing*


