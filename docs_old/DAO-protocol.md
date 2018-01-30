
DAO Protocol
===========

---

 This document describes the general framework and protocol for collaborative DAOs. It parallels the [formal whitepaper](https://github.com/daostack/daostack/raw/master/docs/dao.pdf) ([source](https://github.com/daostack/daostack/blob/master/docs/dao.tex)), which is supposed to cover the same material in a rigorous language.  


> Welcome to edit, add comments/questions, and submit pull request.

Tip: try [StackEdit](https://stackedit.io/) or [Dilinger](http://dillinger.io/) for editing.

---

Basics
------------

----

### Value System

A Value System (VS) is a smart contract allowing a dynamic community of [Agents](#agents) to manage collective decisions, in particular about the ownership and distribution of digital assets.

There are generally five types of decisions a VS can make:

* **Internal fund management**: in terms of distribution of the native token controlled by the VS smart contract.
* **External fund management**: in terms of distribution of other tokens (of other VS) which are owned and managed by the VS smart contract (e.g. as a result of investments in its native token).
* **Curation**: in terms of adding metadata to (and particularly ranking of) digitally-identified objects, such as article, websites, questions and answers, ideas, physical entities (companies, restaurants), etc.
*  **Operation**: in terms of calling and executing functions of other smart contracts (that may be triggering similar activities in other VS but can also be more general).
*  **Protocol update**: in terms of changing the VS protocol for the process of making these (five types of) collective decisions itself.

Generally a VS may process all of them, but often each VS will have one type of decision making that is primary (i.e. being its *purpose*) and the others that will be *secondary* (serving the primary).

> For example, a pure curation VS could be purposed for collective curation of articles, websites or restaurant. A collaborative code-development VS would primarily distribute its internal tokens (as ownership of the guild) to contributors of valuable code. And a decentralized investment (or insurance) fund will primarily allocate external funds (such as ETH) to promising projects (or peers' claims).

Generally speaking, the VS distributes its [tokens](#tokens) and [reputation](#reputation) to agents for posting successful *evaluations* and *contributions* (as perceived by the VS through the evaluations of its reputation holders).

<!---
![](https://raw.githubusercontent.com/fmatan/mytests/master/protocol/VS.png) -->

---

### Agents

Agent is an address that can interact with the blockchain, and it comes in two types:

- **private key**: and a private holder of that key (that has to be kept somewhere by someone).
- **contract**: would it be a multisig contract of several private agents, another value system, or more generally any other contract.

> For example, three private agents can form their own private VS, could be a simple 2-of-3 multisig contract or a more complicated one, and collective become an agent inside other VSs. That collective agent makes its own contributions and evaluations (so that their internal contract should also define how their private inputs turn into single voice), and correspondingly gains its own reputation and tokens (of other VSs). While earned tokens can be distributed between the private agents comprising that collective contract agent, the reputation is forever attributed to the contract as a single, indivisible agent.

Generally an agent has the following attributes within a VS:

- token balance
- reputation score
- history of *contributions* and *evaluations*

The public actions of an agent in a VS are posting [contributions](#contribution),  [evaluations](#evaluation) of contributions, and casting votes on the VS [proposals](#proposal). Privately, an agent can transfer tokens and delegate reputation to other peers. (One can also consider making agents' evaluations secret.)


---

### Tokens

Each value system (VS) has its own native token which is transferrable.

> While a token is generally **transferrable**,  various conditions can be applied to it, such as **Vesting** or **Freezing**, when  tokens are distributed under future conditions, or remained non-transferrable for a period of time. For example, a distribution mechanism might allow a successful contributor to choose if she likes to be rewarded with 10 two-months locked tokens (i.e. rendered non-transferrable for two months), or 5 tangible tokens (which are transferrable immediately).


Agents in the VS have their native token balance, and the distribution of internal tokens is at the core of the VS's activity (or decision making). The token balance is analogous to their financial ownership in that VS, and generally (unless otherwise implemented), internal tokens are backed by the VS assets.

> For example, if VS-A owns 10 tokens of VS-B, and has distributed 100 VS-A tokens to its agents, then each VS-A token is generally redeemable against 0.1 VS-B tokens. Practically it means an agent X can send to the VS-A contract his 5 VS-A tokens; the contract effectively burns those tokens out of circulation (or simply deletes it from its database), and correspondingly sends 0.5 of its VS-B owned tokens back to the address of X from which he has sent his 5 VS-A tokens. That's the default, but of course, could also devised differently by VS-A.

There are generally two ways a VS gains external assets:

* Through agents *purchasing* its native tokens via one of its [token distribution](#token-distribution) schemes.

> Agent X sends 10 ETH

* Through successful contributions of the VS into other VSs

> Say,

#### Token Distribution

The VS contract mints and distributes new internal tokens upon three types of triggers:

1. **Investment**:  agent A sends *external* funds (say, D1 tokens) into the contract (say, D2 VS), and resultingly the D2 contract keeps the sent D1 tokens, mints T D2 tokens and send them back to agent A. (Possibly also issuing R D2 reputation score to be allocated to agent A as well.) The exact details of how many tokens, vested or not (and for how long), reputation or not (and how much) can be very general and depend on the token distribution scheme adopted by the D2 VS. DAOstack lets each founded VS decide and constantly update (through majority votes —but this default choice is also open for change by the VS) the token- and reputation-distribution schemes, and additional templates will be built during its evolution.

> For example, a crowd-sale type template can offer a bounded sale of tokens (say, 1M of them), open for 1 month, with price rising linearly from: 1 D2 token = 1 D1 token, to 1 D2 token = 2 D1 tokens over that period, and a total of 10% of the D2 reputation score allocated to the investors, in proportion to their investment and in linearly decreasing amount over time. Infinitely many other distribution schemes can be suggested to design different economies and incentive structures. We'll offer a few initial [token sale schemes](#token-sale-schemes) below, including their contracts.

2. **Objective contribution** (or objectively measured), which is not transaction of tokens (i.e. purchase). **MORE ON THIS**
3. **Subjective contribution**, that needs to be evaluated by the VS reputation holders. **MORE ON THIS**

#### Token Value

...where the token get its value from, the token's "business model", submission fee, VS reserve...

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

### Proposal

... submitting a proposal for token/reputation-distribution scheme, for example:

1. contribution proposal with fixed reward and majority approval (Yes/No vote)
2. contribution proposal with open reward (numeric evaluation and reputation-weighted median)
3. token-sale distribution scheme 1: fixed-rate sale with no reputation distribution
4. token-sale distribution scheme 2: linearly-growing rate sale with exponentially-decreasing reputation distribution (20% in total)

...

---

### Contribution

---

### Evaluation

---

### Token Sale Schemes

---

### Reputation Flow - I

----

### Contract Architecture

A preliminary contract architecture looks something like this:

![](https://raw.githubusercontent.com/daostack/daostack/master/docs/dao-architecture-1.png)
