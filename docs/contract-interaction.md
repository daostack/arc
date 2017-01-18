
# DAO

Decentralized Cooperative Orginazation - a "Value system".

A DAO is the owner of one (or more) Token contracts.

A DAO is controlled by a Repution system.

A DAO allows for 1 or more types of Proposals. A Proposal specifies (a) a range of proposals (may be yes/no, or a given range) (b) how the outcome is decided (i.e. by majority vote) and (c) an action to be executed when the outcome is decded.


## Proposals

Actions will be taken in the following way (details may change):

1. A Proposal is proposed by calling 
   
    `dco.addProposal(proposalType, arg1, arg2, ...)`

  for example, to give propose to give 200 tokens to 0x123:

    `dco.addProposal("minttokens", 200, 0x123)`

1. Users vote for proposals in the proposal by voting on the 

    `proposal.vote(1)`

1. The proposal is executed by calling, which will only do something if the conditions of the proposal are fullfilled:

    `dco.execute_proposal(proposal.address)`


