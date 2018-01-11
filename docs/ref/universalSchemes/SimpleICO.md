# *contract* SimpleICO ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/SimpleICO.sol))
*Code deposit upper limit: **1018400 gas***
*Executionas upper limit: **Infinite gas***

SimpleICO scheme.
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
## Constructors
### *constructor* SimpleICO(address, uint256, address)
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Params:*
    1. **_nativeToken** *of type address*
    2. **_fee** *of type uint256*
    3. **_beneficiary** *of type address*


## Events
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


## Fallback
*Nothing*
## Functions
### *function* registerOrganization
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* parameters
*Execution cost upper limit: **1871 gas***
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
*Execution cost upper limit: **23181 gas***
**nonpayable**
Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
    1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* resumeICO
*Execution cost upper limit: **21645 gas***
**nonpayable**
Allowing admin to reopen an ICO.
*Inputs:*
    1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* updateParameters
*Execution cost upper limit: **Infinite gas***
**nonpayable**

*Inputs:*
    1. **_nativeToken** *of type address*
    2. **_fee** *of type uint256*
    3. **_beneficiary** *of type address*
    4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


### *function* start
*Execution cost upper limit: **Infinite gas***
**nonpayable**
start an ICO
*Inputs:*
    1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* setParameters
*Execution cost upper limit: **Infinite gas***
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
*Execution cost upper limit: **1575 gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*

*Returns:*
    1. **paramsHash** *of type bytes32*
    2. **avatarContractICO** *of type address*
    3. **totalEthRaised** *of type uint256*
    4. **isHalted** *of type bool*


### *function* organizations
*Execution cost upper limit: **749 gas***
**constant | view**

*Inputs:*
    1. **unnamed** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* owner
*Execution cost upper limit: **765 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* nativeToken
*Execution cost upper limit: **919 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


### *function* isRegistered
*Execution cost upper limit: **934 gas***
**constant | view**

*Inputs:*
    1. **_avatar** *of type address*

*Returns:*
    1. **unnamed** *of type bool*


### *function* isActive
*Execution cost upper limit: **4143 gas***
**constant | view**
Check is an ICO is active (halted is still considered active). Active ICO: 1. The organization is registered. 2. The ICO didn't reach it's cap yet. 3. The current block isn't bigger than the "endBlock" & Smaller then the "startBlock"
*Inputs:*
    1. **_avatar** *of type address- The Avatar's of the organization*

bool which represents a successful of the function

### *function* hashedParameters
*Execution cost upper limit: **832 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type bytes32*


### *function* haltICO
*Execution cost upper limit: **21541 gas***
**nonpayable**
Allowing admin to halt an ICO.
*Inputs:*
    1. **_avatar** *of type address- The Avatar's of the organization*

*Returns:*
*Nothing*


### *function* getParametersHash
*Execution cost upper limit: **Infinite gas***
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
*Execution cost upper limit: **744 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type uint256*


### *function* donate
*Execution cost upper limit: **Infinite gas***
**payable**

*Inputs:*
    1. **_avatar** *of type address*
    2. **_beneficiary** *of type address*

*Returns:*
    1. **unnamed** *of type uint256*


### *function* beneficiary
*Execution cost upper limit: **655 gas***
**constant | view**

*Inputs:*
*Nothing*

*Returns:*
    1. **unnamed** *of type address*


