/**
    helpers for tests
*/
const Controller = artifacts.require("./Controller.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
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


export async function createSchemeRegistrar() {
    const token = await MintableToken.new('schemeregistrartoken', 'SRT');
    await token.mint(1000 * Math.pow(10, 18), web3.eth.accounts[0]);
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return SchemeRegistrar.new(token.address, fee, beneficary);
}


async function createUpgradeScheme() {
    const token = await MintableToken.new('upgradeSchemeToken', 'UST');
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return UpgradeScheme.new(token.address, fee, beneficary);
}


async function createGCRegister() {
    const token = await MintableToken.new('gcregistertoken', 'GCT');
    const fee = 3;
    const beneficary = web3.eth.accounts[1];
    return GlobalConstraintRegistrar.new(token.address, fee, beneficary);
}


export async function forgeOrganization(
    opts = {},
    ctx, 
) {
    etherForEveryone();
    const accounts = web3.eth.accounts;
    const defaults = {
        founders: [accounts[0], accounts[1], accounts[2]],
        tokensForFounders: [1, 2, 3],
        repForFounders: [5, 8, 13],
    }

    const options = Object.assign({}, defaults, opts);

    const universalGenesisSchemeInst = await GenesisScheme.new()
    const tx = await universalGenesisSchemeInst.forgeOrg(
        "Shoes factory",
        "Shoes",
        "SHO",
        options.founders,
        options.tokensForFounders,
        options.repForFounders,
    );
   
    ctx.founders = options.founders;
    ctx.GenesisScheme = universalGenesisSchemeInst;
    // get the address of the controll from the logs
    const log = tx.logs[0];
    ctx.controllerAddress = log.args._controller;
    const controller = await Controller.at(ctx.controllerAddress);
    ctx.controller = controller;

    const schemeRegistrarInst = await createSchemeRegistrar();
    const universalUpgradeSchemeInst = await createUpgradeScheme(); 
    const universalGCRegisterInst = await createGCRegister();
    const simpleVoteInst = await UniversalSimpleVote.new();

    const tokenAddress = await controller.nativeToken();
    const reputationAddress = await controller.nativeReputation();

    const votePrec = 50;
    const voteParametersHash = await simpleVoteInst.hashParameters(reputationAddress, votePrec);
    const schemeRegisterParams = await schemeRegistrarInst.parametersHash(voteParametersHash, voteParametersHash, simpleVoteInst.address);
    const schemeGCRegisterParams = await universalGCRegisterInst.parametersHash(voteParametersHash, simpleVoteInst.address);
    const schemeUpgradeParams = await universalUpgradeSchemeInst.parametersHash(voteParametersHash, simpleVoteInst.address);
 
    await universalGenesisSchemeInst.setInitialSchemes(
        ctx.controllerAddress,
        schemeRegistrarInst.address,
        universalUpgradeSchemeInst.address,
        universalGCRegisterInst.address,
        schemeRegisterParams,
        schemeUpgradeParams,
        schemeGCRegisterParams
    );
    ctx.schemeregistrar = schemeRegistrarInst;
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
