# UpgradeScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/UpgradeScheme.sol)
> A scheme to manage the upgrade of an organization.


**Execution cost**: less than 21109 gas

**Deployment cost**: less than 707200 gas

**Combined cost**: less than 728309 gas

## Constructor




## Events
### ChangeUpgradeSchemeProposal(address,bytes32,address,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_newUpgradeScheme** *of type `address`*
5. **_params** *of type `bytes32`*

--- 
### NewUpgradeProposal(address,bytes32,address,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_newController** *of type `address`*

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


## Methods
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


1. **output_0** *of type `bool`*

--- 
### hashedParameters()


**Execution cost**: less than 656 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### getParametersHash(bytes32,address)
>
> return a hash of the given parameters


**Execution cost**: less than 586 gas

**Attributes**: constant


Params:

1. **_voteParams** *of type `bytes32`*
2. **_intVote** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### organizationsProposals(address,bytes32)


**Execution cost**: less than 1348 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **upgradeContract** *of type `address`*
2. **params** *of type `bytes32`*
3. **proposalType** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 765 gas

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
### proposeChangeUpgradingScheme(address,address,bytes32)
>
> propose to replace this scheme by another upgrading scheme


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > avatar of the organization

2. **_scheme** *of type `address`*

    > address of the new upgrading scheme

3. **_params** *of type `bytes32`*

    > ???


Returns:

> an id which represents the proposal

1. **output_0** *of type `bytes32`*

--- 
### proposeUpgrade(address,address)
>
> propose an upgrade of the organization's controller


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > avatar of the organization

2. **_newController** *of type `address`*

    > address of the new controller that is being proposed


Returns:

> an id which represents the proposal

1. **output_0** *of type `bytes32`*

--- 
### setParameters(bytes32,address)
>
> hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 41096 gas


Params:

1. **_voteParams** *of type `bytes32`*
2. **_intVote** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 23005 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20594 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#upgradescheme)
