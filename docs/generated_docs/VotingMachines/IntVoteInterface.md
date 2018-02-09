# IntVoteInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/IntVoteInterface.sol)

*Code deposit cost: **No bound available.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> 
## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### voteWithSpecifiedAmounts(bytes32, uint256, uint256, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **_token** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### voteStatus(bytes32, uint256)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_choice** *of type uint256*

*Returns:*

1. **unnamed** *of type uint256*

---
### vote(bytes32, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

---
### propose(uint256, bytes32, address, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_numOfChoices** *of type uint256*
2. **_proposalParameters** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*
5. **_proposer** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### ownerVote(bytes32, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_voter** *of type address*

*Returns:*

1. **unnamed** *of type bool*

---
### isVotable(bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type bool*

---
### getNumberOfChoices(bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type uint256*

---
### execute(bytes32)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type bool*

---
### cancelVote(bytes32)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

*Nothing*

---
### cancelProposal(bytes32)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type bool*


