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

1. `$ yarn global add truffle ganache-cli` - prerequisites: have [truffle](https://github.com/trufflesuite/truffle) and [ganache-cli](https://github.com/trufflesuite/ganache-cli) installed.
2. `$ git clone https://github.com/daostack/daostack.git` - clone the repo.
3. `$ cd daostack`
4. `/daostack/$ yarn` - install dependencies.

Commands:
* `truffle test` - run unit tests.
* `yarn lint` - lint javascript files.
* `yarn solium` - lint Solidity files.

This is an open source project ([GPL licence](https://github.com/daostack/daostack/blob/master/LICENSE)).

PRs are welcome but please first consult with the [Contribution guide](https://github.com/daostack/daostack/blob/master/CONTRIBUTING.md).

Join us on [Slack](https://daostack.slack.com/)!

#### *Note on windows dev environments*
Windows environments are not currently officialy supported.
A common workaround is to use [Docker](https://www.docker.com/).
1. use `docker run -it -v absolute/path/to/local/repo:/home node /bin/bash` (use `${pwd}` for a relative path, eg. `${pwd}/relative`)
2. `$ cd /home`
3. Continue development as usual inside the container. your changes are automatically synchronized with the host(windows) local repo.

## Contributing to Arc Docs
Same as above, with the following exeptions:
* All docs are `.md` files that live under `docs/` with the following structure:
    * `ref/` - generated automatic documentation.
    * `headers/` - manual static `.md` headers that are included in the generated `ref/` (headers are included based on their path, which must match the path of the corrosponding generated file in `ref/`).
    * `scripts/` - the scripts responsible for generating docs.

* Use `docs:gen` to generate docs 
* In case of missing or incorrect documentation please open an issue with the label `documentation`, indicating the file, line number and any extra details.
