# GenesisProtocolFormulasMock
[see the source](https://github.com/daostack/daostack/tree/master/contracts/test/GenesisProtocolFormulasMock.sol)

*Code deposit cost: **less than 332600 gas.***

*Execution cost: **less than 363 gas.***

*Total deploy cost(deposit + execution): **less than 332963 gas.***

> 

## Reference
### Constructors
*Nothing*
### Events
*Nothing*
### Fallback
*Nothing*
### Functions
#### *function* threshold

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_avatar** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* shouldBoost
> isBoost check if the proposal will shift to the relative voting phase.

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32- the ID of the proposal*

bool true or false.

#### *function* score

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*

*Returns:*

1. **unnamed** *of type uint256*


#### *function* redeemAmount

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_staker** *of type address*

*Returns:*

1. **unnamed** *of type uint256*


