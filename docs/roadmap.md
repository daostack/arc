
# Roadmap

Breaking into steps the path from the most basic token contract to the MVP contract that can distribute tokens and voting power (AKA reputation), plus some additional necessary ingredients, from which we can continue onward using the contract itself (and distribute tokens and reputation to contributors of code). 

Can also publicly list tasks [here](https://workflowy.com/s/hIDfJ7fGZm)

## Contract steps

### 1. Basic token

See [issue #3](//github.com/daostack/daostack/issues/3)

This is a standard Token contract that is Ownable, Killable and Upgradable.

- [x] Contract initiated with fixed amount of tokens to deployer
- [x] Contract deployer is first owner
- [x] Function to transfer ownership by owner
- [x] Function to kill contract by owner: existing fund goes back to owner
- [x] Function to transfer tokens by their owner
- [x] Other standard read functions (total supply, balances, etc.)

### 2. Continuous mining

See [issue](//github.com/daostack/daostack/issues/6)


- [ ] Function to mine new tokens to owner, by owner
- [ ] Function to mine new tokens & distribute them (together), by owner

### 3. Reputation Contract

See [issue](//github.com/daostack/daostack/issues/7)

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


### Next features 

* Token sale 
 * Simplest sale of tokens for send of ETH with fixed rate
 * Sale of tokens for other tokens (not ETH) with fixed rate 
 * Varying sale schemes (possibly with vesting) (template for the general token distribution scheme)
 * Possibly (decaying) reputation distribution scheme to token buyers
* Vested tokens scheme for contributors (template for the general token distribution scheme)
 * Possibly let successful contributor to choose from vested-amount range option
* Reducing reputation by supermajority vote (80%?) (right now reducing and increasing is symmetric)
* Internal successful vote translated to external vote
* Conditions to trigger external contribution
* Affiliate contract (my own address for buyers / contributors) to give reputation + tokens for deployer
* Reputation flow upon vote according to alignment

## UI

* View of list of positive-balance addresses and their balances
* Send a transaction (by anyone)
* Mine new tokens— activated only for the owner
* Log of all mining and transfer activities
