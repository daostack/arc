import { Organization } from '../lib/organization.js';
const helpers = require('./helpers')

// var UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const SimpleContributionScheme = artifacts.require('./SimpleContributionScheme.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

contract('Organization', function(accounts) {

  it("New Organization constructor", async function(){
    const testSettings = await helpers.settingsForTest();
    const opts = {
      genesisScheme: testSettings.genesisScheme,
    }
    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT'
    });
    // an organization has an avatar
    assert.ok(organization.avatar, 'Organization must have an avatar defined');

  });

});
