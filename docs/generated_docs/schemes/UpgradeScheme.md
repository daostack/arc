# UpgradeScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/schemes/UpgradeScheme.sol)
> A scheme to manage the upgrade of an organization.


**Execution cost**: less than 21514 gas

**Deployment cost**: less than 1176000 gas

**Combined cost**: less than 1197514 gas

## Constructor




## Events
### ChangeUpgradeSchemeProposal(bytes32,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_newUpgradeScheme** *of type `address`*
3. **_params** *of type `bytes32`*

--- 
### NewUpgradeProposal(bytes32,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_newController** *of type `address`*

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


## Methods
### proposeChangeUpgradingScheme(address,bytes32)
>
> propose to replace this scheme by another upgrading scheme


**Execution cost**: No bound available


Params:

1. **_scheme** *of type `address`*

    > address of the new upgrading scheme

2. **_params** *of type `bytes32`*

    > ???


Returns:

> an id which represents the proposal

1. **output_0** *of type `bytes32`*

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
### getTotalReputationSupply(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### init(address,address,bytes32)


**Execution cost**: less than 61244 gas


Params:

1. **_avatar** *of type `address`*
2. **_intVote** *of type `address`*
3. **_voteParams** *of type `bytes32`*


--- 
### intVote()


**Execution cost**: less than 688 gas

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


**Execution cost**: less than 1373 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **upgradeContract** *of type `address`*
2. **params** *of type `bytes32`*
3. **proposalType** *of type `uint256`*

--- 
### proposeUpgrade(address)
>
> propose an upgrade of the organization's controller


**Execution cost**: No bound available


Params:

1. **_newController** *of type `address`*

    > address of the new controller that is being proposed


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


**Execution cost**: less than 689 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

[Back to the top ↑](#upgradescheme)
