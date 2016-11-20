
# What is this?

Contract for Backfeed Tokens

# Testing and deploying

These contract are tested using the populus framework.

## Installation

Install `pip` and `virtualenv` on your platform, and run the following commands:

Install the `solc` compiler according to the instructions here: http://solidity.readthedocs.io/en/develop/installing-solidity.html 

    sudo add-apt-repository ppa:ethereum/ethereum
    sudo apt-get update
    sudo apt-get install solc

Or, on mac:

    brew update
    brew upgrade
    brew tap ethereum/ethereum
    brew install solidity
    brew linkapps solidity

Then clone this repository, and navigate to the `project` directory, and run the following commands

    virtualenv venv -p python2
    source venv/bin/activate
    pip install -U 
    pip install -r requirements.txt


## Run tests

Most of the code is in the directory `project`
 
    cd project
    populus chain config local_test
    py.test tests/

## Deployment



# Using the contract

## API


## In Mist