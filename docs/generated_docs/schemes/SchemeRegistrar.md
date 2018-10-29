# SchemeRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/SchemeRegistrar.sol)
> A registrar for Schemes for an organization


**Execution cost**: less than 21440 gas

**Deployment cost**: less than 1102600 gas

**Combined cost**: less than 1124040 gas

## Constructor




## Events
### NewSchemeProposal(bytes32,address,bytes4)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_scheme** *of type `address`*
3. **_permissions** *of type `bytes4`*

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
### RemoveSchemeProposal(bytes32,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_scheme** *of type `address`*


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


**Execution cost**: less than 622 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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
### proposeToRemoveScheme(address)
>
> propose to remove a scheme for a controller


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme we want to remove    * NB: not only registers the proposal, but also votes for it


Returns:


1. **output_0** *of type `bytes32`*

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


1. **output_0** *of type `bool`*

--- 
### intVote()


**Execution cost**: less than 732 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### init(address,address,bytes32,bytes32)


**Execution cost**: less than 81306 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteRegisterParams** *of type `bytes32`*
4. **_voteRemoveParams** *of type `bytes32`*


--- 
### proposeScheme(address,bytes4)
>
> create a proposal to register a schemeNB: not only proposes the vote, but also votes for it


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > the address of the scheme to be registered

2. **_permissions** *of type `bytes4`*

    > the permission of the scheme to be registered


Returns:

> a proposal Id

1. **output_0** *of type `bytes32`*

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


**Execution cost**: less than 1544 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **scheme** *of type `address`*
2. **proposalType** *of type `uint256`*
3. **permissions** *of type `bytes4`*

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
### voteRegisterParams()


**Execution cost**: less than 447 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### voteRemoveParams()


**Execution cost**: less than 667 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#schemeregistrar)
