
# Roadmap

## Contracts

### 1. Owned, initialized token contract

This is close to the contract captured in the Truffle Webpack Demo
(besides killing and transference of ownership).

* Contract deployer is the default owner
* Contract launched with 10,000 tokens to the owner
* Anyone can transfer his own tokens to others (initially only the owner)
* Kill-contract function by the owner
* Ownership can be transferred
* can transfer all balances 

### 2. Mine tokens on the go

* Owner can keep mining tokens to himself by calling a mining function
* Add a function to mine+distribute tokens together (owner mines to himself and then distribute)

### 3. Add simple voting

* each

## UI

### 1. Owned, initialized token contract

* UI shows positive-balance addresses and their balance
* Anyone can send a transaction through the UI

NOTE: In the Truffle Webpack demo 10 addresses are prepared through testrpc and shown in the UI by default.
In here we'd like to show only addresses that have >0 (/epsilon) balance. (In real chain there's no
meaning of "opening an address" which is used here just for test purposes.)

### 2. Mine tokens on the go

* Mining through UI (with amount)— activated only for the owner
* Log of all mining and transfer activities
** mining (miner=owner, amount of mining, total_balance) in red
** transfer (from, to, amount) in green




## 7. votePower UI
## 8. change token distribution from owner to majority vote (owner is initial votePower)
## 9. vote on distribution (=1) votePower
## 10. general votePower and median vote
