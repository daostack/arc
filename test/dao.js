const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('DAO', function(accounts) {

    beforeEach(async function(){
        // set up a dao
        await helpers.setupDAO(this)
    })  

    it("test token minting", async function() {
        // use the MintTokensRecipe to create a new proposal
        // to give 1413 tokens to accounts[1]
        let tx = await this.minttokensRecipe.createProposal(1413, accounts[1])
        let proposal = helpers.getProposal(tx)
 

        // accounts[1] has no tokens at this point
        let oldBalance = await this.token.balanceOf(accounts[1])
        assert.equal(oldBalance.valueOf(), 0)

        // vote yes
        await proposal.vote(1);

        // the proposal will be accepted because default account has all rep
        let w = await proposal.winningChoice()
        assert.equal(w.valueOf(), 1)

        // execute the proposal
        await this.minttokensRecipe.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await this.token.balanceOf(accounts[1])
        assert.equal(newBalance.valueOf(), 1413)
    })

    it("test reputation minting", async function() {
        // use the MintReputationRecipe to create a new proposal
        // to give 1413 new rep to accounts[1]
        let tx = await this.mintreputationRecipe.createProposal(1413, accounts[1])
        let proposal = helpers.getProposal(tx)
 

        // accounts[1] has no tokens at this point
        let oldBalance = await this.reputation.reputationOf(accounts[1])
        assert.equal(oldBalance.valueOf(), 0)

        // vote yes
        await proposal.vote(1);

        // the proposal will be accepted because default account has all rep
        let w = await proposal.winningChoice()
        assert.equal(w.valueOf(), 1)

        // execute the proposal
        await this.mintreputationRecipe.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await this.reputation.reputationOf(accounts[1])
        assert.equal(newBalance.valueOf(), 1413)
    })

    it("an unregistered proposal should not be executed", async function() {
        // accounts[0] has no tokens at this point
        let oldBalance = await this.token.balanceOf(accounts[3])
        assert.equal(oldBalance.valueOf(), 0)

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let proposal = await ProposalMintTokens.new(this.dao.address, 1413, accounts[1])

        // vote for it (with all the reputation you have)
        await proposal.vote(1);

        // execute the proposal
        await proposal.executeDecision();

        // the number of tokens of accounts[1] should remain unchanged
        // because the proposal was not registered
        let newBalance = await this.token.balanceOf(accounts[3])
        assert.equal(newBalance.valueOf(), 0)
    })

}); 
