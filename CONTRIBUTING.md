
# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.

We try to follow the style guidelines from http://solidity.readthedocs.io/en/develop/style-guide.html

The development id done on unix based systems.  

# Testing

These contracts are tested using the truffle framework

## Installation

Make sure you have a recent version of [node.js](https://nodejs.org/) (7.6 and above) and [yarn](https://yarnpkg.com) package manager.

Installation of dependencies. After cloning the repository run:

    yarn


## Run tests

To run the test locally use a local blockchain using testrpc, just run:

    testrpc

On a second terminal, run the tests:

    truffle test


# Style

For solidity, we are following the style guide here: http://solidity.readthedocs.io/en/develop/style-guide.html


# Breakpoints

if you run tests with:

    node debug ./node_modules/truffle/build/cli.bundled.js test

it is possible to use `debugger` statemetns and inspect the state
