# SchemeRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/SchemeRegistrar.sol)

*Code deposit cost: **less than 741400 gas.***

*Execution cost: **less than 21141 gas.***

*Total deploy cost(deposit + execution): **less than 762541 gas.***

> A registrar for Schemes for organizations

## Constructors
### SchemeRegistrar()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### RemoveSchemeProposal(address, bytes32, address, address)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*

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
### NewSchemeProposal(address, bytes32, address, address, bytes32, bool)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_scheme** *of type address*
5. **_parametersHash** *of type bytes32*
6. **_isRegistering** *of type bool*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*


## Fallback
*Nothing*
## Functions
### proposeToRemoveScheme(address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### parameters(bytes32)

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **voteRegisterParams** *of type bytes32*
2. **voteRemoveParams** *of type bytes32*
3. **intVote** *of type address*

---
### setParameters(bytes32, bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteRegisterParams** *of type bytes32*
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### updateParameters(bytes32)

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

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
### proposeScheme(address, address, bytes32, bool)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_scheme** *of type address*
3. **_parametersHash** *of type bytes32*
4. **_isRegistering** *of type bool*

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

1. **scheme** *of type address*
2. **parametersHash** *of type bytes32*
3. **proposalType** *of type uint256*
4. **isRegistering** *of type bool*

---
### hashedParameters()

*Execution cost: **less than 656 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getParametersHash(bytes32, bytes32, address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_voteRegisterParams** *of type bytes32*
2. **_voteRemoveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### execute(bytes32, address, int256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*


