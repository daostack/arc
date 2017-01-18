const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('DAO', function(accounts) {
    let reputation, token, dco;

    before(async function(){
        // set up a dco
        reputation = Reputation.deployed()
        token = MintableToken.deployed()
        dco = await DAO.new(reputation.address, token.address);
        await token.transferOwnership(dco.address)
        await reputation.transferOwnership(dco.address)
    })  

    it("test basic workflow", async function() {
            // give all reputation to default account
        await reputation.setReputation(accounts[0], 1000);

        // accounts[1] has no tokens at this point
        let oldBalance = await token.balanceOf(accounts[1])
        assert.equal(oldBalance.valueOf(), 0)

        // (next statement makes transaction return more data, and can be remove
        // once a new version of truffle comes out)
        DAO.next_gen = true;

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let tx = await dco.registerProposalMintTokens(1413, accounts[1])

        // get the proposal action from the transaction
        let proposal = getProposal(tx)

        // vote for it - 1 will be the winning proposal because we have all the rep
        await proposal.vote(1);

        // execute the proposal
        await dco.executeProposal(proposal.address);

        // now accounts[1] should have 1413 tokens
        let newBalance = await token.balanceOf(accounts[1])
        assert.equal(newBalance.valueOf(), 1413)
    })

    it("an unregistered proposal cannot be executed", async function() {
        // give all reputation to default account
        await reputation.setReputation(accounts[0], 1000);

        // accounts[0] has no tokens at this point
        let oldBalance = await token.balanceOf(accounts[2])
        assert.equal(oldBalance.valueOf(), 0)

        // create a proposal to create 1413 tokens and give them to accounts[1]
        let proposal = await ProposalMintTokens.new(dco.address, 1413, accounts[1])

        // vote for it (with all the reputation you have)
        await proposal.vote(1);

        // execute the proposal
        await dco.executeProposal(proposal.address);

        // the number of tokens of accounts[1] should remain unchanged
        // because the proposal was not registered
        let newBalance = await token.balanceOf(accounts[2])
        assert.equal(newBalance.valueOf(), 0)
    })

}); 

function getProposal(tx) {
    // helper function that returns a proposal object from the ProposalCreated event 
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated')
    let proposalAddress = tx.logs[0].args.proposaladdress
    let proposal = Proposal.at(proposalAddress)
    return proposal
}