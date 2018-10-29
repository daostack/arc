# ConstraintRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/ConstraintRegistrar.sol)
> A scheme to manage constraint for organizations


**Execution cost**: less than 21467 gas

**Deployment cost**: less than 1126800 gas

**Combined cost**: less than 1148267 gas

## Constructor




## Events
### NewConstraintsProposal(bytes32,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_constraint** *of type `address`*
3. **_voteToRemoveParams** *of type `bytes32`*

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
### RemoveConstraintsProposal(bytes32,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_constraint** *of type `address`*


## Methods
### voteToRemoveParams(address)


**Execution cost**: less than 748 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### init(address,address,bytes32)


**Execution cost**: less than 61244 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteRegisterParams** *of type `bytes32`*


--- 
### avatar()


**Execution cost**: less than 644 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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

> bool which represents a successful of the function.

1. **output_0** *of type `bool`*

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


**Execution cost**: less than 1395 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **constraint** *of type `address`*
2. **proposalType** *of type `uint256`*
3. **voteToRemoveParams** *of type `bytes32`*

--- 
### proposeConstraint(address,bytes32)
>
> propose to add a new constraint:


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

    > the address of the constraint that is being proposed

2. **_voteToRemoveParams** *of type `bytes32`*

    > the conditions (on the voting machine) for removing this constraint


Returns:

> bytes32 - the proposal id

1. **output_0** *of type `bytes32`*

--- 
### proposeToRemoveConstraint(address)
>
> propose to remove a constraint:


**Execution cost**: No bound available


Params:

1. **_constraint** *of type `address`*

    > the address of the constraint that is being proposed


Returns:

> bytes32 -the proposal id

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
### voteRegisterParams()


**Execution cost**: less than 469 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#constraintregistrar)
