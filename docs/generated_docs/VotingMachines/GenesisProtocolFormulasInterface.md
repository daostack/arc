# GenesisProtocolFormulasInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/GenesisProtocolFormulasInterface.sol)

*Code deposit cost: **No bound available.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **No bound available.***

> 
## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### threshold(address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type int256*

---
### shouldBoost(bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type bool*

---
### score(bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type int256*

---
### getRedeemableTokensVoter(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_beneficiary** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### getRedeemableTokensStaker(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_staker** *of type address*

*Returns:*

1. **unnamed** *of type uint256*

---
### getRedeemableReputationProposer(bytes32)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type int256*


