# UpgradeScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/UpgradeScheme.sol)

*Code deposit cost: **less than 714400 gas.***

*Execution cost: **less than 21115 gas.***

*Total deploy cost(deposit + execution): **less than 735515 gas.***

> A scheme to manage the upgrade of an organization.

## Constructors
### UpgradeScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### ProposalExecuted(address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

---
### ProposalDeleted(address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### NewUpgradeProposal(address, bytes32, address, address)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_newController** *of type address*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*

---
### ChangeUpgradeSchemeProposal(address, bytes32, address, address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **newUpgradeScheme** *of type address*
5. **_params** *of type bytes32*


## Fallback
*Nothing*
## Functions
### execute(bytes32, address, int256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*

---
### parameters(bytes32)

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **voteParams** *of type bytes32*
2. **intVote** *of type address*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23005 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### proposeUpgrade(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_newController** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### updateParameters(bytes32)

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### proposeChangeUpgradingScheme(address, address, bytes32)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*
3. **_params** *of type bytes32*

*Returns:*

1. **unnamed** *of type bytes32*

---
### setParameters(bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### owner()

*Execution cost: **less than 765 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### organizationsProposals(address, bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*

1. **upgradeContract** *of type address*
2. **params** *of type bytes32*
3. **proposalType** *of type uint256*

---
### hashedParameters()

*Execution cost: **less than 656 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getParametersHash(bytes32, address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


