# AbsoluteVote
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/AbsoluteVote.sol)

*Code deposit cost: **less than 835800 gas.***

*Execution cost: **less than 865 gas.***

*Total deploy cost(deposit + execution): **less than 836665 gas.***

> 
## Constructors
*Nothing*
## Events
### VoteProposal(bytes32, address, uint256, uint256, bool)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*
5. **_isOwnerVote** *of type bool*

---
### NewProposal(bytes32, uint256, address, bytes32)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_numOfChoices** *of type uint256*
3. **_proposer** *of type address*
4. **_paramsHash** *of type bytes32*

---
### ExecuteProposal(bytes32, uint256)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_decision** *of type uint256*

---
### CancelVoting(bytes32, address)
*Params:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

---
### CancelProposal(bytes32)
*Params:*

1. **_proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
### cancelVote(bytes32)
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- id of the proposal*

*Returns:*

*Nothing*

---
### setParameters(address, uint256, bool)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_reputationSystem** *of type address*
2. **_precReq** *of type uint256*
3. **_allowOwner** *of type bool*

*Returns:*

1. **unnamed** *of type bytes32*

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
### voteInfo(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

*Returns:*

1. **unnamed** *of type uint256*
2. **unnamed** *of type uint256*

---
### voteWithSpecifiedAmounts(bytes32, uint256, uint256, uint256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_vote** *of type uint256*
3. **_rep** *of type uint256*
4. **unnamed** *of type uint256*

*Returns:*

1. **unnamed** *of type bool*

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
2. **_paramsHash** *of type bytes32*
3. **_avatar** *of type address*
4. **_executable** *of type address*
5. **unnamed** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### proposals(bytes32)

*Execution cost: **less than 2210 gas.***

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

---
### parameters(bytes32)

*Execution cost: **less than 1169 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **reputationSystem** *of type address*
2. **precReq** *of type uint256*
3. **allowOwner** *of type bool*

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
> isVotable check if the proposal is votable

*Execution cost: **less than 790 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false
---
### getParametersHash(address, uint256, bool)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_reputationSystem** *of type address*
2. **_precReq** *of type uint256*
3. **_allowOwner** *of type bool*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getNumberOfChoices(bytes32)
> getNumberOfChoices returns the number of choices possible in this proposal

*Execution cost: **less than 712 gas.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint that contains number of choices
---
### execute(bytes32)
> execute check if the proposal has been decided, and if so, execute the proposal

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the id of the proposal*

bool true - the proposal has been executed             false - otherwise.
---
### cancelProposal(bytes32)
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32- the proposal ID*

*Returns:*

1. **unnamed** *of type bool*


