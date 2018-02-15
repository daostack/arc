# Voting Machines Home

A *VotingMachine* is a pluggable component, provided by DAOstack Arc which can be used by a DAO's schemes to manage a voting process on a certain proposal.

The *VotingMachine* maintains the voting process and the proposals to vote on, collects votes, and determines the winning vote according to the DAO's pre-defined configuration.

In some cases, such as [GenesisProtocol](../../generated_docs/VotingMachines/GenesisProtocol.md), it also collects stakes, promotes proposals, and maintains a reputation flow for participants according to the DAO's pre-defined configuration.

Each *VotingMachine* use its own decision method and has its own voting choices range.

## Basic decisions methods used by voting machines

### Absolute

A decision is made if more than a certain percentage (`P`) from the total DAO's reputation voted
on a certain voting choice. Normally `P` is 50% though it can be set to any value.

The "winning" choice is the one that first crosses that bar.

### Relative

A decision is made on a timeout (`T`) according to the higher relative vote among all votes.

The "winning" choice is the one with the higher relative votes (reputation).


### Quorum

A decision is made if at least a certain percentage (`P`) from the total DAO's reputation votes on a certain proposal.

The "winning" choice is the one with the maximum votes (reputation).

## List of supported voting machines

Below is a list of supported `VotingMachines` and their decision methods:

| *VotingMachine* | absolute | relative | quorum
| --- | --- | --- | --- |
| [AbsoluteVote](#absolutevote) | yes | no | no |
| [QuorumVote](#quorumvote) | no | no | yes |
| [GenesisProtocol](#genesisprotocol) | yes | yes | no |

### [AbsoluteVote](../../generated_docs/VotingMachines/AbsoluteVote.md)

Uses an absolute decision method.

Allow voting choices range 0-10.

Vote 0 for abstain.

### [QuorumVote](../../generated_docs/VotingMachines/QuorumVote.md)

Uses a quorum decision method.

Allow voting choices range 0-10.

Vote 0 for abstain.

### [GenesisProtocol](../../generated_docs/VotingMachines/GenesisProtocol.md)

Use absolute and relative decision method.

Currently it allows only `YES`/`NO` voting choices (2 choices).

Abstaining is not allowed.

This voting machine is also a `UniversalScheme`.
