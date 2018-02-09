# GenesisProtocolFormulasMock
[see the source](https://github.com/daostack/arc/tree/master/contracts/test/GenesisProtocolFormulasMock.sol)

*Code deposit cost: **less than 416400 gas.***

*Execution cost: **less than 450 gas.***

*Total deploy cost(deposit + execution): **less than 416850 gas.***

> 
## Constructors
*Nothing*
## Events
*Nothing*
## Fallback
*Nothing*
## Functions
### threshold(address)
> threshold return the organization's score threshold which required by a proposal to shift to boosted state. This threshold is dynamically set and it depend on the number of boosted proposal.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address- the organization avatar*

int thresholdConstA.
---
### shouldBoost(bytes32)
> isBoost check if the proposal will shift to the relative voting phase.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.
---
### score(bytes32)
> score return the proposal score

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

uint proposal score.
---
### getRedeemableTokensVoter(bytes32, address)

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*
2. **unnamed** *of type address*

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

*Execution cost: **less than 354 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **unnamed** *of type int256*


