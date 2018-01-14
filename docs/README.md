# Resources

- [Reference Documentation](ref/toc.md)
- [Concepts](concepts.md)
- [Guides & Recepies](guides.md)
- [Roadmap](roadmap.md)
- [Read the Whitepaper](DAOstack%20White%20Paper%20V1.0.pdf)

# Getting Started
## As a Solidity library

1. Install npm package: `yarn add daostack-arc`/ `npm install --save daostack-arc`
2. Import in your project. `import 'daostack-arc/contracts/...';`

Example:
```
import 'daostack-arc/contracts/universalShchems/UniversalScheme.sol';
contract MyAwesomeScheme is UniversalScheme { ... }
```

## Contributing to Arc

1. `$ yarn global add truffle ethereumjs-testrpc` - prerequisites: have [truffle](https://github.com/trufflesuite/truffle) and [testrpc](https://github.com/ethereumjs/testrpc) installed.
2. `$ git clone https://github.com/daostack/daostack.git` - clone the repo.
3. `$ cd daostack`
4. `/daostack/$ yarn` - install dependencies.

*Note: Windows environments are not currently supported, please use a Unix based dev environment*.

Commands:
* `truffle test` - run unit tests.
* `yarn lint` - lint javascript files.
* `yarn solium` - lint Solidity files.

This is an open source project ([GPL licence](https://github.com/daostack/daostack/blob/master/LICENSE)).

PRs are welcome but please first consult with the [Contribution guide](https://github.com/daostack/daostack/blob/master/CONTRIBUTING.md).

Join us on [Slack](https://daostack.slack.com/)!

## Contributing to Arc Docs
Same as above, with the following exeptions:
* All docs are `.md` files that live under the wiki repo `git clone https://github.com/daostack/daostack.wiki.git`.
* In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.