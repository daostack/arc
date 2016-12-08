
# Roadmap


## 1. Basic token

See issue #3

This is a standard Token contract that is Ownable and Killable.

- Contract launched with 10,000 tokens to deployer
- Anyone can transfer his own tokens to others 
- Contract deployer is first owner
- Ownership can be transferred
- Kill/suicide function by owner: funds go back to owner

### UI

- UI shows positive-balance addresses and their balance (*)
- Anyone can send a transaction through the UI


## 2. Continuous mining

* Owner can keep mining tokens to himself by calling a mining function
* Add a function to mine+distribute tokens together (owner mines to himself and then distribute)

### UI

* Mining through UI (with amount)— activated only for the owner
* Log of all mining and transfer activities
  * mining (miner=owner, amount of mining, total_balance) in red
  * transfer (from, to, amount) in green

## 3. Reputation Contract

* Contract with (non-transferable) reputation score
* Voting with weighed median voting 
* Reputation can be assigned to new users by median voting


## 4. Combine Reputation and Token Contract

1. Combine reputation contract with tojen contract 
1. Replace single miner → distribute tokens to address by weighted median vote

## 5. Reputation flow

* Backfeed objective protocol 

# [Other stuff to add]

1. Add token distribution scheme to buyer
1. Add token and (decaying) power distribution scheme to buyer
1. Bundled votes (say, reputation and tokens linearly; fits contribution)
1. Contribution: bundled vote + hash of contribution
1. Update the contract feature → majority vote on protocol changes 
1. Add vested tokens (and voting on their distribution)
1. Add scheme for successful contributor to choose from vested-amount range option
1.  Reducing power by supermajority vote (80%?)
1. Deploy a new contract easily with some API parameters (incl. with which external token can purchase the internal token)
Add to contribution bundle an investment option (purchase shares in the contribution)
1. Add to contribution a collective external investment (in the external token, from the fund, upon conditions) in the contribution upon internal majority success
1. Add internal success also translated to external vote
1. Simple power flow between evaluators
1. Affiliate contract (my own address for buyers / contributors) to give reputation + tokens for deployer
