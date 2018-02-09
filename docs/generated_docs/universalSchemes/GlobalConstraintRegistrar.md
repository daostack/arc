# GlobalConstraintRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/GlobalConstraintRegistrar.sol)

*Code deposit cost: **less than 721000 gas.***

*Execution cost: **less than 21121 gas.***

*Total deploy cost(deposit + execution): **less than 742121 gas.***

> A scheme to manage global constraint for organizations

## Constructors
### GlobalConstraintRegistrar()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### RemoveGlobalConstraintsProposal(address, bytes32, address, address)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*

---
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
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*

---
### NewGlobalConstraintsProposal(address, bytes32, address, address, bytes32, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_gc** *of type address*
5. **_params** *of type bytes32*
6. **_voteToRemoveParams** *of type bytes32*


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

1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*

---
### proposeToRemoveGC(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_gc** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22983 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### updateParameters(bytes32)

*Execution cost: **less than 20594 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### proposeGlobalConstraint(address, address, bytes32, bytes32)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_gc** *of type address*
3. **_params** *of type bytes32*
4. **_voteToRemoveParams** *of type bytes32*

*Returns:*

1. **unnamed** *of type bytes32*

---
### setParameters(bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### owner()

*Execution cost: **less than 743 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### organizationsData(address)

*Execution cost: **less than 1013 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*

*Returns:*

1. **voteRegisterParams** *of type bytes32*
2. **intVote** *of type address*

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

1. **_voteRegisterParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*


