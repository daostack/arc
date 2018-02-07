
## Reference
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/ContributionReward.sol)

*Code deposit cost: **less than 782800 gas.***

*Execution cost: **less than 21186 gas.***

*Total deploy cost(deposit + execution): **less than 803986 gas.***

> A scheme for proposing and rewarding contributions to an organization

### Constructors
#### ContributionReward()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


### Events
#### ProposalExecuted(address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

---
#### ProposalDeleted(address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

---
#### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
#### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*

---
#### NewContributionProposal(address, bytes32, address, bytes32, uint256[4], address, address)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_contributionDescription** *of type bytes32*
5. **_rewards** *of type uint256[4]*
6. **_externalToken** *of type address*
7. **_beneficiary** *of type address*


### Fallback
*Nothing*
### Functions
#### updateParameters(bytes32)

*Execution cost: **less than 20550 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
#### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 22983 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
#### setParameters(uint256, bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_orgNativeTokenFee** *of type uint256*
2. **_voteApproveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
#### proposeContributionReward(address, bytes32, uint256[4], address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_avatar** *of type address*
2. **_contributionDescriptionHash** *of type bytes32*
3. **_rewards** *of type uint256[4]*
4. **_externalToken** *of type address*
5. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
#### parameters(bytes32)

*Execution cost: **less than 1148 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **orgNativeTokenFee** *of type uint256*
2. **voteApproveParams** *of type bytes32*
3. **intVote** *of type address*

---
#### owner()

*Execution cost: **less than 721 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
#### organizationsProposals(address, bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*

1. **contributionDescriptionHash** *of type bytes32*
2. **nativeTokenReward** *of type uint256*
3. **reputationReward** *of type uint256*
4. **ethReward** *of type uint256*
5. **externalToken** *of type address*
6. **externalTokenReward** *of type uint256*
7. **beneficiary** *of type address*

---
#### hashedParameters()

*Execution cost: **less than 634 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
#### getParametersHash(uint256, bytes32, address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_orgNativeTokenFee** *of type uint256*
2. **_voteApproveParams** *of type bytes32*
3. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
#### execute(bytes32, address, int256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*


