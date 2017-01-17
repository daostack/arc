contract('BallotMintTokens', function(accounts) {
  it("should respect basic sanity", async function() {
    let reputation = Reputation.deployed()
    let token = MintableToken.deployed()
    let dco = await DCO.new(reputation.address, token.address);

    // give the dco the ownership of the token
    await token.transferOwnership(dco.address)
    assert.equal(await token.owner(), dco.address);

    // give all reputation to default account
    await reputation.setReputation(accounts[0], 1000);
    await reputation.setReputation(accounts[1], 1000);
    await reputation.setReputation(accounts[2], 1000);

    // create a ballot to mint tokens
    let ballot = await BallotMintTokens.new(dco.address, 1413, accounts[1])

    let ballot_amount = await ballot.amount()
    assert.equal(1413,  ballot_amount.valueOf())
    let ballot_dco = await ballot.dco()

    assert.equal(dco.address,  ballot_dco)

    // before any voee are cast, the "winning proposal" is 0 (i.e. "no")
    assert.equal(await ballot.winningProposal(), 0)

    await ballot.vote(1);
    // check if the vote is registers
    // let voters = await ballot.voters()
    // [accounts[0]]
    // (accounts[0])
    // assert.equal(vote.valueOf(), 1)
    // proposal 1 got only 1/3 of the votes, so it should not pass yet
    let proposal
    proposal = await ballot.winningProposal()
    // assert.equal(proposal.valueOf(), 0)

    // // the fact that accounts[1] votes again should have no effect
    // await ballot.vote(1);
    // proposal = await ballot.winningProposal()
    // assert.equal(proposal.valueOf(), 0)

    // // after a yes vote of accounts[1], we have a winner (i.e 1)
    // await ballot.vote(1, {"from": accounts[1]});
    // proposal = await ballot.winningProposal()
    // assert.equal(proposal.valueOf(), 1)

  })
});
