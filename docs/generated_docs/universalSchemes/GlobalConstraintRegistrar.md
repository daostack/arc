# GlobalConstraintRegistrar
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/GlobalConstraintRegistrar.sol)

*Code deposit cost: **less than 717800 gas.***

*Execution cost: **less than 21121 gas.***

*Total deploy cost(deposit + execution): **less than 738921 gas.***

> A scheme to manage global constraint for organizations


## Reference
### Constructors
#### *constructor* GlobalConstraintRegistrar()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* RemoveGlobalConstraintsProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*


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


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


#### *event* NewGlobalConstraintsProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*
5. **_params** *of type bytes32*
6. **_voteToRemoveParams** *of type bytes32*


### Fallback
*Nothing*
### Functions
#### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*


#### *function* parameters

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*


#### *function* proposeToRemoveGC

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_gc** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22983 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* updateParameters

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* proposeGlobalConstraint

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_gc** *of type address*
3. **_params** *of type bytes32*
4. **_voteToRemoveParams** *of type bytes32*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* owner

*Execution cost: **less than 743 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* organizationsData

*Execution cost: **less than 1013 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*


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

1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


