Welcome to DAOstack Arc Docs!

Check out the [Generated docs](generated_docs) for detailed documentation on every contract and an explanation of the source tree.

## An Overview of Arc

For more: [Read the official DAOstack Whitepaper](https://github.com/daostack/docs/blob/master/DAOstack%20White%20Paper%20V1.0.pdf).

Arc is the lower layer of the DAOStack. It consists of several smart contracts deployed on the Ethereum blockchain that define the basic building blocks and standard components that can be used to implement any DAO.

![The DAOStack](img/the-dao-stack.png)

The DAOStack:

1. [Ethereum](https://www.ethereum.org/) - *Base blockchain.*
2. ArcHives - *A public curated database of [element](#elements)s, organizations and a shared place for community collaboration*.
3. **Arc - This project**
4. [Arc.js](https://github.com/daostack/arc.js) - *JavaScript library that talks to Arc, built on top of web3.js.*
5. [Vanille](https://github.com/daostack/vanille) (and more...) - *Collaborative DApps, built on top of DAOstack using Arc.js*

### The Structure of a DAO

Each DAO consists of the following components:

* **[Native token](generated_docs/controller/DAOToken.md)** - *A Standard [ERC20 token](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) that defines the value system of the DAO, participants are rewarded for their contributions based on this token*.
* **[Reputation](generated_docs/controller/Reputation.md) system** - *Similar to native token but is **non-transferable**, the reputation is used system is used to assign an importance to participants and their votes*.
* **[Avatar](generated_docs/controller/Avatar.md)** - *This is the public facing part of the DAO that handles the interaction of the DAO with the rest of the world(interacing with other DAOs, paying third party participants, etc...)*.
* **Subscribed [Elements](#elements)** - *The set of [Schemes](generated_docs/universalSchemes) and [Global Constraints](generated_docs/globalConstraints) the DAO consists of*.

Those components are organized in a single smart contract called a *[Controller](Controller)*.

## Elements

The main configurable and extendable building blocks of DAOs are:
*Schemes* and *Global Constraints*, which are collectively called *elements*.

* **[Schemes](generated_docs/universalSchemes/UniversalSchemeInterface.md)** *define the "do's" of the DAO, defining rules under which actions are taken, based on the participants input.* Examples of Schemes are:
    * Rewarding contributions if other participants recognize them as worthy.
    * Voting on proposals and automatically executing the chosen proposal.
* **[Global constraints](generated_docs/globalConstraints/GlobalConstraintInterface.md)** *define the "don't" of the DAO, they define conditions that must always hold and can prevent an action from being taken if it violates these conditions.* Examples of Global Constraints are:
    * Limiting the amount of tokens or reputation that can be minted per day.
    * Blacklisting certain participants from performing certain actions.

### ArcHives and the Developer Ecosystem

#### Compendium

Developers can create and extend *elements* to define more rules that DAOs can subscribe to.
Those *elements* can then be registered(for a fee) to a public database called *Compendium*.

### Contributing to Arc Docs
Same as [CONTIBUTING](https://github.com/daostack/Arc/blob/master/CONTRIBUTING.md), with the following additions:

1. Directory structure:
    - `docs/`
        - `contracts/`
            - Manual docs for contracts.
            - Follows the directory structure of `/contracts/`.
        - `generated_docs/`
            - Contains automatically generated docs from `.sol` files in `/contracts/`.
            - If generated file has a corresponding file in `docs/contracts`, this file will be included.
2. Use the `yarn docs ..` cli to `update`, `build`, `preview`, `deploy` & `clean` documentation, see `yarn docs --help` for details.

    !!! note "`yarn docs preview` does not serve the final website!"
        `yarn docs preview` will serve from the `docs` folder. This means that what you see is not the final website.
        In the final website:

        - All `README.md` files will be renamed to `index.md`, will automatically appear as "Home" on the menu and will be available in the URL at `...somedir/`.
        - `docs/contracts` will no show.

2. Please provide an `README.md` file in the root of every directory, giving an overview of that directory.
3. Check that there are no broken links by running `yarn docs preview` and checking for warnings of the form:
 > WARNING -  The page "contracts\universalSchemes\README.md" contained a hyperlink to "contracts\universalSchemes\GenesisScheme.md" which is not listed in the "pages" configuration.
3. Please use a spell checker in your IDE to avoid spelling errors.
4. In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.
