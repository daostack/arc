[![Build Status](https://travis-ci.org/daostack/arc.svg?branch=master)](https://travis-ci.org/daostack/arc)
[![NPM Package](https://img.shields.io/npm/v/@daostack/arc.svg?style=flat-square)](https://www.npmjs.org/package/@daostack/arc)
# Arc

Arc is the lower layer of the DAO stack. It consists a set of smart contracts deployed on the Ethereum blockchain that define the basic building blocks and standard components that can be used to implement any DAO.

## Getting Started

DAOStack integrates with [Truffle](https://github.com/ConsenSys/truffle), an Ethereum development environment.
Please install truffle.


```sh
npm install -g truffle
```
### Getting the source code

```sh
git clone https://github.com/daostack/arc
```

### test
```sh
npm test
```
This will run ganache-cli, compile, migrate and run all tests.

### Docker
Arc has a prebuilt Docker image that makes development environments consistent and cross-platform.
1. Install [Docker](https://www.docker.com/community-edition#/download) in your favorite OS/platform.
2. Run `sudo docker run --rm -it -v <path to repo>:/home/arc daostack/arc`.
2. The container will automatically `git clone` or `git fetch` depending on if `<path to repo>` is empty, and will install any dependencies.
3. Continue development inside the container.

### using Arc as an npm package

Please install Truffle and initialize your project with `truffle init`.

```sh
npm install -g truffle
mkdir myproject && cd myproject
truffle init
```
To install the @daostack/arc package, run:
```sh
npm init
npm install @daostack/arc
```

- `.sol` Source code is found under `node_modules/@daostack/arc/contracts`
- `.json` Compiled contracts are found under `node_modules/@daostack/arc/build/contracts`

```js
import '@daostack/arc/contracts/universalSchemes/UniversalScheme.sol';

contract MyContract is UniversalScheme {
  ...
}
```

You should be able to find all @daostack/arc already built contracts (<contract>.json) ready for deployment under `node_modules/@daostack/arc/build/contracts/` folder.

## Security
DAOstack Arc is still on its alpha version.
Arc is meant to provide secure, tested and community-audited code, but please use common sense when doing anything that deals with real money! We take no responsibility for your implementation decisions and any security problem you might experience.

## License

This is an open source project ([GPL license](https://github.com/daostack/arc/blob/master/LICENSE)).

## Contribution

PRs are welcome but please first consult with the [Contribution guide](https://github.com/daostack/arc/blob/master/CONTRIBUTING.md).

Join us on [Slack](https://daostack.slack.com/)!

Join us on [Telegram](https://t.me/daostackcommunity)!

# Documentation

Read the [docs](https://daostack.github.io/arc)!
