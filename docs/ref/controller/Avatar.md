# *contract* Avatar ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Avatar.sol))
An Avatar holds tokens, reputation and ether for a controller

- [Constructors](#constructors)
    - [Avatar(bytes32 _orgName, address _nativeToken, address _nativeReputation)](#constructor-avatarbytes32-_orgname-address-_nativetoken-address-_nativereputation)
- [Events](#events)
    - [SendEther](#event-sendether)
    - [ReceiveEther](#event-receiveether)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [GenericAction](#event-genericaction)
    - [ExternalTokenTransferFrom](#event-externaltokentransferfrom)
    - [ExternalTokenTransfer](#event-externaltokentransfer)
    - [ExternalTokenIncreaseApproval](#event-externaltokenincreaseapproval)
    - [ExternalTokenDecreaseApproval](#event-externaltokendecreaseapproval)
- [Fallback](#fallback)
- [Functions](#functions)
    - [externalTokenTransferFrom](#function-externaltokentransferfrom)
    - [transferOwnership](#function-transferownership)
    - [sendEther](#function-sendether)
    - [owner](#function-owner)
    - [orgName](#function-orgname)
    - [nativeToken](#function-nativetoken)
    - [nativeReputation](#function-nativereputation)
    - [genericAction](#function-genericaction)
    - [externalTokenTransfer](#function-externaltokentransfer)
    - [externalTokenIncreaseApproval](#function-externaltokenincreaseapproval)
    - [externalTokenDecreaseApproval](#function-externaltokendecreaseapproval)
## Constructors
### *constructor* Avatar(bytes32 _orgName, address _nativeToken, address _nativeReputation)
*Parameters:*
1. **_orgName** *of type bytes32*
2. **_nativeToken** *of type address*
3. **_nativeReputation** *of type address*

## Events
### *event* SendEther
*Parameters:*
1. **_amountInWei** *of type uint256*
2. **_to** *of type address*

### *event* ReceiveEther
*Parameters:*
1. **_sender** *of type address*
2. **_value** *of type uint256*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* GenericAction
*Parameters:*
1. **_action** *of type address*
2. **_params** *of type bytes32[]*

### *event* ExternalTokenTransferFrom
*Parameters:*
1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

### *event* ExternalTokenTransfer
*Parameters:*
1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

### *event* ExternalTokenIncreaseApproval
*Parameters:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*

### *event* ExternalTokenDecreaseApproval
*Parameters:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*

## Fallback
**payable**

## Functions
### *function* externalTokenTransferFrom
**nonpayable**

external token transfer from a specific account
*Inputs:*
1. **_externalToken** *of type address* - the token contract
2. **_from** *of type address* - the account to spend token from
3. **_to** *of type address* - the destination address
4. **_value** *of type uint256* - the amount of tokens to transfer

*Returns:*
bool which represents success

### *function* transferOwnership
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* sendEther
**nonpayable**

send ethers from the avatar's wallet
*Inputs:*
1. **_amountInWei** *of type uint256* - amount to send in Wei units
2. **_to** *of type address* - send the ethers to this address

*Returns:*
bool which represents success

### *function* owner
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* orgName
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* nativeToken
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* nativeReputation
**constant**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* genericAction
**nonpayable**

call an action function on an ActionInterface. This function use deligatecall and might expose the organization to security risk. Use this function only if you really knows what you are doing.
*Inputs:*
1. **_action** *of type address* - the address of the contract to call.
2. **_params** *of type bytes32[]* - the params for the call.

*Returns:*
bool which represents success

### *function* externalTokenTransfer
**nonpayable**

external token transfer
*Inputs:*
1. **_externalToken** *of type address* - the token contract
2. **_to** *of type address* - the destination address
3. **_value** *of type uint256* - the amount of tokens to transfer

*Returns:*
bool which represents success

### *function* externalTokenIncreaseApproval
**nonpayable**

increase approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_spender** *of type address* - address
3. **_addedValue** *of type uint256* - the amount of ether (in Wei) which the approval is refering to.

*Returns:*
bool which represents a success

### *function* externalTokenDecreaseApproval
**nonpayable**

decrease approval for the spender address to spend a specified amount of tokens     on behalf of msg.sender.
*Inputs:*
1. **_externalToken** *of type address* - the address of the Token Contract
2. **_spender** *of type address* - address
3. **_subtractedValue** *of type uint256* - the amount of ether (in Wei) which the approval is refering to.

*Returns:*
bool which represents a success

