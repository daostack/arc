
# Roadmap

The basic idea here is to break into steps the path from the most basic token contract to the MVP contract that can distribute tokens and voting power (plus some additional necessary ingredients), from which we can continue onward using the contract itself. Then we can list as many features as we wish, letting the community decide about the way to move forward.

## Contract steps

### 1. Basic token

See issue #3

This is a standard Token contract that is Ownable, Killable and Upgradable.

* Contract initiated with fixed amount of tokens to deployer
* Contract deployer is first owner
* Function to transfer ownership by owner
* Function to kill contract by owner: existing fund goes back to owner
* Function to transfer tokens by their owner
* Other standard read functions (total supply, balances, etc.)
* Function to upgrade the contract

### 2. Continuous mining

* Function to mine new tokens to owner, by owner
* Function to mine new tokens & distribute them (together), by owner

### 3. Reputation Contract

* Contract initiated with fixed amount of non-transferable reputation score to deployer
* Assign new reputation score by voting:
  * Function to open a vote with contributor address link to contribution
  * Each vote is given by a positive number
  * Result of vote is the reputation-weighted median (RWM) of votes (out of entire reputation)
  * Once RWM becomes positive:
    * New reputation score is mined to contributor address according to the RWM
    * New tokens are being mined to contributor address according to the RWM


### 4. Combine Reputation and Token Contract

* Combine reputation contract with token contract
* Replace single miner → distribute tokens to address by weighted median vote
* Upgrade contract upon reputation-majority vote


### More features that can be added later

* Token distribution scheme to buyer
* Token and (decaying) power distribution scheme to buyer
* Update the contract feature → majority vote on protocol changes
* Vested tokens
* Scheme for successful contributor to choose from vested-amount range option
* Reducing power by supermajority vote (80%?)
* Deploy a new contract easily with some API parameters (incl. with which external token can purchase the internal token)
* Internal successful vote translated to external vote
* Affiliate contract (my own address for buyers / contributors) to give reputation + tokens for deployer
* Reputation flow upon vote according to alignment

## UI

* View of list of positive-balance addresses and their balances
* Send a transaction (by anyone)
* Mine new tokens— activated only for the owner
* Log of all mining and transfer activities
