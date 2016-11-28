
# What is this?

A series of Smart Contracts that will hopefully converge to a DAO that implements the Backfeed Governance model.

# Testing and deploying

These contracts are tested using the populus framework.

## Installation

Make sure you have a recent version of node.js and npm:

    npm install -g npm
    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable

    npm install truffle -g
    npm install -g ethereumjs-testrpc

## Run tests

to compile:
    
    truffle compile



## Deployment

To deploy a contract on the `morden` test net:

    populus deploy MyContract morden

# Using the contract

## API


## In Mist