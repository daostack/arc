/**
    helpers for tests
*/
const Controller = artifacts.require("./Controller.sol");
const UniversalGenesisScheme = artifacts.require("./UniversalGenesisScheme.sol");
const UniversalSchemeRegister = artifacts.require("./UniversalSchemeRegister.sol");
const UniversalUpgradeScheme = artifacts.require("./UniversalUpgradeScheme.sol");
const UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const UniversalGCRegister = artifacts.require("./UniversalGCRegister.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const BasicToken = artifacts.require("./BasicToken.sol");
const Reputation = artifacts.require("./Reputation.sol");


export function getProposalAddress(tx) {
    // helper function that returns a proposal object from the ProposalCreated event 
    // in the logs of tx
    assert.equal(tx.logs[0].event, 'ProposalCreated')
    const proposalAddress = tx.logs[0].args.proposaladdress
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


async function createSchemeRegister() {
    const token = await BasicToken.new();
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return UniversalSchemeRegister.new(token.address, fee, beneficary);
}


async function createUpgradeScheme() {
    const token = await BasicToken.new();
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return UniversalUpgradeScheme.new(token.address, fee, beneficary);
}


async function createGCRegister() {
    const token = await BasicToken.new();
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return UniversalGCRegister.new(token.address, fee, beneficary);
}


export async function forgeOrganization(
    ctx, 
    founders, 
    tokenForFounders=[1, 2, 4], 
    repForFounders=[7, 100, 12]
) {
    const accounts = web3.eth.accounts;
    etherForEveryone();

    if (founders == undefined) {
        founders = [accounts[0], accounts[1], accounts[2]];
    }
    const universalGenesisSchemeInst = await UniversalGenesisScheme.new()
    const tx = await universalGenesisSchemeInst.forgeOrg(
        "Shoes factory",
        "Shoes",
        "SHO",
        founders,
        tokenForFounders,
        repForFounders,
    );
   
    ctx.founders = founders;
    ctx.universalGenesisScheme = universalGenesisSchemeInst;
    // get the address of the controll from the logs
    const log = tx.logs[0];
    ctx.controllerAddress = log.args._controller;
    const controller = await Controller.at(ctx.controllerAddress);
    ctx.controller = controller;

    const universalSchemeRegisterInst = await createSchemeRegister();
    const universalUpgradeSchemeInst = await createUpgradeScheme(); 
    const universalGCRegisterInst = await createGCRegister();
    const universalSimpleVoteInst = await UniversalSimpleVote.new();

    const tokenAddress = await controller.nativeToken();
    const reputationAddress = await controller.nativeReputation();

    const votePrec = 50;
    const voteParametersHash = await universalSimpleVoteInst.hashParameters(reputationAddress, votePrec);
    const schemeRegisterParams = await universalSchemeRegisterInst.parametersHash(voteParametersHash, voteParametersHash, universalSimpleVoteInst.address);
    const schemeGCRegisterParams = await universalGCRegisterInst.parametersHash(voteParametersHash, universalSimpleVoteInst.address);
    const schemeUpgradeParams = await universalUpgradeSchemeInst.parametersHash(voteParametersHash, universalSimpleVoteInst.address);
 
    await universalGenesisSchemeInst.setInitialSchemes(
        ctx.controllerAddress,
        universalSchemeRegisterInst.address,
        universalUpgradeSchemeInst.address,
        universalGCRegisterInst.address,
        schemeRegisterParams,
        schemeUpgradeParams,
        schemeGCRegisterParams
    );
    return ctx.controller;
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
