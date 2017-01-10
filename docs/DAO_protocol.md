
DAO Protocol
===========

-----

>This is a collaborative work to document the general framework and protocol for collaborative DAOs. It parallels the collaboration on the [formal whitepaper](https://github.com/daostack/daostack/raw/master/docs/dao.pdf) ([source](https://github.com/daostack/daostack/blob/master/docs/dao.tex)), which is supposed to cover the same material in a rigorous language.

---

Basics
------------

----

### Value System

A Value System (VS) is a smart contract, through which [Agents](#agents) manage five types of collective decision:

* **Internal fund management** (in terms of the VS's own native token)
* **External fund management** (in terms of other VS's tokens held by the VS)
* **Curation** (in terms of ranking of digitally-identified objects)
*  **Operation** (in terms of calling other smart contracts)

Generally a VS may process all of them, but often each VS will have one type of decision making that is primary (i.e. being its *purpose*) and the others that will be *secondary* (serving the primary).

> The VS distributes its [tokens](#tokens) and [reputation](#reputation) to agents for posting successful *evaluations* and *contributions* (as perceived by the VS through its reputation holders).

<!---
![](https://raw.githubusercontent.com/fmatan/mytests/master/protocol/VS.png) -->

---

### Agents

Agent is an address that can interact with the blockchain, and it comes in two types:

- **private key** (and a private holder of that key)
- **contract** (multisig, another value system, or any other contract) .

Generally an agent has the following attributes within a VS:

- token balance
- reputation score
- history of *contributions*

> The public actions of an agent in a VS are posting [contributions](#contribution) and  [evaluations](#evaluation) of contributions (and more generally casting votes on the VS [proposals](#proposal)). Privately, an agent can transfer tokens and delegate reputation to other peers.

---

### Tokens

Each value system (VS) has its own native token which is transferrable.

> A token is generally **transferrable**, although various conditions can be applied to it, such as **Vesting** or **Freezing**, when  tokens are distributed under future conditions, or remained non-transferrable for a period of time. For example, a distribution mechanism might allow a successful contributor to choose if she likes to be rewarded with more tokens which are more vested, or less tokens which are more tangible.


Agents in the VS have their token balance, which represent their financial ownership in that VS. Distribution of internal tokens is at the core of the VS's activity (or decision making).

A VS contract can manage its own *internal* (native) tokens, as well as *external* tokens —tokens of other VS— that were invested in it.

#### Distribution

The VS contract mints and distributes new internal tokens upon three types of triggers:

1. **Investment**:  agent A sends *external* funds (say, D1 tokens) into the contract (say, D2 VS), and resultingly the D2 contract keeps the sent D1 tokens, mints T D2 tokens and send them back to agent A. (Possibly also issuing R D2 reputation score to be allocated to agent A as well.) The exact details of how many tokens, vested or not (and for how long), reputation or not (and how much) can be very general and depend on the token distribution scheme adopted by the D2 VS. DAOstack lets each founded VS decide and constantly update (through majority votes —but this default choice is also open for change by the VS) the token- and reputation-distribution schemes, and additional templates will be built during its evolution.

> For example, a crowd-sale type template can offer a bounded sale of tokens (say, 1M of them), open for 1 month, with price rising linearly from: 1 D2 token = 1 D1 token, to 1 D2 token = 2 D1 tokens over that period, and a total of 10% of the D2 reputation score allocated to the investors, in proportion to their investment and in linearly decreasing amount over time. Infinitely many other distribution schemes can be suggested to design different economies and incentive structures. We'll offer a few initial [token sale schemes](#token-sale-schemes) below, including their contracts.

---

### Reputation

Reputation score is just another name for *voting power*. That is, if an agent A have the sum of reputation of agent B and agent C, then A's vote amounts to B and C voting together (assuming they all vote the same).

> More generally, we could have imagined vote impact to behave superlinearly or sublinearly with respect to reputation, so that A's vote could be stronger or weaker than votes of B and C together. Sublinearity will induce bias towards smaller players and superlinearity will induce a bias towards larger players. The former will also induce an incentive for an identity split (i.e. the same physical agent using multiple identities) and is thus undesirable. The latter will induce incentive for cooperation, or grouping/pools, and might be considered both desirable (including cooperation and fractal governance) or undesirable (giving more power to the already powerful ones, as well as more prone to majority attack). The default choice, unless otherwise is clearly devised, would be to stick with linearity.

Reputation is non-transferrable, but can can be *reversibly* delegated. Reputation can be awarded (or distributed) by vote of current reputation holders, usually as part of an agent's contribution to the network —together with award of tokens.

> A VS can also decide to award reputation to an agent who hasn't contributed directly to this VS but is known to have reputation/competence from past activity. In that case usually the reputation distribution will not be tight up with tokens, but the voting procedure would be similar.

A more advanced (and important) feature is the  [reputation flow](#reputation-flow) between curators upon their evaluations of proposals. Generally reputation should flow to curators who are found to be retrospectively aligned with decisions made by the VS (from those who are found misaligned, or those who haven't participated in voting), and in that way the VS induces systematic alignment of opinions (and interests) and defines its *emergent* value system. At the same time, misaligned agents become less effective within that VS, and are incentivized to open a new VS (where they define the first axis of alignment) or join another one better suiting their personal value system.

> For example, agent Cony posts a contribution of a code repository. Agent Eva reviews that contribution and posts an evaluation to distribute 10 (say, DAOstack<sup id="a1">[1](#f1)</sup>) tokens to agent Cony for that contribution. Then, the more reputable agents<sup id="a2">[2](#f2)</sup> endorse Eva's evaluation (i.e. posts similar evaluations —and defining *similar* is, for example, where things get more complicated) the more Eva's reputation increases; and vice versa. So, basically when making an evaluation amounts to putting your reputation at risk —and gaining if being "right". To define of "being right" requires more work.



The reputation flow element is perhaps the complex part of the reputation protocol, which needs to be carefully designed in a resistant way. (I.e. a way that makes is impossible for an agent to game the system and gain reputation without actually be retrospectively aligned with the VS it belongs to.) We'll elaborate on this in a separate chapter [below](#reputation-flow).


<b id="f1">1</b> If the contribution and evaluation are within the DAOstack VS. Generally they can be in any other VS, that can be a sub-VS of DAOstack, or not. [↩](#a1)

<b id="f2">2</b> Reputation is what counts, not number of people. [↩](#a2)

---

### Contribution

---

### Proposal

---

### Evaluation

------

### Reputation Flow

---

### Token Sale Schemes

---



> Written with [StackEdit](https://stackedit.io/).
