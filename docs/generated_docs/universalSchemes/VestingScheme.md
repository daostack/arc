# VestingScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/VestingScheme.sol)
> A scheme for vesting.


**Execution cost**: less than 21833 gas

**Deployment cost**: less than 1404800 gas

**Combined cost**: less than 1426633 gas

## Constructor




## Events
### AgreementCancel(uint256)


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

--- 
### AgreementProposal(address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*

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
### OwnershipTransferred(address,address)


**Execution cost**: No bound available


Params:

1. **previousOwner** *of type `address`*
2. **newOwner** *of type `address`*

--- 
### ProposalDeleted(address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*

--- 
### ProposalExecuted(address,bytes32,int256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_param** *of type `int256`*

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
### signToCancelAgreement(uint256)
>
> Function to sign to cancel an agreement.


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### agreementsCounter()


**Execution cost**: less than 766 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### agreements(uint256)


**Execution cost**: less than 3271 gas

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
### owner()


**Execution cost**: less than 787 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### parameters(bytes32)


**Execution cost**: less than 894 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **voteParams** *of type `bytes32`*
2. **intVote** *of type `address`*

--- 
### hashedParameters()


**Execution cost**: less than 744 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

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
### collect(uint256)
>
> Function for a beneficiary to collect.


**Execution cost**: No bound available


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### organizationsData(address,bytes32)


**Execution cost**: less than 3220 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

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
### execute(bytes32,address,int256)
>
> execution of proposals, can only be called by the voting machine in which the vote is held.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_avatar** *of type `address`*

    > address of the controller

3. **_param** *of type `int256`*

    > a parameter of the voting result, 0 is no and 1 is yes.


Returns:

> bool which represents a successful of the function

1. **output_0** *of type `bool`*

--- 
### getParametersHash(bytes32,address)
>
> Hash the parameters, and return the hash value


**Execution cost**: less than 564 gas

**Attributes**: constant


Params:

1. **_voteParams** *of type `bytes32`*

    > -  voting parameters

2. **_intVote** *of type `address`*

    > - voting machine contract.


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### proposeVestingAgreement(address,address,uint256,uint256,uint256,uint256,uint256,uint256,address[],address)
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

10. **_avatar** *of type `address`*

    > avatar of the organization.


Returns:

> bytes32 the proposalId

1. **output_0** *of type `bytes32`*

--- 
### revokeSignToCancelAgreement(uint256)
>
> Function to revoke vote for canceling agreement.


**Execution cost**: less than 43398 gas


Params:

1. **_agreementId** *of type `uint256`*

    > the relevant agreement.



--- 
### setParameters(bytes32,address)
>
> Hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 41091 gas


Params:

1. **_voteParams** *of type `bytes32`*

    > -  voting parameters

2. **_intVote** *of type `address`*

    > - voting machine contract.


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23071 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20572 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#vestingscheme)
