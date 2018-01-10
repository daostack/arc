# *contract* IntVoteInterface
[object Object]
## Events

## Functions
### *function* ownerVote

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 
2. **_vote** *of type uint256* - 
3. **_voter** *of type address* - 

*Returns:*
1. **bool**

### *function* cancelProposal

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
1. **bool**

### *function* propose

**nonpayable**




*Inputs:*
1. **_numOfChoices** *of type uint256* - 
2. **_proposalParameters** *of type bytes32* - 
3. **_avatar** *of type address* - 
4. **_executable** *of type address* - 

*Returns:*
1. **bytes32**

### *function* cancelVote

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
*Nothing*

### *function* vote

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 
2. **_vote** *of type uint256* - 

*Returns:*
1. **bool**

### *function* getNumberOfChoices

**constant**
**payable**
**view**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
1. **uint256**

### *function* voteWithSpecifiedAmounts

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 
2. **_vote** *of type uint256* - 
3. **_rep** *of type uint256* - 
4. **_token** *of type uint256* - 

*Returns:*
1. **bool**

### *function* isVotable

**constant**
**payable**
**view**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
1. **bool**

### *function* execute

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
1. **bool**

