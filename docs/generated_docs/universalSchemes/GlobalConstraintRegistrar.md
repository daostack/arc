# GlobalConstraintRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/GlobalConstraintRegistrar.sol)
> A scheme to manage global constraint for organizations


**Execution cost**: less than 21109 gas

**Deployment cost**: less than 705400 gas

**Combined cost**: less than 726509 gas

## Constructor




## Events
### NewGlobalConstraintsProposal(address,bytes32,address,address,bytes32,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_gc** *of type `address`*
5. **_params** *of type `bytes32`*
6. **_voteToRemoveParams** *of type `bytes32`*

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
### RemoveGlobalConstraintsProposal(address,bytes32,address,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_gc** *of type `address`*


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

> bool which represents a successful of the function.

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
> Hash the parameters and return the hash value


**Execution cost**: less than 586 gas

**Attributes**: constant


Params:

1. **_voteRegisterParams** *of type `bytes32`*

    > -  voting parameters

2. **_intVote** *of type `address`*

    > - voting machine contract.


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### organizationsData(address)


**Execution cost**: less than 1013 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **voteRegisterParams** *of type `bytes32`*
2. **intVote** *of type `address`*

--- 
### owner()


**Execution cost**: less than 743 gas

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


1. **voteRegisterParams** *of type `bytes32`*
2. **intVote** *of type `address`*

--- 
### proposeGlobalConstraint(address,address,bytes32,bytes32)
>
> propose to add a new global constraint:


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > the avatar of the organization that the constraint is proposed for

2. **_gc** *of type `address`*

    > the address of the global constraint that is being proposed

3. **_params** *of type `bytes32`*

    > the parameters for the global constraint

4. **_voteToRemoveParams** *of type `bytes32`*

    > the conditions (on the voting machine) for removing this global constraint


Returns:

> bytes32 -the proposal id

1. **output_0** *of type `bytes32`*

--- 
### proposeToRemoveGC(address,address)
>
> propose to remove a global constraint:


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > the avatar of the organization that the constraint is proposed for

2. **_gc** *of type `address`*

    > the address of the global constraint that is being proposed


Returns:

> bytes32 -the proposal id

1. **output_0** *of type `bytes32`*

--- 
### setParameters(bytes32,address)
>
> Hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 41096 gas


Params:

1. **_voteRegisterParams** *of type `bytes32`*

    > -  voting parameters for register global constraint

2. **_intVote** *of type `address`*

    > - voting machine contract.


Returns:

> bytes32 -the parameters hash

1. **output_0** *of type `bytes32`*

--- 
### transferOwnership(address)
>
> Allows the current owner to transfer control of the contract to a newOwner.


**Execution cost**: less than 22983 gas


Params:

1. **newOwner** *of type `address`*

    > The address to transfer ownership to.



--- 
### updateParameters(bytes32)


**Execution cost**: less than 20594 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#globalconstraintregistrar)
