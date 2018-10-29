# VoteInOrganizationScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/VoteInOrganizationScheme.sol)
> VoteInOrganizationScheme.


**Execution cost**: less than 21307 gas

**Deployment cost**: less than 977600 gas

**Combined cost**: less than 998907 gas

## Constructor




## Events
### NewVoteProposal(bytes32,address,address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_intVoteInterface** *of type `address`*
3. **_originalIntVote** *of type `address`*
4. **_originalProposalId** *of type `bytes32`*
5. **_originalNumOfChoices** *of type `uint256`*

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
### VoteOnBehalf(bytes32[])


**Execution cost**: No bound available


Params:

1. **_params** *of type `bytes32[]`*


## Methods
### getTotalReputationSupply(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

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
### avatar()


**Execution cost**: less than 644 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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
### init(address,address,bytes32)


**Execution cost**: less than 61266 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*


--- 
### intVote()


**Execution cost**: less than 710 gas

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


**Execution cost**: less than 1351 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **originalIntVote** *of type `address`*
2. **originalProposalId** *of type `bytes32`*
3. **originalNumOfChoices** *of type `uint256`*

--- 
### proposeVote(address,bytes32)
>
> propose to vote in other organization     The function trigger NewVoteProposal event


**Execution cost**: No bound available


Params:

1. **_originalIntVote** *of type `address`*

    > the other organization voting machine

2. **_originalProposalId** *of type `bytes32`*

    > the other organization proposal id


Returns:

> an id which represents the proposal

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
### voteParams()


**Execution cost**: less than 667 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#voteinorganizationscheme)
