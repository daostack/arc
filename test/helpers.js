/**
    helpers for tests
*/
var Controller = artifacts.require("./Controller.sol");
var UniversalGenesisScheme = artifacts.require("./UniversalGenesisScheme.sol");
var MintableToken = artifacts.require("./MintableToken.sol");
var Reputation = artifacts.require("./Reputation.sol");


export function getProposalAddress(tx) {
    // helper function that returns a proposal object from the ProposalCreated event 
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated')
    let proposalAddress = tx.logs[0].args.proposaladdress
    return proposalAddress

}


export function getProposal(tx) {
    return Proposal.at(getProposalAddress(tx))
}


export async function etherForEveryone() {
    // give all web3.eth.accounts some ether
    let accounts = web3.eth.accounts;
    for (let i=0; i < 10; i++) {
        await web3.eth.sendTransaction({to: accounts[i], from: accounts[0], value: web3.toWei(0.1, "ether")})
    }
}


export async function forgeOrganization(ctx, founders, tokenForFounders=[1, 2, 4], repForFounders=[7, 100, 12]) {
    let accounts = web3.eth.accounts;
    tokensforeveryone();

    if (founders == undefined) {
        founders = [accounts[0], accounts[1], accounts[2]];
    }
    const universalGenesisScheme = await UniversalGenesisScheme.new()
    const tx = await universalGenesisScheme.forgeOrg(
        "Shoes factory",
        "Shoes",
        "SHO",
        founders,
        tokenForFounders,
        repForFounders,
    );
   
    ctx.founders = founders;
    ctx.universalGenesisScheme = universalGenesisScheme;
    // get the address of the controll from the logs
    const log = tx.logs[0];
    assert.equal(log.event, 'NewOrg');
    ctx.controllerAddress = log.args._controller;
    ctx.controller = Controller.at(ctx.controllerAddress);
    
    // ctx.reputationAddress = await ctx.controllerInstance.nativeReputation();
    // ctx.reputationInstance = Reputation.at(ctx.reputationAddress);
    
    // ctx.tokenAddress = await ctx.controllerInstance.nativeToken();
    // ctx.tokenInstance = MintableToken.at(ctx.tokenAddress);  
}


export const outOfGasMessage = 'VM Exception while processing transaction: out of gas'


export function assertJumpOrOutOfGas(error) {
    let condition = (
        error.message == outOfGasMessage ||
        error.message.search('invalid JUMP') > -1
    ) 
    assert.isTrue(condition, 'Expected an out-of-gas error or an invalid JUMP error:' + error.message);
}


export function assertVMException(error) {
    let condition = (
        error.message.search('VM Exception') > -1
    ) 
    assert.isTrue(condition, 'Expected a VM Exception, got this instead:' + error.message);
}


export function assertJump(error) {
  assert.isAbove(error.message.search('invalid JUMP'), -1, 'Invalid JUMP error must be returned');
}
