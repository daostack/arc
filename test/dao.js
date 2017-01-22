const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('DAO', function(accounts) {
    let reputation, token, dao, mintabletokenfactory;

    before(async function(){
        // set up a dao
        reputation = await Reputation.new()
        token = await MintableToken.new()
        dao = await DAO.new(reputation.address, token.address);

        await token.transferOwnership(dao.address)
        await reputation.transferOwnership(dao.address)

       
        // (next statement makes transaction return more data, and can be removed
        // once a new version of truffle comes out)
        DAO.next_gen = true
        ProposalMintTokensFactory.next_gen = true
    })  

    it("test minting with a factory", async function() {
        mintabletokenfactory = await ProposalMintTokensFactory.new(dao.address)
        await dao.registerFactory(mintabletokenfactory.address)
        // we finished configuring the DAO, we can now transfer ownership to itself
        await dao.transferOwnership(dao.address)
 
        // we can now use the factory to create a new proposal
        // to give 1413 tokens to accounts[1]
        let tx = await mintabletokenfactory.createProposal(dao.address, 1413, accounts[1])
        let proposal = helpers.getProposal(tx)
 
        await reputation.setReputation(1000, accounts[0]);

        // accounts[1] has no tokens at this point
        let oldBalance = await token.balanceOf(accounts[1])
        assert.equal(oldBalance.valueOf(), 0)

        // vote yes
        await proposal.vote(1);

        // the proposal will be accepted because default account has all rep
        let w = await proposal.winningChoice()
        assert.equal(w.valueOf(), 1)

        // execute the proposal
        await dao.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await token.balanceOf(accounts[1])
        assert.equal(newBalance.valueOf(), 1413)
    })


    it("test basic workflow", async function() {
        // give all reputation to default account
        await reputation.setReputation(1000, accounts[0]);

        // accounts[2] has no tokens at this point
        let oldBalance = await token.balanceOf(accounts[2])
        assert.equal(oldBalance.valueOf(), 0)

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let tx = await dao.registerProposalMintTokens(1413, accounts[2])

        // get the proposal action from the transaction
        let proposal = helpers.getProposal(tx)

        // vote for it - 1 will be the winning proposal because we have all the rep
        await proposal.vote(1);

        let w = await proposal.winningChoice()
        assert.equal(w.valueOf(), 1)

        // execute the proposal
        await dao.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await token.balanceOf(accounts[2])
        assert.equal(newBalance.valueOf(), 1413)
    })

    it("an unregistered proposal should not be executed", async function() {
        // give all reputation to default account
        await reputation.setReputation(1000, accounts[0]);

        // accounts[0] has no tokens at this point
        let oldBalance = await token.balanceOf(accounts[3])
        assert.equal(oldBalance.valueOf(), 0)

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let proposal = await ProposalMintTokens.new(dao.address, 1413, accounts[1])

        // vote for it (with all the reputation you have)
        await proposal.vote(1);

        // execute the proposal
        await dao.executeProposal(proposal.address);

        // the number of tokens of accounts[1] should remain unchanged
        // because the proposal was not registered
        let newBalance = await token.balanceOf(accounts[3])
        assert.equal(newBalance.valueOf(), 0)
    })

}); 
