const helpers = require('./helpers');

import { Organization } from '../lib/organization.js';

const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const TokenCapGC = artifacts.require("./TokenCapGC.sol");

import { getValueFromLogs } from '../lib/utils.js';
import { daostack } from '../lib/daostack.js';

contract('GlobalConstraintRegistrar', function(accounts) {
  let tx;

  before(function() {
    helpers.etherForEveryone();
  });

  it("should be able to put contraints on the total amount of mintable token [IN PROGRESS]", async function() {
    // creatorganization
    const founders = [
      {
        address: web3.eth.accounts[0],
        reputation: 1,
        tokens: 1,
      },
      {
        address: web3.eth.accounts[1],
        reputation: 29,
        tokens: 2,
      },
      {
        address: web3.eth.accounts[2],
        reputation: 70,
        tokens: 3,
      },
    ];
    const options = {
      orgName: 'something',
      tokenName: 'token name',
      tokenSymbol: 'TST',
      founders
    };
    const organization = await Organization.new(options);

    // do some sanity checks on the globalconstriantregistrar
    const gcr = await organization.globalConstraintRegistrar();
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

    // the voting machine used in this GCR is the same as the voting machine of the organization
    assert.equal(organization.votingMachine.address, parametersForVotingInGCR[1]);
    // while the voteRegisterParams are known on the voting machine
    // and consist of [reputationSystem address, treshold percentage]
    const voteRegisterParams = await organization.votingMachine.parameters(parametersForVotingInGCR[0]);

    const msg = "These parameters are not known the voting machine...";
    assert.notEqual(voteRegisterParams[0], '0x0000000000000000000000000000000000000000', msg);
    tx = await gcr.proposeGlobalConstraint(organization.avatar.address, tokenCapGC.address, tokenCapGCParamsHash, votingMachineHash);

    // check if the proposal is known on the GlobalConstraintRegistrar
    const proposalId = getValueFromLogs(tx, 'proposalId');
    const proposal = await gcr.proposals(proposalId);
    // the proposal looks like gc-address, params, proposaltype, removeParams
    assert.equal(proposal[0], tokenCapGC.address);

    // TODO: the voting machine should be taken from the address at parametersForVotingInGCR[1]
    const votingMachine = organization.votingMachine;
    // first vote (minority)
    tx = await votingMachine.vote(proposalId, true, web3.eth.accounts[1], {from: web3.eth.accounts[1]});
    // and this is the majority vote (which will also call execute on the executable
    tx = await votingMachine.vote(proposalId, true, web3.eth.accounts[2], {from: web3.eth.accounts[2]});

    // at this point, our global constrait has been registered at the organization
    assert.equal((await organization.controller.globalConstraintsCount()).toNumber(), 1);
    // get the first global constraint
    const gc = await organization.controller.globalConstraints(0);
    const params = await organization.controller.globalConstraintsParams(0);
    // see which global constraints are satisfied
    assert.equal(gc, tokenCapGC.address);
    assert.equal(params, tokenCapGCParamsHash);

  });

  it("the daostack.createGlobalConstraintRegistrar function should work as expected with the default parameters", async function() {
    // create a schemeRegistrar
    const registrar = await daostack.createGlobalConstraintRegistrar();

    // because the registrar is constructed without a token address, it should have
    // created a new MintableToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    const token = await MintableToken.at(tokenAddress);
    const accounts = web3.eth.accounts;
    let balance;
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 0);
    await token.mint(1000 * Math.pow(10, 18), web3.eth.accounts[0]);
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 1000 * Math.pow(10, 18));
  });

  it("the daostack.createGlobalConstraintRegistrar function should work as expected with specific parameters", async function() {
    // create a schemeRegistrar, passing some options
    const token = await MintableToken.new();

    const registrar = await daostack.createGlobalConstraintRegistrar({
        tokenAddress:token.address,
        fee: 3e18,
        beneficiary: accounts[1]
    });

    // because the registrar is constructed without a token address, it should have
    // created a new MintableToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    assert.equal(tokenAddress, token.address);
    const fee = await registrar.fee();
    assert.equal(fee, 3e18);
    const beneficiary = await registrar.beneficiary();
    assert.equal(beneficiary, accounts[1]);
  });
});
