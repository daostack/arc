# Redeemer
[see the source](https://github.com/daostack/arc/tree/master/contracts/utils/Redeemer.sol)


**Execution cost**: less than 21070 gas

**Deployment cost**: less than 608400 gas

**Combined cost**: less than 629470 gas

## Constructor



Params:

1. **_genesisProtocol** *of type `address`*



## Methods
### genesisProtocol()


**Execution cost**: less than 622 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### redeem(address,address,bytes32,address)
>
> helper to redeem rewards for a proposal It calls execute on the proposal if it is not yet executed. It tries to redeem reputation and stake from the GenesisProtocol. It tries to redeem proposal rewards from the contribution rewards scheme. This function does not emit events. A client should listen to GenesisProtocol and ContributionReward redemption events to monitor redemption operations.


**Execution cost**: No bound available


Params:

1. **_contributionReward** *of type `address`*

    > ContributionReward of the ContributionReward scheme

2. **_avatar** *of type `address`*

    > address of the controller

3. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

4. **_beneficiary** *of type `address`*

    > beneficiary


Returns:

> gpRewards array         gpRewards[0] - stakerTokenAmount         gpRewards[1] - stakerReputationAmount         gpRewards[2] - voterTokenAmount         gpRewards[3] - voterReputationAmount         gpRewards[4] - proposerReputationAmountgpDaoBountyReward array        gpDaoBountyReward[0] - staker dao bounty reward -                               will be zero for the case there is not enough tokens in avatar for the reward.        gpDaoBountyReward[1] - staker potential dao bounty reward.executed  bool true or falsewinningVote                  1 - executed or closed and the winning vote is YES                  2 - executed or closed and the winning vote is NOint crReputationReward Reputation - from ContributionRewardint crNativeTokenReward NativeTokenReward - from ContributionRewardint crEthReward Ether - from ContributionRewardint crExternalTokenReward ExternalToken - from ContributionReward

1. **gpRewards** *of type `uint256[5]`*
2. **gpDaoBountyReward** *of type `uint256[2]`*
3. **executed** *of type `bool`*
4. **winningVote** *of type `uint256`*
5. **crReputationReward** *of type `int256`*
6. **crNativeTokenReward** *of type `uint256`*
7. **crEthReward** *of type `uint256`*
8. **crExternalTokenReward** *of type `uint256`*

[Back to the top ↑](#redeemer)
