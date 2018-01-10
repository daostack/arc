# *contract* EmergentVoteScheme
[object Object]

- [Events](#events)
    - [OwnershipTransferred](#event-OwnershipTransferred)
    - [OrganizationRegistered](#event-OrganizationRegistered)
    - [LogVoteProposal](#event-LogVoteProposal)
    - [LogNewProposal](#event-LogNewProposal)
    - [LogNewProposal](#event-LogNewProposal)
    - [LogExecuteProposal](#event-LogExecuteProposal)
    - [LogCancelVoting](#event-LogCancelVoting)
    - [LogCancelProposal](#event-LogCancelProposal)
- [Functions](#functions)
    - [owner](#function-owner)
    - [organizationsParameters](#function-organizationsParameters)
    - [voteInfo](#function-voteInfo)
    - [transferOwnership](#function-transferOwnership)
    - [setProposalParameters](#function-setProposalParameters)
    - [proposals](#function-proposals)
    - [ownerVote](#function-ownerVote)
    - [voteWithSpecifiedAmounts](#function-voteWithSpecifiedAmounts)
    - [proposalScore](#function-proposalScore)
    - [vote](#function-vote)
    - [updateParameters](#function-updateParameters)
    - [setOrgParameters](#function-setOrgParameters)
    - [proposalsParameters](#function-proposalsParameters)
    - [registerOrganization](#function-registerOrganization)
    - [proposalStatus](#function-proposalStatus)
    - [propose](#function-propose)
    - [isRegistered](#function-isRegistered)
    - [boostProposal](#function-boostProposal)
    - [organizations](#function-organizations)
    - [cancelVote](#function-cancelVote)
    - [hashedParameters](#function-hashedParameters)
    - [getNumberOfChoices](#function-getNumberOfChoices)
    - [cancelProposal](#function-cancelProposal)
    - [getOrgParametersHash](#function-getOrgParametersHash)
    - [isVotable](#function-isVotable)
    - [findMinScore](#function-findMinScore)
    - [getProposalParametersHash](#function-getProposalParametersHash)
    - [findMaxScore](#function-findMaxScore)
    - [fee](#function-fee)
    - [nativeToken](#function-nativeToken)
    - [execute](#function-execute)
    - [findInArray](#function-findInArray)
    - [moveTopAwaitingBoostMode](#function-moveTopAwaitingBoostMode)
    - [beneficiary](#function-beneficiary)
    - [MAX_NUM_OF_CHOICES](#function-MAX_NUM_OF_CHOICES)

## Events
### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogVoteProposal
*Parameters:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*
3. **_vote** *of type uint256*
4. **_reputation** *of type uint256*
5. **_isOwnerVote** *of type bool*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* LogNewProposal
*Parameters:*
1. **_proposalId** *of type bytes32*
2. **_proposer** *of type address*
3. **_paramsHash** *of type bytes32*

### *event* LogExecuteProposal
*Parameters:*
1. **_proposalId** *of type bytes32*
2. **_decision** *of type uint256*

### *event* LogCancelVoting
*Parameters:*
1. **_proposalId** *of type bytes32*
2. **_voter** *of type address*

### *event* LogCancelProposal
*Parameters:*
1. **_proposalId** *of type bytes32*

## Functions
### *function* owner

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizationsParameters

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type bytes32* - 

*Returns:*
1. **address**
2. **address**
3. **address**
4. **uint256**
5. **uint256**
6. **uint256**
7. **uint256**
8. **bool**

### *function* voteInfo

**constant**
**payable**
**view**


voteInfo returns the vote and the amount of reputation of the user committed to this proposal

*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the proposal
2. **_voter** *of type address* - the address of the voter

*Returns:*
uint[2] array that contains the vote's info: amount of reputation committed by _voter to _proposalId, and the voters vote (1/-1/-0)

### *function* transferOwnership

**nonpayable**


Allows the current owner to transfer control of the contract to a newOwner.

*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* setProposalParameters

**nonpayable**


Set proposals parameters

*Inputs:*
1. **_precReq** *of type uint256* - the percentage that are required for the proposal to be executed
2. **_quorum** *of type uint256* - the 'quorum' percentages that are required for the winning choice (will be rellevant only if boosted)
3. **_boostTimeFrame** *of type uint256* - the time frame of the proposal after being boosted, after the time passed, a decision will be made

*Returns:*
bytes32 the hashed parameters

### *function* proposals

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type bytes32* - 

*Returns:*
1. **address**
2. **address**
3. **uint256**
4. **address**
5. **bytes32**
6. **uint256**
7. **bool**
8. **bool**
9. **bool**
10. **uint256**
11. **uint256**

### *function* ownerVote

**nonpayable**


voting function with owner functionality (can vote on behalf of someone else)

*Inputs:*
1. **_proposalId** *of type bytes32* - id of the proposal
2. **_vote** *of type uint256* - yes (1) / no (-1) / abstain (0)
3. **_voter** *of type address* - will be voted with that voter's address

*Returns:*
*Nothing*

### *function* voteWithSpecifiedAmounts

**nonpayable**




*Inputs:*
1. **_proposalId** *of type bytes32* - 
2. **_vote** *of type uint256* - 
3. **_rep** *of type uint256* - 
4. **unnamed** *of type uint256* - 

*Returns:*
1. **bool**

### *function* proposalScore

**constant**
**payable**
**view**


Get the score of a specific proposal The score is evaluated by multiplying the number of votes with the funds that are invested

*Inputs:*
1. **_proposalId** *of type bytes32* - the proposal ID

*Returns:*
uint Proposal's score

### *function* vote

**nonpayable**


voting function

*Inputs:*
1. **_proposalId** *of type bytes32* - id of the proposal
2. **_vote** *of type uint256* - yes (1) / no (-1) / abstain (0)

*Returns:*
*Nothing*

### *function* updateParameters

**nonpayable**




*Inputs:*
1. **_nativeToken** *of type address* - 
2. **_fee** *of type uint256* - 
3. **_beneficiary** *of type address* - 
4. **_hashedParameters** *of type bytes32* - 

*Returns:*
*Nothing*

### *function* setOrgParameters

**nonpayable**


hash the parameters, save them if necessary, and return the hash value

*Inputs:*
1. **_reputationSystem** *of type address* - 
2. **_boostToken** *of type address* - 
3. **_beneficiary** *of type address* - 
4. **_attentionBandwidth** *of type uint256* - 
5. **_minBoostTimeFrame** *of type uint256* - 
6. **_maxBoostTimeFrame** *of type uint256* - 
7. **_minBoost** *of type uint256* - 
8. **_allowOwner** *of type bool* - 

*Returns:*
*Nothing*

### *function* proposalsParameters

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type bytes32* - 

*Returns:*
1. **uint256**
2. **uint256**
3. **uint256**

### *function* registerOrganization

**nonpayable**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
*Nothing*

### *function* proposalStatus

**constant**
**payable**
**view**


proposalStatus returns the number of yes, no, and abstain and if the proposal is ended of a given proposal id

*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the proposal

*Returns:*
int[10] array that contains the proposal's info: number of yes, no, and abstain, and if the voting for the proposal has ended

### *function* propose

**nonpayable**


register a new proposal with the given parameters. Every proposal has a unique ID which is being generated by calculating keccak256 of a incremented counter.

*Inputs:*
1. **_numOfChoices** *of type uint256* - the number of choices inthe proposal
2. **_paramsHash** *of type bytes32* - defined the parameters of the voting machine used for this proposal
3. **_avatar** *of type address* - an address to be sent as the payload to the _executable contract.
4. **_executable** *of type address* - This contract will be executed when vote is over.

*Returns:*
bytes32 proposalId the ID of the proposal

### *function* isRegistered

**constant**
**payable**
**view**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
1. **bool**

### *function* boostProposal

**nonpayable**


Internal function to boost a proposal

*Inputs:*
1. **_proposalId** *of type bytes32* - the id of the proposal that is being checked
2. **_boostValue** *of type uint256* - amount of tokens to use for boosting, must be greater then minBoost

*Returns:*
*Nothing*

### *function* organizations

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 

*Returns:*
1. **bool**
2. **uint256**

### *function* cancelVote

**nonpayable**


Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct

*Inputs:*
1. **_proposalId** *of type bytes32* - id of the proposal

*Returns:*
*Nothing*

### *function* hashedParameters

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getNumberOfChoices

**constant**
**payable**
**view**




*Inputs:*
1. **_proposalId** *of type bytes32* - 

*Returns:*
1. **uint256**

### *function* cancelProposal

**nonpayable**


Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.

*Inputs:*
1. **_proposalId** *of type bytes32* - the proposal ID

*Returns:*
bool True if the proposal is canceled and False if it wasn't

### *function* getOrgParametersHash

**constant**
**payable**
**pure**




*Inputs:*
1. **_reputationSystem** *of type address* - 
2. **_boostToken** *of type address* - 
3. **_beneficiary** *of type address* - 
4. **_attentionBandwidth** *of type uint256* - 
5. **_minBoostTimeFrame** *of type uint256* - 
6. **_maxBoostTimeFrame** *of type uint256* - 
7. **_minBoost** *of type uint256* - 
8. **_allowOwner** *of type bool* - 

*Returns:*
1. **bytes32**

### *function* isVotable

**constant**
**payable**
**view**


isVotable check if the proposal is open

*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the proposal

*Returns:*
bool true or false

### *function* findMinScore

**constant**
**payable**
**view**


Get the minimum score of a given list proposal ids

*Inputs:*
1. **_idsArray** *of type bytes32[]* - the proposal ids that will be checked

*Returns:*
uint index the index of the proposal containing the smallest score in the listuint min the minimum score in the list

### *function* getProposalParametersHash

**constant**
**payable**
**pure**


hashParameters returns a hash of the given parameters

*Inputs:*
1. **_precReq** *of type uint256* - 
2. **_quorum** *of type uint256* - 
3. **_boostTimeFrame** *of type uint256* - 

*Returns:*
*Nothing*

### *function* findMaxScore

**constant**
**payable**
**view**


Get the maximum score of a given list proposal ids

*Inputs:*
1. **_idsArray** *of type bytes32[]* - the proposal ids that will be checked

*Returns:*
uint index the index of the proposal containing the highest score in the listuint max the maximum score in the list

### *function* fee

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* nativeToken

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* execute

**nonpayable**


check if the proposal has been decided, and if so, execute the proposal

*Inputs:*
1. **_proposalId** *of type bytes32* - the id of the proposal

*Returns:*
bool is the proposal has been executed or not?

### *function* findInArray

**constant**
**payable**
**pure**


Helper function to find an ID in a given array

*Inputs:*
1. **_idsArray** *of type bytes32[]* - an array of id's
2. **_id** *of type bytes32* - the id we want ot find in the array

*Returns:*
bool isFound that indicated if the id has been found in the arrayuint index the index of the id in the array

### *function* moveTopAwaitingBoostMode

**nonpayable**


Move the top proposal form the waiting list to the boosted proposals

*Inputs:*
1. **_avatar** *of type address* - avatar of the organization

*Returns:*
*Nothing*

### *function* beneficiary

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* MAX_NUM_OF_CHOICES

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

