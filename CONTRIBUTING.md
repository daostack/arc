
# Testing and deploying

These contracts are tested using the truffle framework

## Installation

Make sure you have a recent version of node.js and npm:

    npm install -g npm
    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable

Now you are ready to install doastack:

    npm install 


## Run tests

Start testrpc

    testrpc

And in another window, run the tests:
    
    cd daostack
    truffle test

##  Building, deploying

    truffle migrate

Build the application. This will create files in the directory `build` that will be your final Dapp

    truffle build


## Try out the Dapps on testrpc (a local in-memory test net)

Start testrpc

    testrpc

Deploy the contracts:

    truffle migrate

To try out the application with your local testrpc, open yet another terminal window and start a test server:

    truffle serve

Now you can play with your application by browsing to

    http://127.0.0.1:8080/

## Try out the Dapps on the Ropsten testnet

First build the files:

    truffle build

You will now have a directory called `build`, with an `index.html`

    Open your Mist browser.
    Under > develop > network, chooise `testnet`
    Choose "Browse"
    Enter the path to `build/index.html`
    Ask Jelle to send you some tokens...

[todo: publish the dapps online so these instructions become easier]

# breakpoints

if you run tests with:

    node debug ./node_modules/truffle/cli.js test

it is possible to use `debugger` statemetns and inspect the state

# Contributing

Bug reports and pull requests very much welcomed.

Please make sure test pass before submitting a PR.