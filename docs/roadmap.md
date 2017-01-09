
# Roadmap for the DOAStack

DAOStack is a collective of programmers and blockchain exerts that is growing and bootstrapping itself into a DAO while building the necessary blockchain (and other) code for itself. 

# Formal and informal whitepaper

The whitepaper describes the general structure of the DAOStack DAO. The goal is to produce two versions: an  [informal version](DAO_protocol.md) that explains the general concepts and ideas in layman's terms, and a [formal specification](DAO.pdf) in which all aspects are rigorously defined.

1. Intro, definitions, basics, vision, purpose
1. Governance model (and its potential evolution) 
1. Token and business model, including investment scheme


# Smart Contracts

The core of the DAOStack is a set of [Smart Contracts](../contracts), written in Solidity, and deployed on the Ethereum blockchain. These contracts will implement at least the following functionality:

1. Distribution of Tokens and Reputation upon vote of reputation holders
1. Voting on change of value system
1. Voting on distribution proposals
1. A number of proposal schemas, such as: Median voting, Yes/No 
1. An audit of the code by a third party
1. Documentations

See also [this issue](https/:/github.com/daostack/daostack/issues/14)

# UI

The User Interface is a Dapp written in Javascript, that reputation holders can use to interact with the DAO. It will provide at least the following functionality:

1. Make proposals for distribution of tokens and repution
1. Make proposals to change the value system (i.e. the main contract), and voting for this
1. Proposing contributions to be considered for Token and reputation awards
1. Voting for the above-mentioned proposals. Such votes can be either binary (yes/no), or can be based on Reputation-weighed median voting (the amount to be distributed is determined as the median of all votes, weighed by reputation)
1. General information about past and present proopsals, reputation distribution, etc.
1. Transfer tokens
1. Delegate reputation
1. List of all VS

# Marketing

The DAOStack will only be a success if we can generate enough critical mass. 

1. A website explaining the project (that includes the UI described above)
1. Create a story and deck
1. Create a group of staked-in partners
1. Find some initial investors
