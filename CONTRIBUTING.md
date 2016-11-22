
# What is this?

A series of Smart Contracts that will hopefully converge to a DAO that implements the Backfeed Governance model.

# Testing and deploying

These contracts are tested using the populus framework.

## Installation

Install `pip` and `virtualenv` on your platform, and install the solidity compiles according to the instructions here: http://solidity.readthedocs.io/en/develop/installing-solidity.html.

The following instructions do this on Debian:
    
    sudo apt-get install python-pip python-virtualenv
    sudo add-apt-repository ppa:ethereum/ethereum
    sudo apt-get update
    sudo apt-get install solc

Or, on mac:

    brew update
    brew upgrade
    brew tap ethereum/ethereum
    brew install solidity
    brew linkapps solidity

Then clone this repository, and run the following commands

    
    git clone git@github.com:daostack/daostack.git
    cd daostack
    # create a virtual environment to isolate the project from your system python
    virtualenv venv
    source venv/bin/activate
    pip install --upgrade pip setuptools
    pip install -r daostack/requirements.txt


## Run tests

Before running the tests in populus, you need to configure a local test chain:
 

    # activate the virtualenv if you have not done so yet
    source venv/bin/activate
    # configure a local chain called local_test
    populus chain config local_test

Now you are ready to run the tests:

    cd daostack
    py.test tests/


## Deployment

To deploy a contract on the `morden` test net:

    populus deploy MyContract morden

# Using the contract

## API


## In Mist