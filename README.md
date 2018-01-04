[![Build Status](https://travis-ci.org/daostack/daostack.svg?branch=master)](https://travis-ci.org/daostack/daostack)
[![NPM Package](https://img.shields.io/npm/v/daostack-arc.svg?style=flat-square)](https://www.npmjs.org/package/daostack-arc)


# DAOStack ARC

DAOStack ARC is the lower layer on the DAOStack stack.
It provides a set of smart contracts which can be used as a building blocks for DAOs.
Using this set of smart contracts one can define and setup organization with high level of flexibility by choosing the organization's components and schemes . 

## Getting Started 

DAOStack integrates with [Truffle](https://github.com/ConsenSys/truffle), an Ethereum development environment.
Please install truffle.

```sh
npm install -g truffle
```

### test 
```sh
npm test
```
This will run ganache-cli,compile,migrate and run all tests.

### using daostack-arc as library

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
You should be able to find all daostack-arc contracts under `node_modules/doastack-arc/contracts` folder. 
Using the contracts in the library can be done like so:

```js
import 'daostack-arc/contracts/universalShchems/UniversalScheme.sol';

contract MyContract is UniversalScheme {
  ...
}
```

You should be able to find all daostack-arc already build contracts (<contract>.json) ready for deployment under `node_modules/doastack-arc/build/contracts/` folder .

## Security
daostack-arc is still on its alpha version.
daostack-arc is meant to provide secure, tested and community-audited code, but please use common sense when doing anything that deals with real money! We take no responsibility for your implementation decisions and any security problem you might experience.

# Contributing

Contributions and pull requests are very welcome. Check out [The DAOStack roadmap](docs/roadmap.md), and join us on [Slack](https://daostack.slack.com).

If you want to contribute to the code, check out  [CONTRIBUTING.md](CONTRIBUTING.md).
