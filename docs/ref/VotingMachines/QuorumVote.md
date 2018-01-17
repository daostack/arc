# *contract* QuorumVote ([source](https://github.com/daostack/daostack/tree/master/./contracts/VotingMachines/QuorumVote.sol))
*Code deposit cost: **less than 924000 gas.***

*Execution cost: **less than 957 gas.***

*Total deploy cost(deposit + execution): **less than 924957 gas.***

> 

## Reference
- [Constructors](#constructors)

- [Events](#events)
    - [LogVoteProposal](#event-logvoteproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogExecuteProposal](#event-logexecuteproposal)
    - [LogCancelVoting](#event-logcancelvoting)
    - [LogCancelProposal](#event-logcancelproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [votesStatus](#function-votesstatus)
    - [setParameters](#function-setparameters)
    - [voteInfo](#function-voteinfo)
    - [voteWithSpecifiedAmounts](#function-votewithspecifiedamounts)
    - [vote](#function-vote)
    - [propose](#function-propose)
    - [proposals](#function-proposals)
    - [parameters](#function-parameters)
    - [ownerVote](#function-ownervote)
    - [isVotable](#function-isvotable)
    - [getParametersHash](#function-getparametershash)
    - [getNumberOfChoices](#function-getnumberofchoices)
    - [execute](#function-execute)
    - [cancelVote](#function-cancelvote)
    - [cancelProposal](#function-cancelproposal)
### Constructors

### Events
### *event* LogVoteProposal
*Params:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*
5. **_isOwnerVote** *of type bool*


### *event* LogNewProposal
*Params:*
1. **_proposalId** *of type bytes32*
2. **_numOfChoices** *of type uint256*
3. **_proposer** *of type address*
4. **_paramsHash** *of type bytes32*


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
### *function* votesStatus
> votesStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

votes array of votes for each choice

### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_reputationSystem** *of type address*
2. **_precReq** *of type uint256*
3. **_allowOwner** *of type bool*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* voteInfo

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*
1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*


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


### *function* vote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


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


### *function* proposals

*Execution cost: **less than 2188 gas.***

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
7. **open** *of type bool*


### *function* parameters

*Execution cost: **less than 1169 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **reputationSystem** *of type address*
2. **precReq** *of type uint256*
3. **allowOwner** *of type bool*


### *function* ownerVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_voter** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* isVotable
> isVotable check if the proposal is votable

*Execution cost: **less than 790 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false

### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_reputationSystem** *of type address*
2. **_precReq** *of type uint256*
3. **_allowOwner** *of type bool*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getNumberOfChoices
> getNumberOfChoices returns the number of choices possible in this proposal

*Execution cost: **less than 734 gas.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32- the ID of the proposal*

uint that contains number of choices

### *function* execute
> check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32- the id of the proposal*

*Returns:*
1. **unnamed** *of type bool*


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

*Returns:*
1. **unnamed** *of type bool*


