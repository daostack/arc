const helpers = require('./helpers');

import { GlobalConstraintRegistrar } from '../lib/globalconstraintregistrar.js';

const DAOToken = artifacts.require("./DAOToken.sol");
const TokenCapGC = artifacts.require("./TokenCapGC.sol");

import { getValueFromLogs } from '../lib/utils.js';

contract('GlobalConstraintRegistrar', function(accounts) {
  let tx, proposalId;

  before(function() {
    helpers.etherForEveryone();
  });

  it("proposeToAddModifyGlobalConstraint javascript wrapper should work", async function() {
    const organization = await helpers.forgeOrganization();

    let tokenCapGC = await organization.scheme('TokenCapGC');

    let globalConstraintParametersHash = await tokenCapGC.getParametersHash(organization.token.address,3141);
    await tokenCapGC.setParameters(organization.token.address,3141);

    let votingMachineHash = await organization.votingMachine.getParametersHash(organization.reputation.address, 50, true);
    await organization.votingMachine.setParameters(organization.reputation.address, 50, true);

    let globalConstraintRegistrar = await organization.scheme('GlobalConstraintRegistrar');

    await globalConstraintRegistrar.proposeToAddModifyGlobalConstraint({
      avatar: organization.avatar.address,
      globalConstraint: tokenCapGC.address,
      globalConstraintParametersHash: globalConstraintParametersHash,
      votingMachineHash: votingMachineHash
    });

    // const proposalId = getValueFromLogs(tx, '_proposalId');

    // console.log(`****** proposal ID ${proposalId} ******`);
  });

  //   it("proposeToRemoveGlobalConstraint javascript wrapper should not crash", async function() {
  //   const organization = await helpers.forgeOrganization();

  //   let tokenCapGC = await organization.scheme('TokenCapGC');

  //   let globalConstraintRegistrar = await organization.scheme('GlobalConstraintRegistrar');

  //   await globalConstraintRegistrar.proposeToRemoveGlobalConstraint({
  //     avatar: organization.avatar.address,
  //     globalConstraint: tokenCapGC.address
  //   });

  //   // const proposalId = getValueFromLogs(tx, '_proposalId');

  //   // console.log(`****** proposal ID ${proposalId} ******`);
  // });

  it("should register and enforce a global constraint", async function() {
    const organization = await helpers.forgeOrganization();

    let tokenCapGC = await organization.scheme('TokenCapGC');
    let globalConstraintParametersHash = await tokenCapGC.getParametersHash(organization.token.address,3141);
    await tokenCapGC.setParameters(organization.token.address,3141);

    let votingMachineHash = await organization.votingMachine.getParametersHash(organization.reputation.address, 50, true);
    await organization.votingMachine.setParameters(organization.reputation.address, 50, true);

    let globalConstraintRegistrar = (await organization.scheme('GlobalConstraintRegistrar')).contract;

    let tx = await globalConstraintRegistrar.proposeGlobalConstraint(
      organization.avatar.address,
      tokenCapGC.address,
      globalConstraintParametersHash,
      votingMachineHash
    );

    const proposalId = getValueFromLogs(tx, '_proposalId');

    // console.log(`****** proposal ID ${proposalId} ******`);

    // serveral users now cast their vote
    await organization.vote(proposalId, 1, {from: web3.eth.accounts[0]});
    // next is decisive vote: the proposal will be executed
    await organization.vote(proposalId, 1, {from: web3.eth.accounts[2]});

    // now the tokencap is enforced: up to 3141 tokens
    // minting 1111 tokens should be fine
    // TODO: this is complex: we must create a proposal to mint these tokens and accept that
    // proposalId = await organization.proposeScheme('ContributionScheme');
    // await organization.vote(proposalId, true, {from: web3.eth.accounts[2]});

  // minting 9999 tokens should be out

  });

  it("should satisfy a number of basic checks", async function() {
    const organization = await helpers.forgeOrganization();

    // do some sanity checks on the globalconstriantregistrar
    const gcr = (await organization.scheme('GlobalConstraintRegistrar')).contract;
    // check if our organization is registered on the gcr
    assert.equal(await gcr.isRegistered(organization.avatar.address), true);
    // check if indeed the registrar is registered as a scheme on  the controller
    assert.equal(await organization.controller.isSchemeRegistered(gcr.address), true);
    // Organization.new standardly registers no global constraints
    assert.equal((await organization.controller.globalConstraintsCount()).toNumber(), 0);

    // create a new global constraint - a TokenCapGC instance
    const tokenCapGC = await TokenCapGC.new();
    // register paramets for setting a cap on the nativeToken of our organization of 21 million
    await tokenCapGC.setParameters(organization.token.address, 21e9);
    const tokenCapGCParamsHash = await tokenCapGC.getParametersHash(organization.token.address, 21e9);

    // next line needs some real hash for the conditions for removing this scheme
    const votingMachineHash = tokenCapGCParamsHash;

    // to propose a global constraint we need to make sure the relevant hashes are registered
    // in the right places:
    const parametersForGCR = await organization.controller.getSchemeParameters(gcr.address);
    // parametersForVotingInGCR are (voteRegisterParams (a hash) and boolVote)
    const parametersForVotingInGCR = await gcr.parameters(parametersForGCR);

    // the info we just got consists of paramsHash and permissions
    const gcrPermissionsOnOrg = await organization.controller.getSchemePermissions(gcr.address);
    assert.equal(gcrPermissionsOnOrg, '0x00000005');

    // the voting machine used in this GCR is the same as the voting machine of the organization
    assert.equal(organization.votingMachine.address, parametersForVotingInGCR[1]);
    // while the voteRegisterParams are known on the voting machine
    // and consist of [reputationSystem address, treshold percentage]
    const voteRegisterParams = await organization.votingMachine.parameters(parametersForVotingInGCR[0]);

    const msg = "These parameters are not known the voting machine...";
    assert.notEqual(voteRegisterParams[0], '0x0000000000000000000000000000000000000000', msg);
    tx = await gcr.proposeGlobalConstraint(organization.avatar.address, tokenCapGC.address, tokenCapGCParamsHash, votingMachineHash);

    // check if the proposal is known on the GlobalConstraintRegistrar
    proposalId = getValueFromLogs(tx, '_proposalId');
    // TODO: read the proposal in the contract:
    // const proposal = await gcr.proposals(proposalId);
    // // the proposal looks like gc-address, params, proposaltype, removeParams
    // assert.equal(proposal[0], tokenCapGC.address);

    // TODO: the voting machine should be taken from the address at parametersForVotingInGCR[1]
    const votingMachine = organization.votingMachine;
    // first vote (minority)
    tx = await votingMachine.vote(proposalId, 1, {from: web3.eth.accounts[1]});
    // and this is the majority vote (which will also call execute on the executable
    tx = await votingMachine.vote(proposalId, 1, {from: web3.eth.accounts[2]});

    // at this point, our global constrait has been registered at the organization
    assert.equal((await organization.controller.globalConstraintsCount()).toNumber(), 1);
    return;
    // // get the first global constraint
    // const gc = await organization.controller.globalConstraints(0);
    // const params = await organization.controller.globalConstraintsParams(0);
    // // see which global constraints are satisfied
    // assert.equal(gc, tokenCapGC.address);
    // assert.equal(params, tokenCapGCParamsHash);
  });

  it("the GlobalConstraintRegistrar.new() function should work as expected with the default parameters", async function() {
    // create a schemeRegistrar
    const registrar = await GlobalConstraintRegistrar.new();

    const tokenAddress = await registrar.nativeToken();
    assert.isOk(tokenAddress);
    const fee = await registrar.fee();
    assert.equal(fee, 0);
    // the sender is the beneficiary
    const beneficiary = await registrar.beneficiary();
    assert.equal(beneficiary, accounts[0]);
  });

  it("the GlobalConstraintRegistrar.new() function should work as expected with specific parameters", async function() {
    // create a schemeRegistrar, passing some options
    const token = await DAOToken.new();

    const registrar = await GlobalConstraintRegistrar.new({
        tokenAddress:token.address,
        fee: 3e18,
        beneficiary: accounts[1]
    });

    const tokenAddress = await registrar.nativeToken();
    assert.equal(tokenAddress, token.address);
    const fee = await registrar.fee();
    assert.equal(fee, 3e18);
    const beneficiary = await registrar.beneficiary();
    assert.equal(beneficiary, accounts[1]);
  });

  it('organisation.proposalGlobalConstraint() should accept different parameters [TODO]', async function(){
    const organization = await helpers.forgeOrganization();

    let tokenCapGC = await organization.scheme('TokenCapGC');

    let globalConstraintParametersHash = await tokenCapGC.getParametersHash(organization.token.address,21e9);
    await tokenCapGC.setParameters(organization.token.address,21e9);

    let votingMachineHash = await organization.votingMachine.getParametersHash(organization.reputation.address, 50, true);
    await organization.votingMachine.setParameters(organization.reputation.address, 50, true);

    let globalConstraintRegistrar = (await organization.scheme('GlobalConstraintRegistrar')).contract;

    let tx = await globalConstraintRegistrar.proposeGlobalConstraint(
      organization.avatar.address,
      tokenCapGC.address,
      globalConstraintParametersHash,
      votingMachineHash
    );

    let proposalId = getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // proposalId = await organization.proposeGlobalConstraint({
    //   contract: 'TokenCapGC',
    //   paramsHash: tokenCapGCParamsHash,
    // });
    //
    // assert.isOk(proposalId);

    globalConstraintParametersHash = await tokenCapGC.getParametersHash(organization.token.address, 1234);
    await tokenCapGC.setParameters(organization.token.address, 1234);

    votingMachineHash = await organization.votingMachine.getParametersHash(organization.reputation.address, 1, false);
    await organization.votingMachine.setParameters(organization.reputation.address, 1, false);

    tx = await globalConstraintRegistrar.proposeGlobalConstraint(
      organization.avatar.address,
      tokenCapGC.address,
      globalConstraintParametersHash,
      votingMachineHash
    );

    proposalId = getValueFromLogs(tx, '_proposalId');

    assert.isOk(proposalId);

    // // we can also register an 'anonymous' constraint
    // const tokenCapGC = await TokenCapGC.new();
    // const tokenCapGCParamsHash = await tokenCapGC.setParameters(organization.token.address, 3000);
    //
    // proposalId = await organization.proposeGlobalConstraint({
    //   address: tokenCapGC.address,
    //   paramsHash: tokenCapGCParamsHash,
    // });
    //
    // assert.isOk(proposalId);


  });
});
