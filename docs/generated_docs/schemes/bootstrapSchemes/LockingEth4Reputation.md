# LockingEth4Reputation
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/bootstrapSchemes/LockingEth4Reputation.sol)
> A scheme for locking ETH for reputation


**Execution cost**: less than 41376 gas

**Deployment cost**: less than 815800 gas

**Combined cost**: less than 857176 gas

## Constructor




## Events
### Lock(address,bytes32,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_locker** *of type `address`*
2. **_lockingId** *of type `bytes32`*
3. **_amount** *of type `uint256`*
4. **_period** *of type `uint256`*

--- 
### OwnershipRenounced(address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

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
### maxLockingPeriod()


**Execution cost**: less than 582 gas

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
### lock(uint256)
>
> lock function


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_period** *of type `uint256`*

    > the locking period


Returns:

> lockingId the unique Id

1. **lockingId** *of type `bytes32`*

--- 
### init(address,address,uint256,uint256,uint256,uint256)
>
> init


**Execution cost**: less than 141630 gas


Params:

1. **_owner** *of type `address`*

    > the owner of the scheme

2. **_avatar** *of type `address`*

    > the avatar to mint reputation from

3. **_reputationReward** *of type `uint256`*

    > the total reputation this contract will reward       for eth locking

4. **_lockingStartTime** *of type `uint256`*

    > locking starting period time.

5. **_lockingEndTime** *of type `uint256`*

    > the locking end time.       redeem reputation can be done after this period.       locking is disable after this time.

6. **_maxLockingPeriod** *of type `uint256`*

    > maximum locking period allowed.



--- 
### lockers(address,bytes32)


**Execution cost**: less than 952 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **amount** *of type `uint256`*
2. **releaseTime** *of type `uint256`*

--- 
### lockingEndTime()


**Execution cost**: less than 538 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### totalLockedLeft()


**Execution cost**: less than 670 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 669 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### lockingsCounter()


**Execution cost**: less than 648 gas

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
### release(address,bytes32)
>
> release locked eth


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

    > the release _beneficiary

2. **_lockingId** *of type `bytes32`*

    > the locking id


Returns:

> bool

1. **output_0** *of type `bool`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22141 gas




--- 
### reputationReward()


**Execution cost**: less than 758 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### reputationRewardLeft()


**Execution cost**: less than 560 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### scores(address)


**Execution cost**: less than 619 gas

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
### totalScore()


**Execution cost**: less than 604 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23156 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#lockingeth4reputation)
