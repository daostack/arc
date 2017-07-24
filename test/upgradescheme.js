import * as helpers from './helpers';
import { Organization } from '../lib/organization.js';
import { getSettings } from '../lib/settings.js';
import { getValueFromLogs } from '../lib/utils.js';
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Controller = artifacts.require("./Controller.sol");
const SimpleVote = artifacts.require('./SimpleVote.sol');


contract('UpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });

  it('upgrade should work as expected', async function() {
    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT',
      founders: [accounts[0], accounts[1]],
      repForFounders: [30, 70],
      tokensForFounders: [30, 70],
    });

    const upgradeScheme = await organization.upgradeScheme();
    const settings = await getSettings();
    const votingMachine = SimpleVote.at(settings.votingMachine);

    // the organization has not bene upgraded yet, so newController is the NULL address
    assert.equal(await organization.controller.newController(), helpers.NULL_ADDRESS);

    // we create a new controller to upgrade to
    const newController = await Controller.new(null, null, null, [], [], []);
    let tx = await upgradeScheme.proposeUpgrade(organization.avatar.address, newController.address);

    const proposalId = getValueFromLogs(tx, 'proposalId');
    // now vote with the majority for the proposal
    tx = await votingMachine.vote(proposalId, true, accounts[1], {from: accounts[1]});

    // now the ugprade should have been executed
    assert.equal(await organization.controller.newController(), newController.address);

    // avatar, token and reputation ownership shold have been transferred to the new controller
    assert.equal(await organization.token.owner(), newController.address);
    assert.equal(await organization.reputation.owner(), newController.address);
    assert.equal(await organization.avatar.owner(), newController.address);

    // TODO: we also want to reflect this upgrade in our Controller object!
  });

});
