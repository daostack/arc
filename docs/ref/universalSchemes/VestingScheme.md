# *contract* VestingScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/VestingScheme.sol))
A schme for vesting.

- [Events](#events)
    - [RevokeSignToCancelAgreement](#event-revokesigntocancelagreement)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [SignToCancelAgreement](#event-signtocancelagreement)
    - [OrganizationRegistered](#event-organizationregistered)
    - [NewVestedAgreement](#event-newvestedagreement)
    - [LogRegisterOrg](#event-logregisterorg)
    - [LogNewProposal](#event-lognewproposal)
    - [LogExecutaion](#event-logexecutaion)
    - [LogCollect](#event-logcollect)
    - [LogAgreementProposal](#event-logagreementproposal)
    - [LogAgreementCancel](#event-logagreementcancel)
- [Functions](#functions)
    - [signToCancelAgreement](#function-signtocancelagreement)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [registerOrganization](#function-registerorganization)
    - [revokeSignToCancelAgreement](#function-revokesigntocancelagreement)
    - [updateParameters](#function-updateparameters)
    - [setParameters](#function-setparameters)
    - [proposeVestingAgreement](#function-proposevestingagreement)
    - [isRegistered](#function-isregistered)
    - [organizations](#function-organizations)
    - [organizationsData](#function-organizationsdata)
    - [owner](#function-owner)
    - [nativeToken](#function-nativetoken)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [fee](#function-fee)
    - [execute](#function-execute)
    - [createVestedAgreement](#function-createvestedagreement)
    - [collect](#function-collect)
    - [beneficiary](#function-beneficiary)
    - [agreements](#function-agreements)

## Events
### *event* RevokeSignToCancelAgreement
*Parameters:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*

### *event* OwnershipTransferred
*Parameters:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*

### *event* SignToCancelAgreement
*Parameters:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*

### *event* OrganizationRegistered
*Parameters:*
1. **_avatar** *of type address*

### *event* NewVestedAgreement
*Parameters:*
1. **_agreementId** *of type uint256*

### *event* LogRegisterOrg
*Parameters:*
1. **_avatar** *of type address*

### *event* LogNewProposal
*Parameters:*
1. **proposalId** *of type bytes32*

### *event* LogExecutaion
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_result** *of type int256*

### *event* LogCollect
*Parameters:*
1. **_agreementId** *of type uint256*

### *event* LogAgreementProposal
*Parameters:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

### *event* LogAgreementCancel
*Parameters:*
1. **_agreementId** *of type uint256*

## Functions
### *function* signToCancelAgreement
**nonpayable**

Function to sign to cancel an agreement.
*Inputs:*
1. **_agreementId** *of type uint256* - the relevant agreement.

*Returns:*
*Nothing*

### *function* parameters
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **bytes32**
2. **address**

### *function* transferOwnership
**nonpayable**

Allows the current owner to transfer control of the contract to a newOwner.
*Inputs:*
1. **newOwner** *of type address* - The address to transfer ownership to.

*Returns:*
*Nothing*

### *function* registerOrganization
**nonpayable**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
*Nothing*

### *function* revokeSignToCancelAgreement
**nonpayable**

Function to revoke vote for canceling agreement.
*Inputs:*
1. **_agreementId** *of type uint256* - the relevant agreement.

*Returns:*
*Nothing*

### *function* updateParameters
**nonpayable**

*Inputs:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*
4. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*

### *function* setParameters
**nonpayable**

Hash the parameters, save them if necessary, and return the hash value
*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* proposeVestingAgreement
**nonpayable**

Proposing a vesting agreement in an organization.
*Inputs:*
1. **_beneficiary** *of type address* - the beneficiary of the agreement.
2. **_returnOnCancelAddress** *of type address* - where to send the tokens in case of stoping.
3. **_startingBlock** *of type uint256* - the block from which the agreement starts.
4. **_amountPerPeriod** *of type uint256* - amount of tokens per period.
5. **_periodLength** *of type uint256* - period length in blocks.
6. **_numOfAgreedPeriods** *of type uint256* - how many periods agreed on.
7. **_cliffInPeriods** *of type uint256* - the length of the cliff in periods.
8. **_signaturesReqToCancel** *of type uint256* - number of signatures required to cancel agreement.
9. **_signersArray** *of type address[]* - avatar array of adresses that can sign to cancel agreement.
10. **_avatar** *of type address* - avatar of the organization.

*Returns:*
bytes32 the proposalId

### *function* isRegistered
**constant**
**payable**
**view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **bool**

### *function* organizations
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **bool**

### *function* organizationsData
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **address**
2. **address**
3. **address**
4. **uint256**
5. **uint256**
6. **uint256**
7. **uint256**
8. **uint256**
9. **uint256**
10. **uint256**
11. **uint256**

### *function* owner
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* nativeToken
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* hashedParameters
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **bytes32**

### *function* getParametersHash
**constant**
**payable**
**pure**

Hash the parameters,and return the hash value
*Inputs:*
1. **_voteParams** *of type bytes32* - -  voting parameters
2. **_intVote** *of type address* - - voting machine contract.

*Returns:*
bytes32 -the parameters hash

### *function* fee
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **uint256**

### *function* execute
**nonpayable**

execution of proposals, can only be called by the voting machine in which the vote is held.
*Inputs:*
1. **_proposalId** *of type bytes32* - the ID of the voting in the voting machine
2. **_avatar** *of type address* - address of the controller
3. **_param** *of type int256* - a parameter of the voting result, 0 is no and 1 is yes.

*Returns:*
bool which represents a successful of the function

### *function* createVestedAgreement
**nonpayable**

Creating a vesting agreement.
*Inputs:*
1. **_token** *of type address* - the relevant token in the agreement.
2. **_beneficiary** *of type address* - the beneficiary of the agreement.
3. **_returnOnCancelAddress** *of type address* - where to send the tokens in case of stoping.
4. **_startingBlock** *of type uint256* - the block from which the agreement starts.
5. **_amountPerPeriod** *of type uint256* - amount of tokens per period.
6. **_periodLength** *of type uint256* - period length in blocks.
7. **_numOfAgreedPeriods** *of type uint256* - how many periods agreed on.
8. **_cliffInPeriods** *of type uint256* - the length of the cliff in periods.
9. **_signaturesReqToCancel** *of type uint256* - number of signatures required to cancel agreement.
10. **_signersArray** *of type address[]* - avatar array of adresses that can sign to cancel agreement.

*Returns:*
uint the agreement index.

### *function* collect
**nonpayable**

Function for a beneficiary to collect.
*Inputs:*
1. **_agreementId** *of type uint256* - the relevant agreement.

*Returns:*
*Nothing*

### *function* beneficiary
**constant**
**payable**
**view**

*Inputs:*
*Nothing*

*Returns:*
1. **address**

### *function* agreements
**constant**
**payable**
**view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **address**
2. **address**
3. **address**
4. **uint256**
5. **uint256**
6. **uint256**
7. **uint256**
8. **uint256**
9. **uint256**
10. **uint256**
11. **uint256**

