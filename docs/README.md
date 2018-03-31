Welcome to *DAOstack Arc* Docs!

*Arc* is the base layer of the [DAO stack](https://github.com/daostack/docs). It consists of a collection of smart contracts deployed on the Ethereum blockchain that define the basic building blocks and standard components that can be used to implement any DAO.

*Arc* is built from the ground up with these principles in mind:

1. **Scalable Decentralized Governance** - *Arc* implements game theoretic & economic techniques (such as: monetization of attention, staking on proposal results, and more...) that ensure high:

    - **resilience** - resistance to a disproportionate decision power in the hands of minorities.
    - **bandwidth** - decision making rate of the organization.

    even as the number of the participants gets very large.

2. **Security** - *Arc* is community audited and embodies the best security guidelines and is very well tested.
3. **Interoperability & Compositionality** - *Arc* can integrate with any other ethereum based framework with ease. Organizations can interact with each other and form hierarchies and other complex structures.
4. **Modularity** - *Arc* is built in a modular way allowing anyone to extend and expand the ecosystem to support new use-cases.
5. **General purpose** - *Arc* provides a single unified simple model for building any DAO imaginable.

For more information [read the official DAOstack Whitepaper](https://github.com/daostack/docs/blob/master/DAOstack%20White%20Paper%20V1.0.pdf).

Check out:

- The [Contract docs](contracts/README.md) for explanation about each contract and the source tree.
- The [Generated docs](generated_docs/README.md) for detailed technical reference on every contract.

## An overview of the DAO stack

*Arc* is only a part of a larger tech stack built for decentralized governance at scale, which is collectively called the DAOstack. It is important to note the other projects in this stack and how *Arc* fits into this larger whole:

![The DAO stack](img/the_dao_stack.png)

1. [Ethereum](https://www.ethereum.org/) - *Base blockchain.*
2. **Arc** - This project.
2. [Arc.js](https://github.com/daostack/*Arc*.js) - A *JavaScript library that interfaces with *Arc*, built on top of web3.js.*
3. Collaborative DApps, built on top of DAOstack using *Arc.js*. eg. [Vanille](https://github.com/daostack/vanille) & [Alchemy](https://github.com/daostack/alchemy)

For more information regarding the entire DAOstack project, check out the [docs repository](https://github.com/daostack/docs).

## The Structure of a DAO

Each DAO is a living entity on the blockchain that can own and manage resources. As such, it consists of the following “organs”:

![The DAO stack](img/controller.png)

* **[Native token](contracts/controller/DAOToken.md)** - *A Standard [ERC20 token](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) that defines the value system of the DAO. Participants are rewarded for their contributions based on this token*.
* **[Reputation](contracts/controller/Reputation.md) system** - *Similar to native token but is **non-transferable**. The reputation system is used to assign weight the votes of participants*.
* **[Avatar](contracts/controller/Avatar.md)** - *This is the public-facing part of the DAO that handles the interaction of the DAO with the rest of the world(eg. interacing with other DAOs, paying third party participants, etc...)*.
* **Subscribed [Elements](#elements)** - *The set of [Schemes](contracts/universalSchemes/README.md) and [Global Constraints](contracts/globalConstraints/README.md) that comprise the DAO*.

For each DAO, the above components are organized in a single smart contract called a *[Controller](contracts/controller/Controller)*, which acts as the owner of those components.

## Elements

The main configurable and extendable building blocks of DAOs are:
*Schemes* and *Global Constraints*, which are collectively called *elements*.

* **[Schemes](contracts/universalSchemes/README.md)** *define the "dos" of the DAO, the rules under which actions are taken, based on the participants' input.* Examples of Schemes are:
    * Rewarding contributions when other participants recognize them as worthy.
    * Voting on proposals and automatically executing the chosen proposal.
* **[Global constraints](contracts/globalConstraints/README.md)** *define the "don'ts" of the DAO, the conditions that must always hold and can prevent an action from being taken if it violates these conditions.* Examples of Global Constraints are:
    * Limiting the amount of tokens or reputation that can be minted per day.
    * Blacklisting certain participants from performing certain actions.

## Contributing to Arc Docs
Same as [CONTIBUTING](https://github.com/daostack/Arc/blob/master/CONTRIBUTING.md), with the following additions:

1. Make sure your pages are registered in the `mkdocs.yml` file under `pages`.
2. Commands:

    1. `npm run docs:update` - generate documentation to `docs/generated_docs`.
    2. (*) `npm run docs:build` - update & build website to `site/`.
    3. (*) `npm run docs:preview` - preview website locally.
    4. (*) `npm run docs:deploy` - deploy website to `gh-pages` branch so it becomes live.

3. Check for broken links by using `npm run docs:preview` and checking for warnings.
4. Please use a spell checker in your IDE to avoid spelling errors.
5. In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.

(*) - The command requires [mkdocs](http://www.mkdocs.org/) & [mkdocs-material](https://squidfunk.github.io/mkdocs-material/), run `pip install --user mkdocs mkdocs-material`.
