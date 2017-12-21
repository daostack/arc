
# Roadmap for the DOAStack

DAOStack is: 

1. A collective of programmers and blockchain experts that is growing and bootstrapping itself into a DAO while building the necessary blockchain (and other) code for itself. 
1. It's, in a sense, a DAO accelerator, making the infrastructure for DAOs and helping them bootstrap. 
1. A blockchain-dev guild, offering blockchain (and perhaps more general) development service for others. 
1. Economic framework for the cooperation of DAO-related companies in the blockchain space, by incentivizing the building and sharing of related components, design for interoperability and co-creation.

We aim to launch an MVP platform for a collaborative DAO before the end of Q1 and use it for further collaborative development.

## Formal and informal whitepaper

The whitepaper describes the general structure of a collaborative DAO and the particular protocol (and code) of DAOStack. The goal is to produce two versions: an [informal version](DAO-protocol.md) that explains the general concepts and ideas in layman's terms, and a [formal specification](dao.pdf) in which all aspects are rigorously defined. Rough content should include:

1. Background, intro, definitions, basics, vision, purpose, mission
2. Governance model (and its potential evolution) 
3. Token and business model, including investment scheme
4. Code 


## Smart Contracts

The core of the DAOStack is a set of [Smart Contracts](../contracts), written in Solidity, and deployed on the Ethereum blockchain. These contracts will implement at least the following functionality (and much more over time):

1. Main architecture for upgradable, modular and secure distribution of Tokens and Reputation upon the vote of reputation holders
1. Voting on (change of) of core value system
1. Voting on distribution-scheme proposals
1. A number of proposal schemas, including: Median voting, Yes/No proposal, investment distribution 
1. Documentations

See also [this issue](https://github.com/daostack/daostack/issues/14)

# UI

The User Interface is a Dapp written in Javascript, that reputation holders can use to interact with the DAO. It will provide at least the following functionalities:

1. Make proposals for distribution of tokens and repution 
1. Make proposals to change the value system (i.e. the main contract)
1. Propose contribution to be considered for Token and reputation awards
1. Vote for the above-mentioned proposals. Such votes can be either binary (yes/no), or with a ranged number (if vote is based on Reputation-Weighed Median, i.e. the amount to be distributed is determined as the median of all votes, weighed by reputation)
1. Access information about agents (tokens and reputation balances), objects (proopsals, contributions, public votes) and value systems (and their properties).
1. Transfer tokens
1. Delegate reputation

# Marketing

Towards going "public" and launching an ICO, the DAOStack with also need: 

1. A website explaining the project (including the above UI)
1. Simple documentation, general story, blog and deck
1. First set of  staked-in partners/companies
1. Early investors/projects
