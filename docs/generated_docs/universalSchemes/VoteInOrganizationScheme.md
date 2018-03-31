# VoteInOrganizationScheme
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/VoteInOrganizationScheme.sol)
> VoteInOrganizationScheme.


**Execution cost**: less than 21051 gas

**Deployment cost**: less than 650400 gas

**Combined cost**: less than 671451 gas

## Constructor




## Events
### NewVoteProposal(address,bytes32,address,address,bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_originalIntVote** *of type `address`*
5. **_originalProposalId** *of type `bytes32`*
6. **_originalNumOfChoices** *of type `uint256`*

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
### VoteOnBehalf(bytes32[])


**Execution cost**: No bound available


Params:

1. **_params** *of type `bytes32[]`*


## Methods
### proposeVote(address,address,bytes32)
>
> propose to vote in other organization     The function trigger NewVoteProposal event


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > avatar of the organization

2. **_originalIntVote** *of type `address`*

    > the other organization voting machine

3. **_originalProposalId** *of type `bytes32`*

    > the other organization proposal id


Returns:

> an id which represents the proposal

1. **output_0** *of type `bytes32`*

--- 
### hashedParameters()


**Execution cost**: less than 656 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

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
### action(bytes32[])
>
> do the actual voting in the other organization in behalf of the organization's avatar.


**Execution cost**: No bound available


Params:

1. **_params** *of type `bytes32[]`*

    > array represent the voting .       _params[0] - the address of the voting machine.       _params[1] - the proposalId.       _params[2] - the voting machine params.


Returns:

> bool which indicate success.

1. **output_0** *of type `bool`*

--- 
### execute(bytes32,address,int256)
>
> execution of proposals, can only be called by the voting machine in which the vote is held.     This function will trigger ProposalDeleted and ProposalExecuted events


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the voting in the voting machine

2. **_avatar** *of type `address`*

    > address of the organization's avatar

3. **_param** *of type `int256`*

    > a parameter of the voting result 0 to numOfChoices .


Returns:

> bool which indicate success.

1. **output_0** *of type `bool`*

--- 
### organizationsData(address,bytes32)


**Execution cost**: less than 1326 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **originalIntVote** *of type `address`*
2. **originalProposalId** *of type `bytes32`*
3. **originalNumOfChoices** *of type `uint256`*

--- 
### owner()


**Execution cost**: less than 765 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### parameters(bytes32)


**Execution cost**: less than 906 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **intVote** *of type `address`*
2. **voteParams** *of type `bytes32`*

--- 
### setParameters(bytes32,address)
>
> Hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 41099 gas


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


**Execution cost**: less than 23005 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20572 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#voteinorganizationscheme)
