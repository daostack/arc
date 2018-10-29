# VestingScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/VestingScheme.sol)
> A scheme for vesting.


**Execution cost**: less than 22449 gas

**Deployment cost**: less than 2030000 gas

**Combined cost**: less than 2052449 gas

## Constructor




## Events
### AgreementCancel(uint256)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

--- 
### AgreementProposal(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

--- 
### Collect(uint256)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

--- 
### NewVestedAgreement(uint256)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

--- 
### ProposalDeleted(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

--- 
### ProposalExecuted(bytes32,int256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_param** *of type `int256`*

--- 
### ProposedVestedAgreement(uint256,bytes32)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*
2. **_proposalId** *of type `bytes32`*

--- 
### RevokeSignToCancelAgreement(uint256,address)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*
2. **_signer** *of type `address`*

--- 
### SignToCancelAgreement(uint256,address)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*
2. **_signer** *of type `address`*


## Methods
### stakingTokenTransfer(address,address,uint256,bytes32)


**Execution cost**: No bound available


Params:

1. **_stakingToken** *of type `address`*
2. **_beneficiary** *of type `address`*
3. **_amount** *of type `uint256`*
4. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### agreementsCounter()


**Execution cost**: less than 821 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### agreements(uint256)


**Execution cost**: less than 3232 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **token** *of type `address`*
2. **beneficiary** *of type `address`*
3. **returnOnCancelAddress** *of type `address`*
4. **startingBlock** *of type `uint256`*
5. **amountPerPeriod** *of type `uint256`*
6. **periodLength** *of type `uint256`*
7. **numOfAgreedPeriods** *of type `uint256`*
8. **cliffInPeriods** *of type `uint256`*
9. **signaturesReqToCancel** *of type `uint256`*
10. **collectedPeriods** *of type `uint256`*
11. **signaturesReceivedCounter** *of type `uint256`*

--- 
### collect(uint256)
>
> Function for a beneficiary to collect.


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### init(address,address,bytes32)


**Execution cost**: less than 61244 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*


--- 
### executeProposal(bytes32,int256)
>
> execution of proposals, can only be called by the voting machine in which the vote is held.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_param** *of type `int256`*

    > a parameter of the voting result, 1 yes and 2 is no.


Returns:

> bool which represents a successful of the function

1. **output_0** *of type `bool`*

--- 
### burnReputation(uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getTotalReputationSupply(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### createVestedAgreement(address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,address[])
>
> Creating a vesting agreement.


**Execution cost**: No bound available


Params:

1. **_token** *of type `address`*

    > the relevant token in the agreement.

2. **_beneficiary** *of type `address`*

    > the beneficiary of the agreement.

3. **_returnOnCancelAddress** *of type `address`*

    > where to send the tokens in case of stoping.

4. **_startingBlock** *of type `uint256`*

    > the block from which the agreement starts.

5. **_amountPerPeriod** *of type `uint256`*

    > amount of tokens per period.

6. **_periodLength** *of type `uint256`*

    > period length in blocks.

7. **_numOfAgreedPeriods** *of type `uint256`*

    > how many periods agreed on.

8. **_cliffInPeriods** *of type `uint256`*

    > the length of the cliff in periods.

9. **_signaturesReqToCancel** *of type `uint256`*

    > number of signatures required to cancel agreement.

10. **_signersArray** *of type `address[]`*

    > avatar array of addresses that can sign to cancel agreement.


Returns:

> uint the agreement index.

1. **output_0** *of type `uint256`*

--- 
### avatar()


**Execution cost**: less than 622 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### intVote()


**Execution cost**: less than 732 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### mintReputation(uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_amount** *of type `uint256`*
2. **_beneficiary** *of type `address`*
3. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### organizationProposals(bytes32)


**Execution cost**: less than 3339 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **token** *of type `address`*
2. **beneficiary** *of type `address`*
3. **returnOnCancelAddress** *of type `address`*
4. **startingBlock** *of type `uint256`*
5. **amountPerPeriod** *of type `uint256`*
6. **periodLength** *of type `uint256`*
7. **numOfAgreedPeriods** *of type `uint256`*
8. **cliffInPeriods** *of type `uint256`*
9. **signaturesReqToCancel** *of type `uint256`*
10. **collectedPeriods** *of type `uint256`*
11. **signaturesReceivedCounter** *of type `uint256`*

--- 
### proposeVestingAgreement(address,address,uint256,uint256,uint256,uint256,uint256,uint256,address[])
>
> Proposing a vesting agreement in an organization.


**Execution cost**: No bound available


Params:

1. **_beneficiary** *of type `address`*

    > the beneficiary of the agreement.

2. **_returnOnCancelAddress** *of type `address`*

    > where to send the tokens in case of stoping.

3. **_startingBlock** *of type `uint256`*

    > the block from which the agreement starts.

4. **_amountPerPeriod** *of type `uint256`*

    > amount of tokens per period.

5. **_periodLength** *of type `uint256`*

    > period length in blocks.

6. **_numOfAgreedPeriods** *of type `uint256`*

    > how many periods agreed on.

7. **_cliffInPeriods** *of type `uint256`*

    > the length of the cliff in periods.

8. **_signaturesReqToCancel** *of type `uint256`*

    > number of signatures required to cancel agreement.

9. **_signersArray** *of type `address[]`*

    > avatar array of addresses that can sign to cancel agreement.


Returns:

> bytes32 the proposalId

1. **output_0** *of type `bytes32`*

--- 
### reputationOf(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_owner** *of type `address`*
2. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### revokeSignToCancelAgreement(uint256)
>
> Function to revoke vote for canceling agreement.


**Execution cost**: less than 43047 gas


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### signToCancelAgreement(uint256)
>
> Function to sign to cancel an agreement.


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### voteParams()


**Execution cost**: less than 755 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#vestingscheme)
