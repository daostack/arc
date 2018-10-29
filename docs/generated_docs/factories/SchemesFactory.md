# SchemesFactory
[see the source](https://github.com/daostack/arc/tree/master/contracts/factories/SchemesFactory.sol)


**Execution cost**: less than 21249 gas

**Deployment cost**: less than 946000 gas

**Combined cost**: less than 967249 gas


## Events
### ContributionRewardCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### ConstraintRegistrarLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### CloneCreated(address,address)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **clone** *of type `address`*

--- 
### ConstraintRegistrarCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### SchemeRegistrarCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### OwnershipRenounced(address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*

--- 
### GenericSchemeLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### GenericSchemeCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### ContributionRewardLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### SchemeRegistrarLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### SimpleICOCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### SimpleICOLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### UpgradeSchemeCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### UpgradeSchemeLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### VestingSchemeCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### VestingSchemeLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*

--- 
### VoteInOrganizationSchemeCreated(address)


**Execution cost**: No bound available


Params:

1. **_newSchemeAddress** *of type `address`*

--- 
### VoteInOrganizationSchemeLibraryChanged(address,address)


**Execution cost**: No bound available


Params:

1. **_newLibraryAddress** *of type `address`*
2. **_previousLibraryAddress** *of type `address`*


## Methods
### setGenericSchemeLibraryAddress(address)


**Execution cost**: less than 22991 gas


Params:

1. **_genericSchemeLibraryAddress** *of type `address`*


--- 
### schemeRegistrarLibraryAddress()


**Execution cost**: less than 1109 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### genericSchemeLibraryAddress()


**Execution cost**: less than 581 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createSchemeRegistrar(address,address,bytes32,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteRegisterParams** *of type `bytes32`*
4. **_voteRemoveParams** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### createContributionReward(address,address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteApproveParams** *of type `bytes32`*
4. **_orgNativeTokenFee** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### createUpgradeScheme(address,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### constraintRegistrarLibraryAddress()


**Execution cost**: less than 1021 gas

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
### contributionRewardLibraryAddress()


**Execution cost**: less than 713 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createGenericScheme(address,address,bytes32,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*
4. **_contractToCall** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### owner()


**Execution cost**: less than 757 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### createVestingScheme(address,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### createVoteInOrganizationScheme(address,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### createSimpleICO(address,uint256,uint256,uint256,uint256,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_cap** *of type `uint256`*
3. **_price** *of type `uint256`*
4. **_startBlock** *of type `uint256`*
5. **_endBlock** *of type `uint256`*
6. **_beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### createConstraintRegistrar(address,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteRegisterParams** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### setVestingSchemeLibraryAddress(address)


**Execution cost**: less than 23167 gas


Params:

1. **_vestingSchemeLibraryAddress** *of type `address`*


--- 
### setContributionRewardLibraryAddress(address)


**Execution cost**: less than 22705 gas


Params:

1. **_contributionRewardLibraryAddress** *of type `address`*


--- 
### setConstraintRegistrarLibraryAddress(address)


**Execution cost**: less than 23057 gas


Params:

1. **_constraintRegistrarLibraryAddress** *of type `address`*


--- 
### setSchemeRegistrarLibraryAddress(address)


**Execution cost**: less than 22969 gas


Params:

1. **_schemeRegistrarLibraryAddress** *of type `address`*


--- 
### setSimpleICOLibraryAddress(address)


**Execution cost**: less than 22837 gas


Params:

1. **_simpleICOLibraryAddress** *of type `address`*


--- 
### setUpgradeSchemeLibraryAddress(address)


**Execution cost**: less than 22793 gas


Params:

1. **_upgradeSchemeLibraryAddress** *of type `address`*


--- 
### setVoteInOrganizationSchemeLibraryAddress(address)


**Execution cost**: less than 22947 gas


Params:

1. **_voteInOrganizationSchemeLibraryAddress** *of type `address`*


--- 
### simpleICOLibraryAddress()


**Execution cost**: less than 977 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23379 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### upgradeSchemeLibraryAddress()


**Execution cost**: less than 845 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### vestingSchemeLibraryAddress()


**Execution cost**: less than 1065 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### voteInOrganizationSchemeLibraryAddress()


**Execution cost**: less than 867 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#schemesfactory)
