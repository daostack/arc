[![Build Status](https://travis-ci.org/daostack/arc.svg?branch=master)](https://travis-ci.org/daostack/arc)
[![NPM Package](https://img.shields.io/npm/v/@daostack/arc.svg?style=flat-square)](https://www.npmjs.org/package/@daostack/arc)
[![Join the chat at https://gitter.im/daostack/Lobby](https://badges.gitter.im/daostack/Lobby.svg)](https://gitter.im/daostack/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
# Arc

Arc is the base layer of the DAO stack. It consists of a set of smart contracts deployed on the Ethereum blockchain that define the basic building blocks and standard components that can be used to implement any DAO.

Arc is a modular, upgradeable platform that allows for a rapid natural selection of governance systems.

![Arc Structure Diagram](https://user-images.githubusercontent.com/5414803/51004260-d7252180-1507-11e9-9be7-2018dbc7452d.jpeg)
*<p align="center">Figure 1: Arc's structure</p>*

**Every box in Figure 1 represents a smart contract.**

The Token contract probably does not require an explanation, being the most popular use-case of the Ethereum network.

**The Avatar contract is the face of an organization on the blockchain**, e.g. if the organization is to hold ownership of anything, like ownership over a contract or asset, the owner address will be the Avatar.

**The Reputation contract stores a DAO's reputation data.** In Arc, Reputation represents a user's decision power in a given DAO. It is very similar to a token, with two main differences: one, it is non-transferable, and two, it can be granted or taken away by the DAO.

On the right side of the figure we have the schemes. **Schemes are simple pieces of logic describing the different actions a DAO can take.** One example is a scheme for funding proposals, in which everyone can suggest and vote on proposals, and if a proposal is approved, it is automatically funded.

At the bottom are the global constraints. **Global constraints prevent current and future modules from breaking certain overarching rules**, e.g. a cap on an organization’s total possible reputation.

**The Controller is an access control module** that keeps a record of all the registered schemes in a DAO and the permissions for each scheme. It also records all global constraints and enforces them by reverting transactions that violate them.

Go [here](https://medium.com/daostack/the-arc-platform-2353229a32fc) for a full primer on Arc.

## Security
*DAOstack Arc* is still in its **alpha** version.
Arc is intended to provide secure, tested, and community-audited code, but please use common sense when doing anything that deals with real money!
We take no responsibility for your implementation decisions and any security problem you might experience.

## Getting Started

1. Please install [Truffle](https://github.com/ConsenSys/truffle) and initialize your project with `truffle init`.
    ```sh
    npm install -g truffle
    mkdir myproject && cd myproject
    truffle init
    ```
2. Install the `@daostack/arc` package:  `npm install @daostack/arc`.
    - `.sol` Source code is found under `node_modules/@daostack/arc/contracts`
    - `.json` Compiled contracts are found under `node_modules/@daostack/arc/build/contracts`
3. Import in your project:
    ```JavaScript
    import '@daostack/arc/contracts/universalSchemes/UniversalScheme.sol';

    contract MyContract is UniversalScheme {
      ...
    }
    ```
    You should be able to find the `@daostack/arc` contracts (<contract>.json) already built and ready for deployment in the `node_modules/@daostack/arc/build/contracts/` folder.
4. Read the [documentation](https://daostack.github.io/arc/) to get a better understanding of how to use Arc.

## Contribute

PRs are welcome, but please first consult with the [Contribution guide](https://github.com/daostack/arc/blob/master/CONTRIBUTING.md).

Join us on [Discord](https://daostack.io/community)!

To contribute to Arc development start by cloning the repo and installing the dependencies:
```sh
git clone https://github.com/daostack/arc
cd arc
npm install
```
### Commands

Available commands while developing:

- `npm run build` - Compile all contracts to the `build/` folder.
- `npm run test` - This will run ganache-cli, compile, migrate and run all tests.
- `npm run lint` - Check all JavaScript code for style & good practices.
- `npm run solhint` - Check all Solidity code for style & good practices.
- `npm run docs:<update|build|deploy|preview>` - See [this](docs#contributing-to-arc-docs) for details.

### Docker
Arc has a prebuilt Docker image that makes development environments consistent and cross-platform.
To start developing inside this environment:

1. Install [Docker](https://www.docker.com/community-edition#/download) in your favorite OS/platform.
2. Run `docker run --rm -it -v <path to repo>:/home/arc daostack/arc` (*May require Admin/root permissions).
2. The container will automatically `git clone` or `git fetch` depending on if `<path to repo>` is empty, and will install any dependencies.
3. Continue development inside the container.

## License

This is an open-source project ([GPL license](https://github.com/daostack/arc/blob/master/LICENSE)).
