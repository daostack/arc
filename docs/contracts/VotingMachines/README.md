# VotingMachine

***VotingMachine*** is a pluggable component, provided by DAOstack, which can be used by a DAO's schemes to manage a voting
process on a certain proposal.

The VotingMachine maintains the voting process and the proposals to vote on, collect votes, and determines the winning vote according to the DAO's pre-defined configuration.

In some cases, such as GenesisProtocol, it also collect stakes, promotes proposals, and maintains a reputation flow for participants according to the DAO's pre-defined configuration.  

Each VotingMachine use its own [decision method](#basic-decisions-methods-used-by-votingmachines) and has its own voting choices range.

## voting machines

### AbsoluteVote

Use absolute decision method.

Allow voting choices range 0-10.

Vote 0 for abstain.

### QuorumVote

Use quorum decision method.

Allow voting choices range 0-10.

Vote 0 for abstain.

### GenesisProtocol

Use absolute and relative decision method.

Currently it allows only YES/NO voting choices (2 choices).

Abstaining is not allowed.

This voting machine is also a UniversalScheme. 

## basic decisions methods used by VotingMachines
### absolute

A decision is made if at least a certain percentage (P) from the total DAO's reputation voted
on a certain voting choice. Normally P is 50% though it can be set to any value.

The "winning" choice is the one which first crosses that bar.

AbsoluteVote uses this method.


### relative

A decision is made on a timeout (T) according to the higher relative vote among all votes.

The "winning" choice is the one with the higher relative votes (reputation).


### quorum

A decision is made if at least a certain percentage (P) from the total DAO's reputation votes on a certain proposal.

The "winning" choice is the one with the maximum votes (reputation).

###

| VotingMachine | absolute | relative | quorum
| --- | --- | --- | --- |
| AbsoluteVote | yes | no | no |
| QuorumVote | no | no | yes |
| GenesisProtocol | yes | yes | no |
