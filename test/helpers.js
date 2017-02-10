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

async function setupController(ctx, founders, tokenForFounders=[1, 2, 4], repForFounders=[7, 100, 12]) {
    let accounts = web3.eth.accounts;

    if (founders == undefined) {
        founders = [accounts[0],accounts[1],accounts[2]];
    }
    
    let votingScheme = await SimpleVote.new();
    
    let genesis = await GenesisScheme.new("Shoes factory",
                                          "SHOE",
                                          founders,
                                          tokenForFounders,
                                          repForFounders,
                                          votingScheme.address);
    
    for (let i = 0 ; i < founders.length ; i++ ) {
       await genesis.collectFoundersShare({'from': founders[i]});
    }
    
    ctx.founders = founders
    ctx.genesis = genesis;
    ctx.controllerAddress = await genesis.controller();
    ctx.controllerInstance = Controller.at(ctx.controllerAddress);
    
    ctx.reputationAddress = await ctx.controllerInstance.nativeReputation();
    ctx.reputationInstance = Reputation.at(ctx.reputationAddress);
    
    ctx.tokenAddress = await ctx.controllerInstance.nativeToken();
    ctx.tokenInstance = MintableToken.at(ctx.tokenAddress);  
}

module.exports.setupController = setupController



let outOfGasMessage = 'VM Exception while processing transaction: out of gas'
module.exports.outOfGasMessage = outOfGasMessage

module.exports.assertJumpOrOutOfGas = function(error) {
    let condition = (
        error.message == outOfGasMessage ||
        error.message.search('invalid JUMP') > -1
    ) 
    assert.isTrue(condition, 'Expected an out-of-gas error or an invalid JUMP error')
}

