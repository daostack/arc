# FixedReputationAllocation
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/bootstrapSchemes/FixedReputationAllocation.sol)
> A fixed reputation allocation contract This scheme can be used to allocate a pre define amount of reputation to whitelisted beneficiaries.


**Execution cost**: less than 41068 gas

**Deployment cost**: less than 510400 gas

**Combined cost**: less than 551468 gas

## Constructor




## Events
### BeneficiaryAddressAdded(address)


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

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
### Redeem(address,uint256)


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*
2. **_amount** *of type `uint256`*


## Methods
### init(address,address,uint256)
>
> init


**Execution cost**: less than 61332 gas


Params:

1. **_owner** *of type `address`*

    > the owner of the scheme

2. **_avatar** *of type `address`*

    > the avatar to mint reputation from

3. **_reputationReward** *of type `uint256`*

    > the total reputation this contract will reward



--- 
### beneficiaries(address)


**Execution cost**: less than 543 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### avatar()


**Execution cost**: less than 647 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addBeneficiaries(address[])
>
> add addBeneficiaries function


**Execution cost**: No bound available


Params:

1. **_beneficiaries** *of type `address[]`*

    > addresses



--- 
### addBeneficiary(address)
>
> addBeneficiary function


**Execution cost**: less than 42858 gas


Params:

1. **_beneficiary** *of type `address`*

    > to be whitelisted



--- 
### beneficiaryReward()


**Execution cost**: less than 626 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### enable()
>
> enable function


**Execution cost**: No bound available




--- 
### isEnable()


**Execution cost**: less than 440 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### numberOfBeneficiaries()


**Execution cost**: less than 406 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 713 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### redeem(address)
>
> redeem reputation function


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

    > the beneficiary for the release


Returns:

> bool

1. **output_0** *of type `bool`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22204 gas




--- 
### reputationReward()


**Execution cost**: less than 648 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23046 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#fixedreputationallocation)
