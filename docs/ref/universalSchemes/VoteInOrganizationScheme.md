# *contract* VoteInOrganizationScheme
VoteInOrganizationScheme.
## Events
### *event* NewVoteProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_originalIntVote** *of type address*
5. **_originalProposalId** *of type bytes32*
6. **_originalNumOfChoices** *of type uint256*

### *event* ProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* ProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

## Functions
### *function* parameters

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type bytes32* - 

*Returns:*
1. **address**
2. **bytes32**

### *function* organizationsData

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 
2. **unnamed** *of type bytes32* - 

*Returns:*
1. **address**
2. **bytes32**
3. **uint256**

### *function* getParametersHash

**constant**
**payable**
**pure**


Hash the parameters,and return the hash value

*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* execute

**nonpayable**


execution of proposals, can only be called by the voting machine in which the vote is held.     This function will trigger ProposalDeleted and ProposalExecuted events

*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result 0 to numOfChoices .

*Returns:*
bool which indicate success.

### *function* beneficiary

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* updateParameters

**nonpayable**




*Inputs:*
1. **_nativeToken** *of type address* - 
2. **_fee** *of type uint256* - 
3. **_beneficiary** *of type address* - 
4. **_hashedParameters** *of type bytes32* - 

*Returns:*
*Nothing*

### *function* proposeVote

**nonpayable**


propose to vote in other organization     The function trigger NewVoteProposal event

*Inputs:*
1. **_avatar** *of type address* - avatar of the organization
2. **_originalIntVote** *of type address* - the other organization voting machine
3. **_originalProposalId** *of type bytes32* - the other organization proposal id

*Returns:*
an id which represents the proposal

### *function* organizations

**constant**
**payable**
**view**




*Inputs:*
1. **unnamed** *of type address* - 

*Returns:*
1. **bool**

### *function* setParameters

**nonpayable**


Hash the parameters, save them if necessary, and return the hash value

*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* action

**nonpayable**


do the actual voting in the other organization in behalf of the organization's avatar.     This function is deleted called by the organization.

*Inputs:*
1. **_params** *of type bytes32[]* - array represent the voting .       _params[0] - the address of the voting machine.       _params[1] - the proposalId.       _params[2] - the voting machins params.

*Returns:*
bool which indicate success.

### *function* owner

**constant**
**payable**
**view**




*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* registerOrganization

**nonpayable**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
*Nothing*

### *function* isRegistered

**constant**
**payable**
**view**




*Inputs:*
1. **_avatar** *of type address* - 

*Returns:*
1. **bool**

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

### *function* transferOwnership

**nonpayable**


Allows the current owner to transfer control of the contract to a newOwner.

*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

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

