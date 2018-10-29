# Avatar
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Avatar.sol)
> An Avatar holds tokens, reputation and ether for a controller


**Execution cost**: No bound available

**Deployment cost**: less than 733400 gas

**Combined cost**: No bound available

## Constructor




## Events
### ExternalTokenDecreaseApproval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_subtractedValue** *of type `uint256`*

--- 
### ExternalTokenIncreaseApproval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_spender** *of type `address`*
3. **_addedValue** *of type `uint256`*

--- 
### ExternalTokenTransfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_to** *of type `address`*
3. **_value** *of type `uint256`*

--- 
### ExternalTokenTransferFrom(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*
2. **_from** *of type `address`*
3. **_to** *of type `address`*
4. **_value** *of type `uint256`*

--- 
### GenericCall(address,bytes)


**Execution cost**: No bound available


Params:

1. **_contract** *of type `address`*
2. **_params** *of type `bytes`*

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
### ReceiveEther(address,uint256)


**Execution cost**: No bound available


Params:

1. **_sender** *of type `address`*
2. **_value** *of type `uint256`*

--- 
### SendEther(uint256,address)


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*
2. **_to** *of type `address`*

## Fallback


**Execution cost**: less than 1851 gas

**Attributes**: payable



## Methods
### owner()


**Execution cost**: less than 732 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### orgName()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### genericCall(address,bytes)
>
> perform a generic call to an arbitrary contract


**Execution cost**: No bound available


Params:

1. **_contract** *of type `address`*

    > the contract's address to call

2. **_data** *of type `bytes`*

    > ABI-encoded contract call to call `_contract` address.



--- 
### nativeToken()


**Execution cost**: less than 842 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nativeReputation()


**Execution cost**: less than 688 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### externalTokenIncreaseApproval(address,address,uint256)
>
> increase approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_spender** *of type `address`*

    > address

3. **_addedValue** *of type `uint256`*

    > the amount of ether (in Wei) which the approval is referring to.


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### init(address,string,address,address)
>
> the init function takes organization name, native token and reputation system and creates an avatar for a controller


**Execution cost**: No bound available


Params:

1. **_owner** *of type `address`*
2. **_orgName** *of type `string`*
3. **_nativeToken** *of type `address`*
4. **_nativeReputation** *of type `address`*


--- 
### externalTokenTransferFrom(address,address,address,uint256)
>
> external token transfer from a specific account


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the token contract

2. **_from** *of type `address`*

    > the account to spend token from

3. **_to** *of type `address`*

    > the destination address

4. **_value** *of type `uint256`*

    > the amount of tokens to transfer


Returns:

> bool which represents success

1. **output_0** *of type `bool`*

--- 
### externalTokenTransfer(address,address,uint256)
>
> external token transfer


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the token contract

2. **_to** *of type `address`*

    > the destination address

3. **_value** *of type `uint256`*

    > the amount of tokens to transfer


Returns:

> bool which represents success

1. **output_0** *of type `bool`*

--- 
### externalTokenDecreaseApproval(address,address,uint256)
>
> decrease approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.


**Execution cost**: No bound available


Params:

1. **_externalToken** *of type `address`*

    > the address of the Token Contract

2. **_spender** *of type `address`*

    > address

3. **_subtractedValue** *of type `uint256`*

    > the amount of ether (in Wei) which the approval is referring to.


Returns:

> bool which represents a success

1. **output_0** *of type `bool`*

--- 
### renounceOwnership()
>
>Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.
>
> Allows the current owner to relinquish control of the contract.


**Execution cost**: less than 22201 gas




--- 
### sendEther(uint256,address)
>
> send ethers from the avatar's wallet


**Execution cost**: No bound available


Params:

1. **_amountInWei** *of type `uint256`*

    > amount to send in Wei units

2. **_to** *of type `address`*

    > send the ethers to this address


Returns:

> bool which represents success

1. **output_0** *of type `bool`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23087 gas


Params:

1. **_newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#avatar)
