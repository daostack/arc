
# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.

We try to follow the style guidelines from http://solidity.readthedocs.io/en/develop/style-guide.html

# Testing

These contracts are tested using the truffle framework

## Installation

Make sure you have a recent version of node.js and yarn.

Install the software:

    yarn install 


## Run tests

Start testrpc

    testrpc

And in another window, run the tests:
    
    cd daostack
    truffle test


# Style 

For solidity, we are following the style guide here: http://solidity.readthedocs.io/en/develop/style-guide.html


# Breakpoints

if you run tests with:

    node debug ./node_modules/truffle/build/cli.bundled.js test

it is possible to use `debugger` statemetns and inspect the state
