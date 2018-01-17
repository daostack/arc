# *contract* Avatar ([source](https://github.com/daostack/daostack/tree/master/./contracts/controller/Avatar.sol))
*Code deposit cost: **less than 475800 gas.***

*Execution cost: **less than 81478 gas.***

*Total deploy cost(deposit + execution): **less than 557278 gas.***

> An Avatar holds tokens, reputation and ether for a controller

The *Avatar* is the public facing entity a DAO exposes to interact with the outside world(vote on other DAOs, pay external actors, etc...)
## Reference
- [Constructors](#constructors)
    - [Avatar(bytes32, address, address)](#constructor-avatarbytes32-address-address)
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
### Constructors
### *constructor* Avatar(bytes32, address, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_orgName** *of type bytes32*
2. **_nativeToken** *of type address*
3. **_nativeReputation** *of type address*


### Events
### *event* SendEther
*Params:*
1. **_amountInWei** *of type uint256*
2. **_to** *of type address*


### *event* ReceiveEther
*Params:*
1. **_sender** *of type address*
2. **_value** *of type uint256*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* GenericAction
*Params:*
1. **_action** *of type address*
2. **_params** *of type bytes32[]*


### *event* ExternalTokenTransferFrom
*Params:*
1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*


### *event* ExternalTokenTransfer
*Params:*
1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*


### *event* ExternalTokenIncreaseApproval
*Params:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*


### *event* ExternalTokenDecreaseApproval
*Params:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*


### Fallback
*Execution cost: **less than 1870 gas.***

**payable**



### Functions
### *function* externalTokenTransferFrom

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_from** *of type address*
3. **_to** *of type address*
4. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23027 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* sendEther

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_amountInWei** *of type uint256*
2. **_to** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* owner

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* orgName

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* nativeToken

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* nativeReputation

*Execution cost: **less than 1545 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* genericAction

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_action** *of type address*
2. **_params** *of type bytes32[]*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenTransfer

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_to** *of type address*
3. **_value** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenIncreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_addedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


### *function* externalTokenDecreaseApproval

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_externalToken** *of type address*
2. **_spender** *of type address*
3. **_subtractedValue** *of type uint256*

*Returns:*
1. **unnamed** *of type bool*


