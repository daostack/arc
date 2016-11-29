
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

## Try out the Dapps on the local test net

Start testrpc

    testrpc

Now, in another terminal window, deploy the contracts to the testnet

    truffle migrate

Build the application. This will create files in the directory `build` that will be your final Dapp

    truffle build

To try out the application with your local testrpc, open yet another terminal window and start a test server:

    truffle serve

Now you can play with your application by browsing to

    http://127.0.0.1:8080/




# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.