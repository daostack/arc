# Locking4Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/bootstrapSchemes/Locking4Reputation.sol)
> A locker contract


**Execution cost**: less than 386 gas

**Deployment cost**: less than 346600 gas

**Combined cost**: less than 346986 gas


## Events
### Lock(address,bytes32,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_locker** *of type `address`*
2. **_lockingId** *of type `bytes32`*
3. **_amount** *of type `uint256`*
4. **_period** *of type `uint256`*

--- 
### Redeem(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_lockingId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*

--- 
### Release(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_lockingId** *of type `bytes32`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*


## Methods
### reputationRewardLeft()


**Execution cost**: less than 516 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### lockingStartTime()


**Execution cost**: less than 384 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### avatar()


**Execution cost**: less than 581 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### lockingEndTime()


**Execution cost**: less than 494 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### lockers(address,bytes32)


**Execution cost**: less than 930 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **amount** *of type `uint256`*
2. **releaseTime** *of type `uint256`*

--- 
### lockingsCounter()


**Execution cost**: less than 582 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### maxLockingPeriod()


**Execution cost**: less than 538 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### redeem(address,bytes32)
>
> redeem reputation function


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

    > the beneficiary for the release

2. **_lockingId** *of type `bytes32`*

    > the locking id to release


Returns:

> bool

1. **output_0** *of type `bool`*

--- 
### reputationReward()


**Execution cost**: less than 648 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### scores(address)


**Execution cost**: less than 597 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### totalLocked()


**Execution cost**: less than 406 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### totalLockedLeft()


**Execution cost**: less than 604 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### totalScore()


**Execution cost**: less than 560 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

[Back to the top ↑](#locking4reputation)
