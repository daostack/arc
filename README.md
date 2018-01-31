[![Build Status](https://travis-ci.org/daostack/Arc.svg?branch=master)](https://travis-ci.org/daostack/Arc)
[![NPM Package](https://img.shields.io/npm/v/daostack-arc.svg?style=flat-square)](https://www.npmjs.org/package/daostack-arc)
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
git clone https://github.com/daostack/Arc
```

### test
```sh
npm test
```
This will run ganache-cli, compile, migrate and run all tests.

### using Arc as a library

Please install Truffle and initialize your project with `truffle init`.

```sh
npm install -g truffle
mkdir myproject && cd myproject
truffle init
```
To install the daostack-arc library, run:
```sh
npm init
npm install daostack-arc
```

- `.sol` Source code is found under `node_modules/daostack-arc/contracts`
- `.json` Compiled contracts are found under `node_modules/daostack-arc/build/contracts`

```js
import 'daostack-arc/contracts/universalSchemes/UniversalScheme.sol';

contract MyContract is UniversalScheme {
  ...
}
```

You should be able to find all daostack-arc already built contracts (<contract>.json) ready for deployment under `node_modules/doastack-arc/build/contracts/` folder.

#### *Note on windows dev environments*
Windows environments are not currently officially supported.
A common workaround is to use [Docker](https://www.docker.com/).
1. use `docker run -it -v absolute/path/to/local/repo:/home node /bin/bash` (use `${pwd}` for a relative path, eg. `${pwd}/relative`)
2. `$ cd /home`
3. Continue development as usual inside the container. your changes are automatically synchronized with the host(windows) local repo.

## Security
DAOstack Arc is still on its alpha version.
Arc is meant to provide secure, tested and community-audited code, but please use common sense when doing anything that deals with real money! We take no responsibility for your implementation decisions and any security problem you might experience.

## License

This is an open source project ([GPL license](https://github.com/daostack/daostack/blob/master/LICENSE)).

## Contribution

PRs are welcome but please first consult with the [Contribution guide](https://github.com/daostack/Arc/blob/master/CONTRIBUTING.md).

Join us on [Slack](https://daostack.slack.com/)!

Join us on [Telegram](https://t.me/daostackcommunity)!

# Documentation

Read the [docs](https://daostack.github.io/Arc)!
