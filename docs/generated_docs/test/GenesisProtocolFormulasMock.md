# GenesisProtocolFormulasMock
[see the source](https://github.com/daostack/arc/tree/master/contracts/test/GenesisProtocolFormulasMock.sol)


**Execution cost**: less than 450 gas

**Deployment cost**: less than 416400 gas

**Combined cost**: less than 416850 gas




## Methods
### getRedeemableReputationProposer(bytes32)


**Execution cost**: less than 354 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `int256`*

--- 
### getRedeemableTokensStaker(bytes32,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*
2. **_staker** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### getRedeemableTokensVoter(bytes32,address)


**Execution cost**: less than 374 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### score(bytes32)
>
> score return the proposal score


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint proposal score.

1. **output_0** *of type `int256`*

--- 
### shouldBoost(bytes32)
>
> isBoost check if the proposal will shift to the relative voting phase.


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> bool true or false.

1. **output_0** *of type `bool`*

--- 
### threshold(address)
>
> threshold return the organization's score threshold which required by a proposal to shift to boosted state. This threshold is dynamically set and it depend on the number of boosted proposal.


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_avatar** *of type `address`*

    > the organization avatar


Returns:

> int thresholdConstA.

1. **output_0** *of type `int256`*

[Back to the top ↑](#genesisprotocolformulasmock)
