# *contract* IntVoteInterface ([source](https://github.com/daostack/daostack/tree/master/./contracts/VotingMachines/IntVoteInterface.sol))
*Code deposit gas: **Infinite***
*Execution gas: **Infinite***


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
## Constructors

## Events

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* voteWithSpecifiedAmounts
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **_token** *of type uint256*

*Returns:*
1. **bool**

### *function* vote
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*
1. **bool**

### *function* propose
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_numOfChoices** *of type uint256*
2. **_proposalParameters** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*

*Returns:*
1. **bytes32**

### *function* ownerVote
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_voter** *of type address*

*Returns:*
1. **bool**

### *function* isVotable
*Execution gas: **Infinite***
**constant**
**view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **bool**

### *function* getNumberOfChoices
*Execution gas: **Infinite***
**constant**
**view**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **uint256**

### *function* execute
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **bool**

### *function* cancelVote
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
*Nothing*

### *function* cancelProposal
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*

*Returns:*
1. **bool**

