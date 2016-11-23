# Mini DAO contract


Steps from 0 to MVP, contract can do:


1. [Owned contract](owned.md)
2. [Standard ERC20 token contract](token.md)
3. [Token contract in wich the owner is also  single “miner”](mintabletoken.md)
4. [Reputation Contract](reputation.md)
5. [Reputation contract with weighted median voting (vote /in [0,/infty)](votingcontract.md)
1. Reputation contract “owned by itself” 
    * (i.e. rep can be redistributed by median voting)
1. Combine reputation contract with tojen contract 
1. Replace single miner → distribute tokens to address by weighted median vote
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
