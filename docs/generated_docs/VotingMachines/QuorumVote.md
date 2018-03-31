# QuorumVote
[see the source](https://github.com/daostack/arc/tree/master/contracts/VotingMachines/QuorumVote.sol)


**Execution cost**: less than 1042 gas

**Deployment cost**: less than 1010800 gas

**Combined cost**: less than 1011842 gas


## Events
### CancelProposal(bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

--- 
### CancelVoting(bytes32,address)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_voter** *of type `address`*

--- 
### ExecuteProposal(bytes32,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_decision** *of type `uint256`*
3. **_totalReputation** *of type `uint256`*

--- 
### NewProposal(bytes32,uint256,address,bytes32)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_numOfChoices** *of type `uint256`*
3. **_proposer** *of type `address`*
4. **_paramsHash** *of type `bytes32`*

--- 
### RefreshReputation(bytes32,address,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_voter** *of type `address`*
3. **_reputation** *of type `uint256`*

--- 
### VoteProposal(bytes32,address,uint256,uint256,bool)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_voter** *of type `address`*
3. **_vote** *of type `uint256`*
4. **_reputation** *of type `uint256`*
5. **_isOwnerVote** *of type `bool`*


## Methods
### refreshReputation(bytes32,address[])
>
> refreshReputation refresh the reputation for a given voters list


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_voters** *of type `address[]`*

    > list to be refreshed


Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### parameters(bytes32)


**Execution cost**: less than 1169 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **reputationSystem** *of type `address`*
2. **precReq** *of type `uint256`*
3. **allowOwner** *of type `bool`*

--- 
### execute(bytes32)
>
> check if the proposal has been decided, and if so, execute the proposal


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the id of the proposal


Returns:


1. **output_0** *of type `bool`*

--- 
### isVotable(bytes32)
>
> isVotable check if the proposal is votable


**Execution cost**: less than 878 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### getNumberOfChoices(bytes32)
>
> getNumberOfChoices returns the number of choices possible in this proposal


**Execution cost**: less than 800 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal


Returns:

> uint that contains number of choices

1. **output_0** *of type `uint256`*

--- 
### cancelVote(bytes32)
>
> Cancel the vote of the msg.sender: subtract the reputation amount from the votes and delete the voter from the proposal struct


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal



--- 
### ownerVote(bytes32,uint256,address)
>
> voting function with owner functionality (can vote on behalf of someone else)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal

2. **_vote** *of type `uint256`*

    > a value between 0 to and the proposal number of choices.

3. **_voter** *of type `address`*

    > will be voted with that voter's address


Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### cancelProposal(bytes32)
>
> Cancel a proposal, only the owner can call this function and only if allowOwner flag is true.


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > the proposal ID


Returns:


1. **output_0** *of type `bool`*

--- 
### isAbstainAllow()
>
> isAbstainAllow returns if the voting machine allow abstain (0)


**Execution cost**: less than 418 gas

**Attributes**: constant



Returns:

> bool true or false

1. **output_0** *of type `bool`*

--- 
### getParametersHash(address,uint256,bool)
>
> hashParameters returns a hash of the given parameters


**Execution cost**: less than 603 gas

**Attributes**: constant


Params:

1. **_reputationSystem** *of type `address`*
2. **_precReq** *of type `uint256`*
3. **_allowOwner** *of type `bool`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### MAX_NUM_OF_CHOICES()


**Execution cost**: less than 456 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### proposals(bytes32)


**Execution cost**: less than 2232 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **owner** *of type `address`*
2. **avatar** *of type `address`*
3. **numOfChoices** *of type `uint256`*
4. **executable** *of type `address`*
5. **paramsHash** *of type `bytes32`*
6. **totalVotes** *of type `uint256`*
7. **open** *of type `bool`*

--- 
### proposalsCnt()


**Execution cost**: less than 524 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### propose(uint256,bytes32,address,address,address)
>
> register a new proposal with the given parameters. Every proposal has a unique ID which is being generated by calculating keccak256 of a incremented counter.


**Execution cost**: less than 150314 gas


Params:

1. **_numOfChoices** *of type `uint256`*

    > number of voting choices

2. **_paramsHash** *of type `bytes32`*

    > defined the parameters of the voting machine used for this proposal

3. **_avatar** *of type `address`*

    > an address to be sent as the payload to the _executable contract.

4. **_executable** *of type `address`*

    > This contract will be executed when vote is over.

5. **param_4** *of type `address`*

Returns:

> proposal's id.

1. **output_0** *of type `bytes32`*

--- 
### setParameters(address,uint256,bool)
>
> hash the parameters, save them if necessary, and return the hash value


**Execution cost**: less than 61917 gas


Params:

1. **_reputationSystem** *of type `address`*
2. **_precReq** *of type `uint256`*
3. **_allowOwner** *of type `bool`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### vote(bytes32,uint256)
>
> voting function


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*

    > id of the proposal

2. **_vote** *of type `uint256`*

    > a value between 0 to and the proposal number of choices.


Returns:

> bool true - the proposal has been executed             false - otherwise.

1. **output_0** *of type `bool`*

--- 
### voteInfo(bytes32,address)
>
> voteInfo returns the vote and the amount of reputation of the user committed to this proposal


**Execution cost**: less than 1230 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_voter** *of type `address`*

    > the address of the voter


Returns:

> uint vote - the voters vote       uint reputation - amount of reputation committed by _voter to _proposalId

1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint256`*

--- 
### voteStatus(bytes32,uint256)
>
> voteStatus returns the reputation voted for a proposal for a specific voting choice.


**Execution cost**: less than 925 gas

**Attributes**: constant


Params:

1. **_proposalId** *of type `bytes32`*

    > the ID of the proposal

2. **_choice** *of type `uint256`*

    > the index in the


Returns:

> voted reputation for the given choice

1. **output_0** *of type `uint256`*

--- 
### voteWithSpecifiedAmounts(bytes32,uint256,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **_proposalId** *of type `bytes32`*
2. **_vote** *of type `uint256`*
3. **_rep** *of type `uint256`*
4. **param_3** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

[Back to the top ↑](#quorumvote)
