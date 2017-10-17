import * as helpers from './helpers';
import { Organization } from '../lib/organization.js';
import { getSettings } from '../lib/settings.js';
import { getValueFromLogs } from '../lib/utils.js';
const Controller = artifacts.require("./Controller.sol");
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');


contract('UpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });

  it('upgrade should work as expected', async function() {
    const founders = [
      {
        address: accounts[0],
        reputation: 30,
        tokens: 30,
      },
      {
        address: accounts[1],
        reputation: 70,
        tokens: 70,
      }
    ];
    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT',
      founders,
    });

    const upgradeScheme = await organization.scheme('UpgradeScheme');
    const settings = await getSettings();
    const votingMachine = AbsoluteVote.at(settings.votingMachine);

    // the organization has not bene upgraded yet, so newController is the NULL address
    assert.equal(await organization.controller.newController(), helpers.NULL_ADDRESS);

    // we create a new controller to upgrade to
    const newController = await Controller.new(null, null, null, [], [], []);
    let tx = await upgradeScheme.proposeUpgrade(organization.avatar.address, newController.address);

    const proposalId = getValueFromLogs(tx, '_proposalId');
    // now vote with the majority for the proposal
    tx = await votingMachine.vote(proposalId, 1, accounts[1], {from: accounts[1]});

    // now the ugprade should have been executed
    assert.equal(await organization.controller.newController(), newController.address);

    // avatar, token and reputation ownership shold have been transferred to the new controller
    assert.equal(await organization.token.owner(), newController.address);
    assert.equal(await organization.reputation.owner(), newController.address);
    assert.equal(await organization.avatar.owner(), newController.address);

    // TODO: we also want to reflect this upgrade in our Controller object!
  });

});
