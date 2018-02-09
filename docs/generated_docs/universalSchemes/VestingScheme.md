# VestingScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/VestingScheme.sol)

*Code deposit cost: **less than 1413000 gas.***

*Execution cost: **less than 21840 gas.***

*Total deploy cost(deposit + execution): **less than 1434840 gas.***

> A scheme for vesting.

## Constructors
### VestingScheme()

*Execution cost: **No bound available.***

**nonpayable**

*Params:*

*Nothing*


## Events
### SignToCancelAgreement(uint256, address)
*Params:*

1. **_agreementId** *of type uint256*
2. **_signer** *of type address*

---
### RevokeSignToCancelAgreement(uint256, address)
*Params:*

1. **_agreementId** *of type uint256*
2. **_signer** *of type address*

---
### ProposalExecuted(address)
*Params:*

1. **_avatar** *of type address*

---
### OwnershipTransferred(address, address)
*Params:*

1. **previousOwner** *of type address*
2. **newOwner** *of type address*

---
### NewVestedAgreement(uint256)
*Params:*

1. **_agreementId** *of type uint256*

---
### NewProposal(bytes32)
*Params:*

1. **proposalId** *of type bytes32*

---
### Execution(address, bytes32, int256)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*
3. **_result** *of type int256*

---
### Collect(uint256)
*Params:*

1. **_agreementId** *of type uint256*

---
### AgreementProposal(address, bytes32)
*Params:*

1. **_avatar** *of type address*
2. **_proposalId** *of type bytes32*

---
### AgreementCancel(uint256)
*Params:*

1. **_agreementId** *of type uint256*


## Fallback
*Nothing*
## Functions
### revokeSignToCancelAgreement(uint256)
> Function to revoke vote for canceling agreement.

*Execution cost: **less than 43398 gas.***

**nonpayable**

*Inputs:*

1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*

*Nothing*

---
### parameters(bytes32)

*Execution cost: **less than 894 gas.***

**constant | view**

*Inputs:*

1. **unnamed** *of type bytes32*

*Returns:*

1. **voteParams** *of type bytes32*
2. **intVote** *of type address*

---
### transferOwnership(address)
> Allows the current owner to transfer control of the contract to a newOwner.

*Execution cost: **less than 23071 gas.***

**nonpayable**

*Inputs:*

1. **newOwner** *of type address- The address to transfer ownership to.*

*Returns:*

*Nothing*

---
### updateParameters(bytes32)

*Execution cost: **less than 20572 gas.***

**nonpayable**

*Inputs:*

1. **_hashedParameters** *of type bytes32*

*Returns:*

*Nothing*

---
### signToCancelAgreement(uint256)
> Function to sign to cancel an agreement.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*

*Nothing*

---
### proposeVestingAgreement(address, address, uint256, uint256, uint256, uint256, uint256, uint256, address[], address)

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

---
### setParameters(bytes32, address)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### owner()

*Execution cost: **less than 787 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type address*

---
### organizationsData(address, bytes32)

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

---
### hashedParameters()

*Execution cost: **less than 744 gas.***

**constant | view**

*Inputs:*

*Nothing*

*Returns:*

1. **unnamed** *of type bytes32*

---
### getParametersHash(bytes32, address)

*Execution cost: **No bound available.***

**constant | pure**

*Inputs:*

1. **_voteParams** *of type bytes32*
2. **_intVote** *of type address*

*Returns:*

1. **unnamed** *of type bytes32*

---
### execute(bytes32, address, int256)

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_proposalId** *of type bytes32*
2. **_avatar** *of type address*
3. **_param** *of type int256*

*Returns:*

1. **unnamed** *of type bool*

---
### createVestedAgreement(address, address, address, uint256, uint256, uint256, uint256, uint256, uint256, address[])

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

---
### collect(uint256)
> Function for a beneficiary to collect.

*Execution cost: **No bound available.***

**nonpayable**

*Inputs:*

1. **_agreementId** *of type uint256- the relevant agreement.*

*Returns:*

*Nothing*

---
### agreements(uint256)

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


