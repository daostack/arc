import { Organization } from '../lib/organization.js';
const helpers = require('./helpers');

// var UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const SimpleContributionScheme = artifacts.require('./SimpleContributionScheme.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

contract('Organization', function(accounts) {

  it("can be created with 'new' using default settings", async function(){
    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT'
    });
    // an organization has an avatar
    assert.ok(organization.avatar, 'Organization must have an avatar defined');
  });

  it("can be instantiated with 'at' if it was already deployed (TO DO)", async function(){
    // first create an organization
    const organization = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT'
    });

    // then instantiate it with .at
    // Organization.at(org.avatar.address);

  });


});
