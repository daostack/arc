
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

  it("can be instantiated with 'at' if it was already deployed", async function(){
    // first create an organization
    const org1 = await Organization.new({
      orgName: 'Skynet',
      tokenName: 'Tokens of skynet',
      tokenSymbol: 'SNT'
    });
    // then instantiate it with .at
    const org2 = await Organization.at(org1.avatar.address);

    // check if the two orgs are indeed the same
    assert.equal(org1.avatar.address, org2.avatar.address);
    assert.equal(org1.orgName, org2.orgName);
    assert.equal(org1.orgToken, org2.orgToken);
    assert.equal(org1.schemeRegistrar.address, org2.schemeRegistrar.address);
    assert.equal(org1.upgradeScheme.address, org2.upgradeScheme.address);
    assert.equal(org1.globalConstraintRegistrar.addresss, org2.globalConstraintRegistrar.adddress);
    assert.equal(org1.otherSchemes, org2.otherSchemes);
  });

});
