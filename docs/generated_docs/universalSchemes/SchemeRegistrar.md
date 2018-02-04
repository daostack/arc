# SchemeRegistrar
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/SchemeRegistrar.sol)

*Code deposit cost: **less than 738200 gas.***

*Execution cost: **less than 21141 gas.***

*Total deploy cost(deposit + execution): **less than 759341 gas.***

> A registrar for Schemes for organizations


## Reference
### Constructors
#### *constructor* SchemeRegistrar()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### *event* RemoveSchemeProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*


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


#### *event* NewSchemeProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*
5. **_parametersHash** *of type bytes32*
6. **_isRegistering** *of type bool*


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


### Fallback
*Nothing*
### Functions
#### *function* proposeToRemoveScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* parameters

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **voteRegisterParams** *of type bytes32*
2. **voteRemoveParams** *of type bytes32*
3. **intVote** *of type address*


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteRegisterParams** *of type bytes32*
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* updateParameters

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23005 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* proposeScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*
3. **_parametersHash** *of type bytes32*
4. **_isRegistering** *of type bool*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* owner

*Execution cost: **less than 765 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*


#### *function* organizationsProposals

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*

1. **scheme** *of type address*
2. **parametersHash** *of type bytes32*
3. **proposalType** *of type uint256*
4. **isRegistering** *of type bool*


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
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

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


