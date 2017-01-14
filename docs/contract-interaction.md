
# DCO

Decentralized Cooperative Orginazation - a "Value system".

A DCO is the owner of one (or more) Token contracts.

A DCO is controlled by a Repution system.

A DCO allows for 1 or more types of Ballots. A Ballot specifies (a) a range of proposals (may be yes/no, or a given range) (b) how the outcome is decided (i.e. by majority vote) and (c) an action to be executed when the outcome is decded.


## Ballots

Actions will be taken in the following way (details may change):

1. A Ballot is proposed by calling 
   
    `dco.addBallot(ballotType, arg1, arg2, ...)`

  for example, to give propose to give 200 tokens to 0x123:

    `dco.addBallot("minttokens", 200, 0x123)`

1. Users vote for proposals in the ballot by voting on the 

    `ballot.vote(1)`

1. The ballot is executed by calling, which will only do something if the conditions of the ballot are fullfilled:

    `dco.execute_ballot(ballot.address)`


