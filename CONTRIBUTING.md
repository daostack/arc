
# Contributing

Bug reports and pull requests are very much welcomed.

Please make sure all tests pass before submitting a PR.

We try to follow the style guidelines found at http://solidity.readthedocs.io/en/develop/style-guide.html

The development is done on unix based systems.

# Testing

These contracts are tested using the truffle framework.

## Installation

Make sure you have a recent version of [node.js](https://nodejs.org/) (7.6 and above) and [yarn](https://yarnpkg.com) package manager.

Installation of dependencies. After cloning the repository run:

    yarn


## Run tests

To run the test locally use a local blockchain using testrpc, just run:

    testrpc

On a second terminal, run the tests:

    yarn run test


# Style

For solidity, we are following the style guide here: http://solidity.readthedocs.io/en/develop/style-guide.html

A Solidity linter Solium is used for ensuring proper Solidity practices, which can be run with:

    yarn run solium

Code should pass Javascript linting as well:

    yarn run lint

# Breakpoints

If you run tests with:

    node debug ./node_modules/truffle/build/cli.bundled.js test

it is possible to use `debugger` statements and inspect the state of the tests during runtime. 
