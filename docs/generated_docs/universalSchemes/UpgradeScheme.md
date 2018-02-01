# UpgradeScheme
[see the source](https://github.com/daostack/daostack/tree/master/contracts/universalSchemes/UpgradeScheme.sol)

*Code deposit cost: **less than 711200 gas.***

*Execution cost: **less than 21115 gas.***

*Total deploy cost(deposit + execution): **less than 732315 gas.***

> A scheme to manage the upgrade of an organization.


## Reference
### Constructors
#### *constructor* UpgradeScheme()

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


#### *event* NewUpgradeProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_newController** *of type address*


#### *event* NewProposal
*Params:*

1. **proposalId** *of type bytes32*


#### *event* ChangeUpgradeSchemeProposal
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **newUpgradeScheme** *of type address*
5. **_params** *of type bytes32*


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

1. **voteParams** *of type bytes32*
2. **intVote** *of type address*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23005 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*


#### *function* proposeUpgrade

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_newController** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


#### *function* updateParameters

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*


#### *function* proposeChangeUpgradingScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*
3. **_params** *of type bytes32*

*Returns:*

1. **unnamed** *of type bytes32*


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


#### *function* organizationsProposals

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*

1. **upgradeContract** *of type address*
2. **params** *of type bytes32*
3. **proposalType** *of type uint256*


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


