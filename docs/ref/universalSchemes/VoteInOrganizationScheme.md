# *contract* VoteInOrganizationScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/VoteInOrganizationScheme.sol))
*Code deposit gas: **734000***
*Execution gas: **Infinite***
VoteInOrganizationScheme.

- [Constructors](#constructors)
    - [VoteInOrganizationScheme(address _nativeToken, uint256 _fee, address _beneficiary)](#constructor-voteinorganizationschemeaddress-_nativetoken-uint256-_fee-address-_beneficiary)
- [Events](#events)
    - [ProposalExecuted](#event-proposalexecuted)
    - [ProposalDeleted](#event-proposaldeleted)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [NewVoteProposal](#event-newvoteproposal)
    - [LogNewProposal](#event-lognewproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [proposeVote](#function-proposevote)
    - [updateParameters](#function-updateparameters)
    - [execute](#function-execute)
    - [hashedParameters](#function-hashedparameters)
    - [organizationsData](#function-organizationsdata)
    - [nativeToken](#function-nativetoken)
    - [owner](#function-owner)
    - [organizations](#function-organizations)
    - [isRegistered](#function-isregistered)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [beneficiary](#function-beneficiary)
    - [action](#function-action)
## Constructors
### *constructor* VoteInOrganizationScheme(address _nativeToken, uint256 _fee, address _beneficiary)
*Parameters:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*

## Events
### *event* ProposalExecuted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* ProposalDeleted
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* NewVoteProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_originalIntVote** *of type address*
5. **_originalProposalId** *of type bytes32*
6. **_originalNumOfChoices** *of type uint256*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

## Fallback
*Execution gas: **Infinite***

*Nothing*
## Functions
### *function* setParameters
*Execution gas: **41143***
**nonpayable**

Hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* parameters
*Execution gas: **906***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **bytes32**

### *function* transferOwnership
*Execution gas: **23137***
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* registerOrganization
*Execution gas: **Infinite***
**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*

### *function* proposeVote
*Execution gas: **Infinite***
**nonpayable**

propose to vote in other organization     The function trigger NewVoteProposal event
*Inputs:*
1. **_avatar** *of type address* - avatar of the organization
2. **_originalIntVote** *of type address* - the other organization voting machine
3. **_originalProposalId** *of type bytes32* - the other organization proposal id

*Returns:*
an id which represents the proposal

### *function* updateParameters
*Execution gas: **81277***
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* execute
*Execution gas: **Infinite***
**nonpayable**

execution of proposals, can only be called by the voting machine in which the vote is held.     This function will trigger ProposalDeleted and ProposalExecuted events
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result 0 to numOfChoices .

*Returns:*
bool which indicate success.

### *function* hashedParameters
*Execution gas: **788***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* organizationsData
*Execution gas: **1329***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **bytes32**
3. **uint256**

### *function* nativeToken
*Execution gas: **897***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* owner
*Execution gas: **809***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* organizations
*Execution gas: **749***
**constant**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* isRegistered
*Execution gas: **934***
**constant**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* getParametersHash
*Execution gas: **564***
**constant**
**pure**

Hash the parameters,and return the hash value
*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* fee
*Execution gas: **722***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* beneficiary
*Execution gas: **677***
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* action
*Execution gas: **Infinite***
**nonpayable**

do the actual voting in the other organization in behalf of the organization's avatar.     This function is deleted called by the organization.
*Inputs:*
1. **_params** *of type bytes32[]* - array represent the voting .       _params[0] - the address of the voting machine.       _params[1] - the proposalId.       _params[2] - the voting machins params.

*Returns:*
bool which indicate success.

