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

import { daostack } from '../lib/daostack.js';


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


function createUpgradeScheme() {
    return daostack.createUpgradeScheme();
}

export async function forgeOrganization(opts = {}) {
    await etherForEveryone();
    const org = await daostack.forgeOrganization(opts);
    return org;
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
