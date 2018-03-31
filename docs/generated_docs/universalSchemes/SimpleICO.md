# SimpleICO
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/SimpleICO.sol)
> SimpleICO scheme.


**Execution cost**: less than 21271 gas

**Deployment cost**: less than 865200 gas

**Combined cost**: less than 886471 gas

## Constructor




## Events
### DonationReceived(address,address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **organization** *of type `address`*
2. **_beneficiary** *of type `address`*
3. **_incomingEther** *of type `uint256`*
4. **_tokensAmount** *of type `uint256`*

--- 
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*


## Methods
### owner()


**Execution cost**: less than 721 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### hashedParameters()


**Execution cost**: less than 700 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### donate(address,address)
>
> Donating ethers to get tokens. If the donation is higher than the remaining ethers in the "cap", The donator will get the change in ethers.


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **_avatar** *of type `address`*

    > The Avatar's of the organization.

2. **_beneficiary** *of type `address`*

    > The donator's address - which will receive the ICO's tokens.


Returns:

> uint number of tokens minted for the donation.

1. **output_0** *of type `uint256`*

--- 
### haltICO(address)
>
> Allowing admin to halt an ICO.


**Execution cost**: less than 21475 gas


Params:

1. **_avatar** *of type `address`*

    > The Avatar's of the organization



--- 
### getParametersHash(uint256,uint256,uint256,uint256,address,address)
>
> Hash the parameters and return the hash value


**Execution cost**: less than 829 gas

**Attributes**: constant


Params:

1. **_cap** *of type `uint256`*

    > the ico cap

2. **_price** *of type `uint256`*

    > represents Tokens per 1 Eth

3. **_startBlock** *of type `uint256`*

    > ico start block

4. **_endBlock** *of type `uint256`*

    > ico end

5. **_beneficiary** *of type `address`*

    > the ico ether beneficiary

6. **_admin** *of type `address`*

    > the address of the ico admin which can hold and resume the ICO.


Returns:

> bytes32 -the params hash

1. **output_0** *of type `bytes32`*

--- 
### isActive(address)
>
> Check is an ICO is active (halted is still considered active). Active ICO: 1. The organization is registered. 2. The ICO didn't reach it's cap yet. 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"


**Execution cost**: less than 3761 gas

**Attributes**: constant


Params:

1. **_avatar** *of type `address`*

    > The Avatar's of the organization


Returns:

> bool which represents a successful of the function

1. **output_0** *of type `bool`*

--- 
### organizationsICOInfo(address)


**Execution cost**: less than 1559 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **paramsHash** *of type `bytes32`*
2. **avatarContractICO** *of type `address`*
3. **totalEthRaised** *of type `uint256`*
4. **isHalted** *of type `bool`*

--- 
### parameters(bytes32)


**Execution cost**: less than 1880 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **cap** *of type `uint256`*
2. **price** *of type `uint256`*
3. **startBlock** *of type `uint256`*
4. **endBlock** *of type `uint256`*
5. **beneficiary** *of type `address`*
6. **admin** *of type `address`*

--- 
### resumeICO(address)
>
> Allowing admin to reopen an ICO.


**Execution cost**: less than 21513 gas


Params:

1. **_avatar** *of type `address`*

    > The Avatar's of the organization



--- 
### setParameters(uint256,uint256,uint256,uint256,address,address)
>
> Hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 122123 gas


Params:

1. **_cap** *of type `uint256`*

    > the ico cap

2. **_price** *of type `uint256`*

    > represents Tokens per 1 Eth

3. **_startBlock** *of type `uint256`*

    > ico start block

4. **_endBlock** *of type `uint256`*

    > ico end

5. **_beneficiary** *of type `address`*

    > the ico ether beneficiary

6. **_admin** *of type `address`*

    > the address of the ico admin which can hold and resume the ICO.


Returns:

> bytes32 -the params hash

1. **output_0** *of type `bytes32`*

--- 
### start(address)
>
> start an ICO


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > The Avatar's of the organization



--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23049 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20572 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#simpleico)
