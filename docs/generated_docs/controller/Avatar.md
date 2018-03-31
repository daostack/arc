# Avatar
[see the source](https://github.com/daostack/arc/tree/master/contracts/controller/Avatar.sol)
> An Avatar holds tokens, reputation and ether for a controller


**Execution cost**: less than 81472 gas

**Deployment cost**: less than 467400 gas

**Combined cost**: less than 548872 gas

## Constructor



Params:

1. **_orgName** *of type `bytes32`*
2. **_nativeToken** *of type `address`*
3. **_nativeReputation** *of type `address`*

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
### GenericAction(address,bytes32[])


**Execution cost**: No bound available


Params:

1. **_action** *of type `address`*
2. **_params** *of type `bytes32[]`*

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


**Execution cost**: less than 1870 gas

**Attributes**: payable



## Methods
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
### orgName()


**Execution cost**: less than 1545 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### nativeReputation()


**Execution cost**: less than 1545 gas

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
### nativeToken()


**Execution cost**: less than 1545 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### genericAction(address,bytes32[])
>
> call an action function on an ActionInterface. This function use delegatecall and might expose the organization to security risk. Use this function only if you really knows what you are doing.


**Execution cost**: No bound available


Params:

1. **_action** *of type `address`*

    > the address of the contract to call.

2. **_params** *of type `bytes32[]`*

    > the params for the call.


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
### owner()


**Execution cost**: less than 1545 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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


**Execution cost**: less than 23027 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



[Back to the top ↑](#avatar)
