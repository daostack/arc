# *contract* VestingScheme ([source](https://github.com/daostack/daostack/tree/master/./contracts/universalSchemes/VestingScheme.sol))
*Code deposit cost: **less than 1408400 gas.***

*Execution cost: **less than 21840 gas.***

*Total deploy cost(deposit + execution): **less than 1430240 gas.***

> A schme for vesting.


## Reference
- [Constructors](#constructors)
    - [VestingScheme()](#constructor-vestingscheme)
- [Events](#events)
    - [SignToCancelAgreement](#event-signtocancelagreement)
    - [RevokeSignToCancelAgreement](#event-revokesigntocancelagreement)
    - [OwnershipTransferred](#event-ownershiptransferred)
    - [NewVestedAgreement](#event-newvestedagreement)
    - [LogRegisterOrg](#event-logregisterorg)
    - [LogNewProposal](#event-lognewproposal)
    - [LogExecutaion](#event-logexecutaion)
    - [LogCollect](#event-logcollect)
    - [LogAgreementProposal](#event-logagreementproposal)
    - [LogAgreementCancel](#event-logagreementcancel)
- [Fallback](#fallback)
- [Functions](#functions)
    - [revokeSignToCancelAgreement](#function-revokesigntocancelagreement)
    - [parameters](#function-parameters)
    - [transferOwnership](#function-transferownership)
    - [updateParameters](#function-updateparameters)
    - [signToCancelAgreement](#function-signtocancelagreement)
    - [proposeVestingAgreement](#function-proposevestingagreement)
    - [setParameters](#function-setparameters)
    - [owner](#function-owner)
    - [organizationsData](#function-organizationsdata)
    - [hashedParameters](#function-hashedparameters)
    - [getParametersHash](#function-getparametershash)
    - [execute](#function-execute)
    - [createVestedAgreement](#function-createvestedagreement)
    - [collect](#function-collect)
    - [agreements](#function-agreements)
### Constructors
#### *constructor* VestingScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*
*Nothing*


### Events
#### *event* SignToCancelAgreement
*Params:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*


#### *event* RevokeSignToCancelAgreement
*Params:*
1. **_agreementId** *of type uint256*
2. **_signer** *of type address*


#### *event* OwnershipTransferred
*Params:*
1. **previousOwner** *of type address*
2. **newOwner** *of type address*


#### *event* NewVestedAgreement
*Params:*
1. **_agreementId** *of type uint256*


#### *event* LogRegisterOrg
*Params:*
1. **_avatar** *of type address*


#### *event* LogNewProposal
*Params:*
1. **proposalId** *of type bytes32*


#### *event* LogExecutaion
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_result** *of type int256*


#### *event* LogCollect
*Params:*
1. **_agreementId** *of type uint256*


#### *event* LogAgreementProposal
*Params:*
1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*


#### *event* LogAgreementCancel
*Params:*
1. **_agreementId** *of type uint256*


### Fallback
*Nothing*
### Functions
#### *function* revokeSignToCancelAgreement
> Function to revoke vote for canceling agreement.

*Execution cost: **less than 43398 gas.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*
*Nothing*


#### *function* parameters

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*
1. **unnamed** *of type bytes32*

*Returns:*
1. **voteParams** *of type bytes32*
2. **intVote** *of type address*


#### *function* transferOwnership
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23071 gas.***

**nonpayable**

*Inputs:*
1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*
*Nothing*


#### *function* updateParameters

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*
1. **_hashedParameters** *of type bytes32*

*Returns:*
*Nothing*


#### *function* signToCancelAgreement
> Function to sign to cancel an agreement.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*
*Nothing*


#### *function* proposeVestingAgreement

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


#### *function* setParameters

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* owner

*Execution cost: **less than 787 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type address*


#### *function* organizationsData

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


#### *function* hashedParameters

*Execution cost: **less than 744 gas.***

**constant | view**

*Inputs:*
*Nothing*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* getParametersHash

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*
1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*
1. **unnamed** *of type bytes32*


#### *function* execute

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*
1. **unnamed** *of type bool*


#### *function* createVestedAgreement

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


#### *function* collect
> Function for a beneficiary to collect.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*
1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*
*Nothing*


#### *function* agreements

*Execution cost: **less than 3271 gas.***

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


