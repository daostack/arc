# *contract* VoteInOrganizationScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/VoteInOrganizationScheme.sol))
*Code deposit cost: **less than 734000 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 734000 gas.***

> VoteInOrganizationScheme.


## Reference
- [Constructors](#constructors)
    - [VoteInOrganizationScheme(address, uint256, address)](#constructor-voteinorganizationschemeaddress-uint256-address)
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
### Constructors
### *constructor* VoteInOrganizationScheme(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* ProposalExecuted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* ProposalDeleted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* NewVoteProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_originalIntVote** *of type address*
5. **_originalProposalId** *of type bytes32*
6. **_originalNumOfChoices** *of type uint256*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### Fallback
*Nothing*
### Functions
### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* parameters

*Execution cost: **less than 906 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **intVote** *of type address*
2. **voteParams** *of type bytes32*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23137 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* proposeVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_originalIntVote** *of type address*
3. **_originalProposalId** *of type bytes32*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* updateParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*
1. **unnamed** *of type bool*


### *function* hashedParameters

*Execution cost: **less than 788 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* organizationsData

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **originalIntVote** *of type address*
2. **originalProposalId** *of type bytes32*
3. **originalNumOfChoices** *of type uint256*


### *function* nativeToken

*Execution cost: **less than 897 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* owner

*Execution cost: **less than 809 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizations

*Execution cost: **less than 749 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* isRegistered

*Execution cost: **less than 934 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* fee

*Execution cost: **less than 722 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* beneficiary

*Execution cost: **less than 677 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* action
> do the actual voting in the other organization in behalf of the organization's avatar.     This function is deleted called by the organization.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_params** *of type bytes32[]- array represent the voting .       _params[0] - the address of the voting machine.       _params[1] - the proposalId.       _params[2] - the voting machins params.*

bool which indicate success.

