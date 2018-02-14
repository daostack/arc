# SchemeRegistrar
[see the source](https://github.com/daostack/arc/tree/master/contracts/universalSchemes/SchemeRegistrar.sol)
> A registrar for Schemes for organizations


**Execution cost**: less than 21141 gas

**Deployment cost**: less than 741400 gas

**Combined cost**: less than 762541 gas

## Constructor




## Events
### NewProposal(bytes32)


**Execution cost**: No bound available


Params:

1. **proposalId** *of type `bytes32`*

--- 
### NewSchemeProposal(address,bytes32,address,address,bytes32,bool)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_scheme** *of type `address`*
5. **_parametersHash** *of type `bytes32`*
6. **_isRegistering** *of type `bool`*

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
### ProposalExecuted(address,bytes32)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*

--- 
### RemoveSchemeProposal(address,bytes32,address,address)


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*
2. **_proposalId** *of type `bytes32`*
3. **_intVoteInterface** *of type `address`*
4. **_scheme** *of type `address`*


## Methods
### proposeToRemoveScheme(address,address)
>
> propose to remove a scheme for a controller


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > the address of the controller from which we want to remove a scheme

2. **_scheme** *of type `address`*

    > the address of the scheme we want to remove    * NB: not only registers the proposal, but also votes for it


Returns:


1. **output_0** *of type `bytes32`*

--- 
### hashedParameters()


**Execution cost**: less than 656 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### getParametersHash(bytes32,bytes32,address)


**Execution cost**: less than 711 gas

**Attributes**: constant


Params:

1. **_voteRegisterParams** *of type `bytes32`*
2. **_voteRemoveParams** *of type `bytes32`*
3. **_intVote** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### execute(bytes32,address,int256)
>
> execute a  proposal This method can only be called by the voting machine in which the vote is held.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal in the voting machine

2. **_avatar** *of type `address`*

    > address of the controller

3. **_param** *of type `int256`*

    > identifies the action to be taken


Returns:


1. **output_0** *of type `bool`*

--- 
### organizationsProposals(address,bytes32)


**Execution cost**: less than 1571 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **scheme** *of type `address`*
2. **parametersHash** *of type `bytes32`*
3. **proposalType** *of type `uint256`*
4. **isRegistering** *of type `bool`*

--- 
### owner()


**Execution cost**: less than 765 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### parameters(bytes32)


**Execution cost**: less than 1148 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **voteRegisterParams** *of type `bytes32`*
2. **voteRemoveParams** *of type `bytes32`*
3. **intVote** *of type `address`*

--- 
### proposeScheme(address,address,bytes32,bool)
>
> create a proposal to register a schemeNB: not only proposes the vote, but also votes for it


**Execution cost**: No bound available


Params:

1. **_avatar** *of type `address`*

    > the address of the organization the scheme will be registered for

2. **_scheme** *of type `address`*

    > the address of the scheme to be registered

3. **_parametersHash** *of type `bytes32`*

    > a hash of the configuration of the _scheme

4. **_isRegistering** *of type `bool`*

    > a boolean represent if the scheme is a registering scheme     that can register other schemes


Returns:

> a proposal Id

1. **output_0** *of type `bytes32`*

--- 
### setParameters(bytes32,bytes32,address)
>
> hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 61088 gas


Params:

1. **_voteRegisterParams** *of type `bytes32`*
2. **_voteRemoveParams** *of type `bytes32`*
3. **_intVote** *of type `address`*

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


**Execution cost**: less than 20572 gas


Params:

1. **_hashedParameters** *of type `bytes32`*


[Back to the top ↑](#schemeregistrar)
