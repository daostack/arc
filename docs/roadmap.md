
# Roadmap

## Contract steps

### 1. Owned, initialized token contract

This is close to the contract captured in the Truffle Webpack Demo
(besides killing and transference of ownership).

a.
  * Contract launched with 10,000 tokens to deployer
  * Anyone can transfer his own tokens to others (initially only the owner)
b.
  * Contract deployer is first owner
  * Ownership can be transferred
  * Kill/suicide function by owner



### 2. Mine tokens on the go

* Owner can keep mining tokens to himself by calling a mining function
* Add a function to mine+distribute tokens together (owner mines to himself and then distribute)

### 3. Add simple voting

*

## UI Steps

### 1. Owned, initialized token contract

* UI shows positive-balance addresses and their balance (*)
* Anyone can send a transaction through the UI

(*) this is actually also a requirement on the contract, because it needs an extra datastructure. I.e. having this feature costs money.

### 2. Mine tokens on the go

* Mining through UI (with amount)— activated only for the owner
* Log of all mining and transfer activities
  * mining (miner=owner, amount of mining, total_balance) in red
  * transfer (from, to, amount) in green
