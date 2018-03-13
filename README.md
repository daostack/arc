[![Build Status](https://travis-ci.org/daostack/arc.svg?branch=master)](https://travis-ci.org/daostack/arc)
[![NPM Package](https://img.shields.io/npm/v/@daostack/arc.svg?style=flat-square)](https://www.npmjs.org/package/@daostack/arc)
[![Join the chat at https://gitter.im/daostack/Lobby](https://badges.gitter.im/daostack/Lobby.svg)](https://gitter.im/daostack/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
# Arc

Arc is the base layer of the DAO stack. It consists a set of smart contracts deployed on the Ethereum blockchain that define the basic building blocks and standard components that can be used to implement any DAO.

## Security
*DAOstack Arc* is still in its **alpha** version.
Arc is intended to provide secure, tested and community-audited code, but please use common sense when doing anything that deals with real money!
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
    You should be able to find all `@daostack/arc` already built contracts (<contract>.json) ready for deployment under `node_modules/@daostack/arc/build/contracts/` folder.
4. Read the [documentation](https://daostack.github.io/arc/) to get a better understanding of how to use Arc.

## Contribute

PRs are welcome but please first consult with the [Contribution guide](https://github.com/daostack/arc/blob/master/CONTRIBUTING.md).

Join us on [Telegram](https://t.me/daostackcommunity)!

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
- `npm run solium` - Check all Solidity code for style & good practices.
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
