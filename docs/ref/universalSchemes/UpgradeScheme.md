# *contract* UpgradeScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/UpgradeScheme.sol))
*Code deposit cost: **less than 911400 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 911400 gas.***

> A schme to manage the upgrade of an organization.


## Reference
- [Constructors](#constructors)
    - [UpgradeScheme(address, uint256, address)](#constructor-upgradeschemeaddress-uint256-address)
- [Events](#events)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [OrganizationRegistered](#event-organizationregistered)
    - [LogProposalExecuted](#event-logproposalexecuted)
    - [LogProposalDeleted](#event-logproposaldeleted)
    - [LogNewUpgradeProposal](#event-lognewupgradeproposal)
    - [LogNewProposal](#event-lognewproposal)
    - [LogChangeUpgradeSchemeProposal](#event-logchangeupgradeschemeproposal)
- [Fallback](#fallback)
- [Functions](#functions)
    - [setParameters](#function-setparameters)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [proposeUpgrade](#function-proposeupgrade)
    - [proposeChangeUpgradingScheme](#function-proposechangeupgradingscheme)
    - [updateParameters](#function-updateparameters)
    - [owner](#function-owner)
    - [organizationsProposals](#function-organizationsproposals)
    - [organizations](#function-organizations)
    - [nativeToken](#function-nativetoken)
    - [isRegistered](#function-isregistered)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [beneficiary](#function-beneficiary)
### Constructors
### *constructor* UpgradeScheme(address, uint256, address)

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


### *event* LogProposalExecuted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogProposalDeleted
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogNewUpgradeProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **_newController** *of type address*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### *event* LogChangeUpgradeSchemeProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_intVoteInterface** *of type address*
4. **newUpgradeScheme** *of type address*
5. **_params** *of type bytes32*
6. **tokenFee** *of type address*
7. **fee** *of type uint256*


### Fallback
*Nothing*
### Functions
### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* parameters

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **voteParams** *of type bytes32*
2. **intVote** *of type address*


### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23206 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


### *function* registerOrganization

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*


### *function* proposeUpgrade

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_newController** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* proposeChangeUpgradingScheme

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_avatar** *of type address*
2. **_scheme** *of type address*
3. **_params** *of type bytes32*
4. **_tokenFee** *of type address*
5. **_fee** *of type uint256*

*Returns:*
1. **unnamed** *of type bytes32*


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


### *function* owner

*Execution cost: **less than 809 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* organizationsProposals

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **upgradeContract** *of type address*
2. **params** *of type bytes32*
3. **proposalType** *of type uint256*
4. **tokenFee** *of type address*
5. **fee** *of type uint256*


### *function* organizations

*Execution cost: **less than 749 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* nativeToken

*Execution cost: **less than 897 gas.***

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


### *function* hashedParameters

*Execution cost: **less than 788 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* fee

*Execution cost: **less than 722 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type uint256*


### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*
1. **unnamed** *of type bool*


### *function* beneficiary

*Execution cost: **less than 677 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


