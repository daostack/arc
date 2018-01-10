# *contract* VestingScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/VestingScheme.sol))
*Code deposit cost: **less than 1537200 gas.***

*Execution cost: **No bound available.***

*Total deploy cost(deposit + execution): **less than 1537200 gas.***

> A schme for vesting.


## Reference
- [Constructors](#constructors)
    - [VestingScheme(address, uint256, address)](#constructor-vestingschemeaddress-uint256-address)
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
- [Fallback](#fallback)
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
### Constructors
### *constructor* VestingScheme(address, uint256, address)

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
1. **_nativeToken** *of type address*
2. **_fee** *of type uint256*
3. **_beneficiary** *of type address*


### Events
### *event* RevokeSignToCancelAgreement
*Params:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*


### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


### *event* SignToCancelAgreement
*Params:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*


### *event* OrganizationRegistered
*Params:*
1. **_avatar** *of type address*


### *event* NewVestedAgreement
*Params:*
1. **_agreementId** *of type uint256*


### *event* LogRegisterOrg
*Params:*
1. **_avatar** *of type address*


### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


### *event* LogExecutaion
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_result** *of type int256*


### *event* LogCollect
*Params:*
1. **_agreementId** *of type uint256*


### *event* LogAgreementProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


### *event* LogAgreementCancel
*Params:*
1. **_agreementId** *of type uint256*


### Fallback
*Nothing*
### Functions
### *function* signToCancelAgreement
> Function to sign to cancel an agreement.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*
*Nothing*


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

*Execution cost: **less than 23272 gas.***

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


### *function* revokeSignToCancelAgreement
> Function to revoke vote for canceling agreement.

*Execution cost: **less than 43442 gas.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

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


### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* proposeVestingAgreement

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_beneficiary** *of type address*
2. **_returnOnCancelAddress** *of type address*
3. **_startingBlock** *of type uint256*
4. **_amountPerPeriod** *of type uint256*
5. **_periodLength** *of type uint256*
6. **_numOfAgreedPeriods** *of type uint256*
7. **_cliffInPeriods** *of type uint256*
8. **_signaturesReqToCancel** *of type uint256*
9. **_signersArray** *of type address[]*
10. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


### *function* isRegistered

*Execution cost: **less than 978 gas.***

**constant | view**

*Inputs:*
1. **_avatar** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* organizations

*Execution cost: **less than 727 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*

*Returns:*
1. **unnamed** *of type bool*


### *function* organizationsData

*Execution cost: **No bound available.***

**constant | view**

*Inputs:*
1. **unnamed** *of type address*
2. **unnamed** *of type bytes32*

*Returns:*
1. **token** *of type address*
2. **beneficiary** *of type address*
3. **returnOnCancelAddress** *of type address*
4. **startingBlock** *of type uint256*
5. **amountPerPeriod** *of type uint256*
6. **periodLength** *of type uint256*
7. **numOfAgreedPeriods** *of type uint256*
8. **cliffInPeriods** *of type uint256*
9. **signaturesReqToCancel** *of type uint256*
10. **collectedPeriods** *of type uint256*
11. **signaturesReceivedCounter** *of type uint256*


### *function* owner

*Execution cost: **less than 831 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* nativeToken

*Execution cost: **less than 963 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* hashedParameters

*Execution cost: **less than 876 gas.***

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

*Execution cost: **less than 788 gas.***

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


### *function* createVestedAgreement

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_token** *of type address*
2. **_beneficiary** *of type address*
3. **_returnOnCancelAddress** *of type address*
4. **_startingBlock** *of type uint256*
5. **_amountPerPeriod** *of type uint256*
6. **_periodLength** *of type uint256*
7. **_numOfAgreedPeriods** *of type uint256*
8. **_cliffInPeriods** *of type uint256*
9. **_signaturesReqToCancel** *of type uint256*
10. **_signersArray** *of type address[]*

*Returns:*
1. **unnamed** *of type uint256*


### *function* collect
> Function for a beneficiary to collect.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*
*Nothing*


### *function* beneficiary

*Execution cost: **less than 677 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


### *function* agreements

*Execution cost: **less than 3340 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type uint256*

*Returns:*
1. **token** *of type address*
2. **beneficiary** *of type address*
3. **returnOnCancelAddress** *of type address*
4. **startingBlock** *of type uint256*
5. **amountPerPeriod** *of type uint256*
6. **periodLength** *of type uint256*
7. **numOfAgreedPeriods** *of type uint256*
8. **cliffInPeriods** *of type uint256*
9. **signaturesReqToCancel** *of type uint256*
10. **collectedPeriods** *of type uint256*
11. **signaturesReceivedCounter** *of type uint256*


