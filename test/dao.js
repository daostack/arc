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
        let tx = await this.minttokensRecipe.createProposal(this.dao.address, 1413, accounts[1])
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
        await this.dao.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await this.token.balanceOf(accounts[1])
        assert.equal(newBalance.valueOf(), 1413)
    })


    it("test basic workflow (obsolete)", async function() {
        // accounts[2] has no tokens at this point
        let oldBalance = await this.token.balanceOf(accounts[2])
        assert.equal(oldBalance.valueOf(), 0)

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let tx = await this.dao.registerProposalMintTokens(1413, accounts[2])

        // get the proposal action from the transaction
        let proposal = helpers.getProposal(tx)

        // vote for it - 1 will be the winning proposal because we have all the rep
        await proposal.vote(1);

        let w = await proposal.winningChoice()
        assert.equal(w.valueOf(), 1)

        // execute the proposal
        await this.dao.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await this.token.balanceOf(accounts[2])
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
        await this.dao.executeProposal(proposal.address);

        // the number of tokens of accounts[1] should remain unchanged
        // because the proposal was not registered
        let newBalance = await this.token.balanceOf(accounts[3])
        assert.equal(newBalance.valueOf(), 0)
    })

}); 
