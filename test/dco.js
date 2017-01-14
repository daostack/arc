const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('Test DCO Voting', function(accounts) {
  it("test basic workflow", async function() {
    // returns logs with the transaction, so we can easily get the ballot address
    // TODO: remove this when this becomes standard behavior in truffle 
    DCO.next_gen = true;

    let reputation = Reputation.deployed()
    let token = MintableToken.deployed()
    let dco = await DCO.new(reputation.address, token.address);

    await token.transferOwnership(dco.address)
    assert.equal(await token.owner(), dco.address);

    await reputation.setReputation(accounts[0], 1000);

    // create a ballot to give 1413 tokens to accounts[1]
    let tx = await dco.createBallotToMintTokens(1413, accounts[1])

    // check that tx.logs[0] is the BallotCreated event we need for the address 
    assert.equal(tx.logs[0].event, 'BallotCreated')
    let ballotAddress = tx.logs[0].args.ballotaddress
    let ballot = Ballot.at(ballotAddress)

    // now vote for proposal 1
    await ballot.vote(1)
    // because we are the only rep holder, this decides the vote
    let winningProposal = await ballot.winningProposal()
    assert.equal(winningProposal, 1)

    await dco.executeBallot(ballot.address)
    // now accounts[1] should have 1413 tokens
    let newBalance = await token.balanceOf(accounts[1])
    assert.equal(newBalance.valueOf(), 1413)


  })

  // it("test basic workflow", async function() {
  //   // returns logs with the transaction, so we can easily get the ballot address
  //   // TODO: remove this when this becomes standard behavior in truffle 
  //   DCO.next_gen = true;

  //   let reputation = Reputation.deployed()
  //   let token = MintableToken.deployed()
  //   let dco = await DCO.new(reputation.address, token.address);

  //   await token.transferOwnership(dco.address)
  //   assert.equal(await token.owner(), dco.address);
  // })
});
