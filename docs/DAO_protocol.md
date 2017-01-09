DAO Protocol
===========

---

>This is a collaborative work to document the general framework and protocol for collaborative DAOs. It parallels the collaboration on the [formal whitepaper](https://github.com/daostack/daostack/raw/master/docs/dao.pdf) ([source](https://github.com/daostack/daostack/blob/master/docs/dao.tex)), which is supposed to cover the same material in a rigorous language. 

---

Basics
------------


### Value system

A Value System (VS) is a smart contract, through which [Agents](#agents) manage collective decision making of four types:

* **Internal fund management** (in terms of the VS's own native token)
* **External fund management** (in terms of other VS's tokens held by the VS)
* **Curation** (in terms of ranking of digitally-identified objects)
*  **Operation** (in terms of calling other smart contracts)

Generally a VS may process all of them, but often each VS will have one type of decision making that is primary (i.e. being its *purpose*) and the others that will be *secondary* (serving the primary).

> The VS distributes its [tokens](#tokens) and [reputation](#reputation) to agents for posting successful *evaluations* and *contributions* (as perceived by the VS through its reputation holders).

<!---
![](https://raw.githubusercontent.com/fmatan/mytests/master/protocol/VS.png) -->

### Agents

Agent is an address that can interact with the blockchain, and it comes in two types:

- **private key** (and a private holder of that key)
- **contract** (multisig, another value system, or any other contract) .

Generally an agent has the following attributes within a VS:

- token balance
- reputation score
- history of *contributions*

> The public actions of an agent in a VS are posting [contributions](#contribution) and  [evaluations](#evaluation) of contributions (and more generally casting votes on the VS [proposals](#proposal)). Privately, an agent can transfer tokens and delegate reputation to other peers.

### Tokens

Each value system (VS) has its own native token which is transferrable.

> A token is generally **transferrable**, although various conditions can be applied to it, such as **Vesting** or **Freezing**, when  tokens are distributed under future conditions, or remained non-transferrable for a period of time. For example, a distribution mechanism might allow a successful contributor to choose if she likes to be rewarded with more tokens which are more vested, or less tokens which are more tangible.


Agents in the VS have their token balance, which represent their financial ownership in that VS. Distribution of internal tokens is at the core of the VS's activity (or decision making).

A VS contract can manage its own *internal* (native) tokens, as well as *external* tokens — tokens of other VS.

#### Distribution

The VS contract mints and distributes new internal tokens upon three types of triggers:

1. **Investment**:  agent A sends *external* funds into the contract

### Reputation

Reputation score is just another name for *voting power*. That is, if an agent A have the sum of reputation of agent B and agent C, then A's vote amounts to B and C voting together (assuming they all vote the same).

> More generally, vote impact could be superlinear or sublinear with respect to reputation, so that A's vote could be stronger or weaker than votes of B and C together. Sublinearity will induce bias towards smaller players and superlinearity will induce a bias towards larger players. The former will also induce an incentive for an identity split (i.e. the same physical agent using multiple identities) and is thus undesirable. The latter will induce incentive for cooperation, or grouping/pools, and might be considered desirable. (However, it'll also give more power to the already powerful, which might be undesirable, and will also be more prone to majority takeover.) The default choice, unless otherwise is clearly desired, would be to stick with linearity.

### Contribution

### Proposal

### Evaluation




The rest
----------
