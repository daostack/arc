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