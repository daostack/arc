const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('DCO', function(accounts) {
  it("test basic workflow", async function() {
    // set up a dco
    let reputation = Reputation.deployed()
    let token = MintableToken.deployed()
    let dco = await DCO.new(reputation.address, token.address);
    await token.transferOwnership(dco.address)

    // give all reputation to default account
    await reputation.setReputation(accounts[0], 1000);

    // accounts[1] has no tokens at this point
    let oldBalance = await token.balanceOf(accounts[1])
    assert.equal(oldBalance.valueOf(), 0)

    // (next statement makes transaction return more data, and can be remove
    // once a new version of truffle comes out)
    DCO.next_gen = true;

    // create a ballot to create 1413 tokens and give them to accounts[1]
    let tx = await dco.registerBallotMintTokens(1413, accounts[1])

    // get the ballot action from the transaction
    let ballot = getBallot(tx)

    // vote for it - 1 will be the winning proposal because we have all the rep
    await ballot.vote(1);

    // execute the ballot
    await dco.executeBallot(ballot.address);

    // now accounts[1] should have 1413 tokens
    let newBalance = await token.balanceOf(accounts[1])
    assert.equal(newBalance.valueOf(), 1413)

  })

  it("an unregistered ballot cannot be executed", async function() {
    // set up a dco
    let reputation = Reputation.deployed()
    let token = MintableToken.deployed()
    let dco = await DCO.new(reputation.address, token.address);
    await token.transferOwnership(dco.address)

    // give all reputation to default account
    await reputation.setReputation(accounts[0], 1000);

    // accounts[0] has no tokens at this point
    let oldBalance = await token.balanceOf(accounts[2])
    assert.equal(oldBalance.valueOf(), 0)

    // create a ballot to create 1413 tokens and give them to accounts[1]
    let ballot = await BallotMintTokens.new(dco.address, 1413, accounts[1])

    // vote for it (with all the reputation you have)
    await ballot.vote(1);

    // execute the ballot
    await dco.executeBallot(ballot.address);

    // the number of tokens of accounts[1] should remain unchanged
    // because the ballot was not registered
    let newBalance = await token.balanceOf(accounts[2])
    assert.equal(newBalance.valueOf(), 0)

  })

}); 

function getBallot(tx) {
    // returns a ballot object from the BallotCreated event in the logs of tx

    // first check that tx.logs[0] is the BallotCreated event we need for the address 
    assert.equal(tx.logs[0].event, 'BallotCreated')
    let ballotAddress = tx.logs[0].args.ballotaddress
    let ballot = Ballot.at(ballotAddress)
    return ballot

}