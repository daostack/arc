# IntVoteInterface
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/IntVoteInterface.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available




## Methods
### vote(bytes32,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_vote** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### execute(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### cancelProposal(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### cancelVote(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*


--- 
### getNumberOfChoices(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### isAbstainAllow()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### isVotable(bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### ownerVote(bytes32,uint256,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_vote** *of type `uint256`*
3. **_voter** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### propose(uint256,bytes32,address,address,address)


**Execution cost**: No bound available


Params:

1. **_numOfChoices** *of type `uint256`*
2. **_proposalParameters** *of type `bytes32`*
3. **_avatar** *of type `address`*
4. **_executable** *of type `address`*
5. **_proposer** *of type `address`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### voteStatus(bytes32,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*
2. **_choice** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### voteWithSpecifiedAmounts(bytes32,uint256,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_vote** *of type `uint256`*
3. **_rep** *of type `uint256`*
4. **_token** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

[Back to the top ↑](#intvoteinterface)
