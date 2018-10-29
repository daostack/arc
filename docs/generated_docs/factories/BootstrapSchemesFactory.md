# BootstrapSchemesFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/BootstrapSchemesFactory.sol)


**Execution cost**: less than 21028 gas

**Deployment cost**: less than 726000 gas

**Combined cost**: less than 747028 gas


## Events
### ExternalLocking4ReputationCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### Auction4ReputationLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### Auction4ReputationCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### CloneCreated(address,address)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **clone** *of type `address`*

--- 
### ExternalLocking4ReputationLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### FixedReputationAllocationCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### FixedReputationAllocationLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### LockingEth4ReputationCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### LockingEth4ReputationLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### LockingToken4ReputationCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### LockingToken4ReputationLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

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


## Methods
### owner()


**Execution cost**: less than 735 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fixedReputationAllocationLibraryAddress()


**Execution cost**: less than 537 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createLockingToken4Reputation(address,uint256,uint256,uint256,uint256,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_reputationReward** *of type `uint256`*
3. **_lockingStartTime** *of type `uint256`*
4. **_lockingEndTime** *of type `uint256`*
5. **_maxLockingPeriod** *of type `uint256`*
6. **_token** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### createAuction4Reputation(address,uint256,uint256,uint256,uint256,address,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_reputationReward** *of type `uint256`*
3. **_auctionsStartTime** *of type `uint256`*
4. **_auctionsEndTime** *of type `uint256`*
5. **_numberOfAuctions** *of type `uint256`*
6. **_token** *of type `address`*
7. **_wallet** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### auction4ReputationLibraryAddress()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createLockingEth4Reputation(address,uint256,uint256,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_reputationReward** *of type `uint256`*
3. **_lockingStartTime** *of type `uint256`*
4. **_lockingEndTime** *of type `uint256`*
5. **_maxLockingPeriod** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### createExternalLocking4Reputation(address,uint256,uint256,uint256,address,string)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_reputationReward** *of type `uint256`*
3. **_lockingStartTime** *of type `uint256`*
4. **_lockingEndTime** *of type `uint256`*
5. **_externalLockingContract** *of type `address`*
6. **_getBalanceFuncSignature** *of type `string`*

Returns:


1. **output_0** *of type `address`*

--- 
### externalLocking4ReputationLibraryAddress()


**Execution cost**: less than 559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createFixedReputationAllocation(address,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_reputationReward** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### lockingEth4ReputationLibraryAddress()


**Execution cost**: less than 757 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### lockingToken4ReputationLibraryAddress()


**Execution cost**: less than 867 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22295 gas




--- 
### setAuction4ReputationLibraryAddress(address)


**Execution cost**: less than 22991 gas


Params:

1. **_auction4ReputationLibraryAddress** *of type `address`*


--- 
### setExternalLocking4ReputationLibraryAddress(address)


**Execution cost**: less than 23013 gas


Params:

1. **_externalLocking4ReputationLibraryAddress** *of type `address`*


--- 
### setFixedReputationAllocationLibraryAddress(address)


**Execution cost**: less than 22771 gas


Params:

1. **_fixedReputationAllocationLibraryAddress** *of type `address`*


--- 
### setLockingEth4ReputationLibraryAddress(address)


**Execution cost**: less than 22815 gas


Params:

1. **_lockingEth4ReputationLibraryAddress** *of type `address`*


--- 
### setLockingToken4ReputationLibraryAddress(address)


**Execution cost**: less than 22837 gas


Params:

1. **_lockingToken4ReputationLibraryAddress** *of type `address`*


--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23203 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#bootstrapschemesfactory)
