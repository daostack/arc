const helpers = require('../helpers')

contract('ProposalMintReputation', function(accounts) {

    it("should respect basic sanity", async function() {
        let reputation = Reputation.deployed()
        let token = MintableToken.deployed()
        DAO.next_gen = true;
        let dao = await DAO.new(reputation.address, token.address);

        // give the dao the ownership of the token
        await token.transferOwnership(dao.address)
        assert.equal(await token.owner(), dao.address);
        await reputation.setReputation(1000, accounts[0]);
        await reputation.setReputation(1000, accounts[1]);
        await reputation.setReputation(1000, accounts[2]);


        // create a proposal to mint tokens
        let tx = await dao.registerProposalMintReputation(1413, accounts[1])

        let proposal = ProposalMintReputation.at(helpers.getProposalAddress(tx))

        let proposal_amount = await proposal.amount()
        assert.equal(1413,  proposal_amount.valueOf())
        let proposal_dao = await proposal.dao()
        assert.equal(dao.address,  proposal_dao)

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

        dao.executeProposal(proposal.address)

        // now accounts[1]'s rep should be 1413  
        // TODO: fix this test!
        // assert.equal(await reputation.reputationOf(accounts[1]), 1413)

    })
});
