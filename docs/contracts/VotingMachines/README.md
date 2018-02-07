# VotingMachine

***VotingMachine*** is a pluggable component, provided by DAOstack, which can be use by a DAO's schemes to manage a voting
process on a certain proposal.

The VotingMachine maintains the voting process ,the proposals to vote on ,collect votes and determines the winning vote according to pre define DAO's configuration.

In some cases ,such as GenesisProtocol, it also collect stakes ,promote proposals and maintains a reputation flow for participants according to pre define DAO's configuration.  

Each VotingMachine use its own decision taking method.

## basic decisions methods used by VotingMachines

### absolute

A decision is taken if at least a certain percentage P from the total DAO's reputation voted
on a certain voting choice. Normally P is 50% though it can be set to any value.

The "winning" choice is the one which first cross that bar.

AbsoluteVote use this method.

GenesisProtocol use a combination of absolute and relative methods.

### relative

A decision is taken on a timeout T according to the higher relative vote among all votes.

The "winning" choice is the one with the higher relative votes(reputation).

GenesisProtocol use a combination of absolute and relative methods.  

### quorum

A decision is taken if at least a certain percentage P from the total DAO's reputation voted on a certain proposal.

The "winning" choice is the one with the maximum votes(reputation).

QuorumVote use this method.
