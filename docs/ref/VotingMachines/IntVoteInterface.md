# *contract* IntVoteInterface ([source](https://github.com/daostack/daostack/tree/master/./contracts/VotingMachines/IntVoteInterface.sol))
*Code deposit cost: **No bound available.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> 

## Reference
- [Constructors](#constructors)

- [Events](#events)

- [Fallback](#fallback)
- [Functions](#functions)
    - [voteWithSpecifiedAmounts](#function-votewithspecifiedamounts)
    - [vote](#function-vote)
    - [propose](#function-propose)
    - [ownerVote](#function-ownervote)
    - [isVotable](#function-isvotable)
    - [getNumberOfChoices](#function-getnumberofchoices)
    - [execute](#function-execute)
    - [cancelVote](#function-cancelvote)
    - [cancelProposal](#function-cancelproposal)
### Constructors

### Events

### Fallback
*Nothing*
### Functions
### *function* voteWithSpecifiedAmounts

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **_token** *of type uint256*

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
2. **_proposalParameters** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


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

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type bool*


### *function* getNumberOfChoices

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type uint256*


### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type bool*


### *function* cancelVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
*Nothing*


### *function* cancelProposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type bool*


