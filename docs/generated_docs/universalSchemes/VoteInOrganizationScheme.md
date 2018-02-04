# VoteInOrganizationScheme
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/VoteInOrganizationScheme.sol)

*Code deposit cost: **less than 599200 gas.***

*Execution cost: **less than 21000 gas.***

*Total deploy cost(deposit + execution): **less than 620200 gas.***

> VoteInOrganizationScheme.


## Reference
### Constructors
#### *constructor* VoteInOrganizationScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* ProposalExecuted
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


#### *event* ProposalDeleted
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


#### *event* OwnershipTransferred
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* NewVoteProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_originalIntVote** *of type address*
5. **_originalProposalId** *of type bytes32*
6. **_originalNumOfChoices** *of type uint256*


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


### Fallback
*Nothing*
### Functions
#### *function* proposeVote

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_originalIntVote** *of type address*
3. **_originalProposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* parameters

*Execution cost: **less than 906 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **intVote** *of type address*
2. **voteParams** *of type bytes32*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23005 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* updateParameters

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* owner

*Execution cost: **less than 765 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* organizationsData

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*

1. **originalIntVote** *of type address*
2. **originalProposalId** *of type bytes32*
3. **originalNumOfChoices** *of type uint256*


#### *function* hashedParameters

*Execution cost: **less than 656 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* action
> do the actual voting in the other organization in behalf of the organization's avatar.     This function is deleted called by the organization.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_params** *of type bytes32[]- array represent the voting .       _params[0] - the address of the voting machine.       _params[1] - the proposalId.       _params[2] - the voting machine params.*

bool which indicate success.

