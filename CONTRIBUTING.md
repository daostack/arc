
# What is this?

A series of Smart Contracts that will hopefully converge to a DAO that implements the Backfeed Governance model.

# Testing and deploying

These contracts are tested using the truffle framework

## Installation

Make sure you have a recent version of node.js and npm:

    npm install -g npm
    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable

    npm install truffle -g
    npm install -g ethereumjs-testrpc

## Run tests

Start testrpc

    testrpc

And in another window, run the tests:
    
    cd daostack
    truffle test


# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.