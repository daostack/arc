function getProposalAddress(tx) {

    // helper function that returns a proposal object from the ProposalCreated event 
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated')
    let proposalAddress = tx.logs[0].args.proposaladdress
    return proposalAddress

}
function getProposal(tx) {
    return Proposal.at(getProposalAddress(tx))
}

module.exports.getProposal = getProposal
module.exports.getProposalAddress = getProposalAddress

async function setupDAO(ctx) {
    // set up a DAO from scratch
    // (this procedure should be simplified)

    let reputation = await Reputation.new()
    await reputation.setReputation(1000, web3.eth.accounts[0]);
    let token = await MintableToken.new()
    let dao = await DAO.new(reputation.address, token.address);
    await token.transferOwnership(dao.address)
    await reputation.transferOwnership(dao.address)

    let minttokensRecipe = await ProposalMintTokensRecipe.new(dao.address)
    await dao.registerRecipe(minttokensRecipe.address)

    let mintreputationRecipe = await ProposalMintReputationRecipe.new(dao.address)
    await dao.registerRecipe(mintreputationRecipe.address)

    // we finished configuring the DAO, we can now transfer ownership to itself
    await dao.transferOwnership(dao.address)
 
    // make variables available in the context
    ctx.token = token
    ctx.reputation = reputation
    ctx.dao = dao
    ctx.minttokensRecipe = minttokensRecipe
    ctx.mintreputationRecipe = mintreputationRecipe

    // next statement makes truffle return more data with transactions, 
    // and can be removed once a new version of truffle comes out)
    DAO.next_gen = true
    ProposalMintTokensRecipe.next_gen = true
    ProposalMintReputationRecipe.next_gen = true
}

module.exports.setupDAO = setupDAO