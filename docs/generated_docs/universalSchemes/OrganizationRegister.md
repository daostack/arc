# OrganizationRegister
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/OrganizationRegister.sol)
> A universal organization registry.


**Execution cost**: less than 20754 gas

**Deployment cost**: less than 350200 gas

**Combined cost**: less than 370954 gas

## Constructor




## Events
### OrgAdded(address,address)


**Execution cost**: No bound available


Params:

1. **_registry** *of type `address`*
2. **_org** *of type `address`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### Promotion(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_registry** *of type `address`*
2. **_org** *of type `address`*
3. **_amount** *of type `uint256`*


## Methods
### addOrPromoteAddress(address,address,uint256)
>
> Adding or promoting an address on the registry.     An address(record) to add or promote can be organization address or any contract address.     Adding a record is done by paying at least the minimum required by the registry params.     Promoting a record is done by paying(adding)amount of token to the registry beneficiary.


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > The _avatar of the organization which own the registry.

2. **_record** *of type `address`*

    > The address to add or promote.

3. **_amount** *of type `uint256`*

    > amount to pay for adding or promoting



--- 
### getParametersHash(address,uint256,address)
>
> Hash the parameters ,and return the hash value


**Execution cost**: less than 722 gas

**Attributes**: constant


Params:

1. **_token** *of type `address`*

    > -  the token to pay for register or promotion an address.

2. **_fee** *of type `uint256`*

    > - fee needed for register an address.

3. **_beneficiary** *of type `address`*

    > - the beneficiary payment address


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### hashedParameters()


**Execution cost**: less than 612 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### organizationsRegistry(address,address)


**Execution cost**: less than 736 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 677 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### parameters(bytes32)


**Execution cost**: less than 1157 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **fee** *of type `uint256`*
2. **token** *of type `address`*
3. **beneficiary** *of type `address`*

--- 
### setParameters(address,uint256,address)
>
> Hash the parameters, save if needed and return the hash value


**Execution cost**: less than 61765 gas


Params:

1. **_token** *of type `address`*

    > -  the token to pay for register or promotion an address.

2. **_fee** *of type `uint256`*

    > - fee needed for register an address.

3. **_beneficiary** *of type `address`*

    > - the beneficiary payment address


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22961 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20550 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#organizationregister)
