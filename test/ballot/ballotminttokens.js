contract('ProposalMintTokens', function(accounts) {
    it("should respect basic sanity", async function() {
        let reputation = Reputation.deployed()
        let token = MintableToken.deployed()
        let dco = await DAO.new(reputation.address, token.address);

        // give the dco the ownership of the token
        await token.transferOwnership(dco.address)
        assert.equal(await token.owner(), dco.address);

        // give all reputation to default account
        await reputation.setReputation(accounts[0], 1000);
        await reputation.setReputation(accounts[1], 1000);
        await reputation.setReputation(accounts[2], 1000);

        // create a proposal to mint tokens
        let proposal = await ProposalMintTokens.new(dco.address, 1413, accounts[1])

        let proposal_amount = await proposal.amount()
        assert.equal(1413,  proposal_amount.valueOf())
        let proposal_dco = await proposal.dco()

        assert.equal(dco.address,  proposal_dco)

        // before any voee are cast, the "winning proposal" is 0 (i.e. "no")
        assert.equal(await proposal.winningChoice(), 0)

        await proposal.vote(1);

        // proposal 1 got only 1/3 of the votes, so it should not pass yet
        let outcome
        outcome = await proposal.winningChoice()
        assert.equal(outcome.valueOf(), 0)

        // after a yes vote of accounts[1], we have a winner (i.e 1)
        await proposal.vote(1, {"from": accounts[1]});
        outcome = await proposal.winningChoice()
        assert.equal(outcome.valueOf(), 1)
    })
});
