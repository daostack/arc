# *contract* SimpleICO ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SimpleICO.sol))
*Code deposit cost: **less than 1018400 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 1018400 gas.***

> SimpleICO scheme.


## Reference
- [Constructors](#constructors)
    - [SimpleICO(address, uint256, address)](#constructor-simpleicoaddress-uint256-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogNewProposal](#event-lognewproposal)
    - [DonationReceived](#event-donationreceived)
- [Fallback](#fallback)
- [Functions](#functions)
    - [registerOrganization](#function-registerorganization)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [resumeICO](#function-resumeico)
    - [updateParameters](#function-updateparameters)
    - [start](#function-start)
    - [setParameters](#function-setparameters)
    - [organizationsICOInfo](#function-organizationsicoinfo)
    - [organizations](#function-organizations)
    - [owner](#function-owner)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [isActive](#function-isactive)
    - [hashedParameters](#function-hashedparameters)
    - [haltICO](#function-haltico)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [donate](#function-donate)
    - [beneficiary](#function-beneficiary)
### Constructors
### *constructor* SimpleICO(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### *event* DonationReceived
*Params:*
1. **organization** *of type address*
2. **_beneficiary** *of type address*
3. **_incomingEther** *of type uint256*
4. **_tokensAmount** *of type uint256*


### Fallback
*Nothing*
### Functions
### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* parameters

*Execution cost: **less than 1871 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **cap** *of type uint256*
2. **price** *of type uint256*
3. **startBlock** *of type uint256*
4. **endBlock** *of type uint256*
5. **beneficiary** *of type address*
6. **admin** *of type address*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23181 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* resumeICO
> Allowing admin to reopen an ICO.

*Execution cost: **less than 21645 gas.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* updateParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* start
> start an ICO

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_cap** *of type uint256*
2. **_price** *of type uint256*
3. **_startBlock** *of type uint256*
4. **_endBlock** *of type uint256*
5. **_beneficiary** *of type address*
6. **_admin** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* organizationsICOInfo

*Execution cost: **less than 1575 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **paramsHash** *of type bytes32*
2. **avatarContractICO** *of type address*
3. **totalEthRaised** *of type uint256*
4. **isHalted** *of type bool*


### *function* organizations

*Execution cost: **less than 749 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* owner

*Execution cost: **less than 765 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* nativeToken

*Execution cost: **less than 919 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* isRegistered

*Execution cost: **less than 934 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* isActive
> Check is an ICO is active (halted is still considered active). Active ICO: 1. The organization is registered. 2. The ICO didn't reach it's cap yet. 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"

*Execution cost: **less than 4143 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address- The Avatar's of the organization*

bool which represents a successful of the function

### *function* hashedParameters

*Execution cost: **less than 832 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* haltICO
> Allowing admin to halt an ICO.

*Execution cost: **less than 21541 gas.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_cap** *of type uint256*
2. **_price** *of type uint256*
3. **_startBlock** *of type uint256*
4. **_endBlock** *of type uint256*
5. **_beneficiary** *of type address*
6. **_admin** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* fee

*Execution cost: **less than 744 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* donate

*Execution cost: **No bound available.***

**payable**

*Inputs:*
1. **_avatar** *of type address*
2. **_beneficiary** *of type address*

*Returns:*
1. **unnamed** *of type uint256*


### *function* beneficiary

*Execution cost: **less than 655 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


