
import { Organization } from '../lib/organization.js';
const helpers = require('./helpers');

// var UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const SimpleContributionScheme = artifacts.require('./SimpleContributionScheme.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

contract('Organization', function(accounts) {

  before(function() {
    helpers.etherForEveryone();
  });

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
    const schemeRegistrar1 = await org1.schemeRegistrar();
    const schemeRegistrar2 = await org2.schemeRegistrar();
    assert.equal(schemeRegistrar1.address, schemeRegistrar2.address);
    const upgradeScheme1 = await org1.upgradeScheme();
    const upgradeScheme2 = await org2.upgradeScheme();
    assert.equal(upgradeScheme1.address, upgradeScheme2.address);
    const globalConstraintRegistrar1 = await org1.globalConstraintRegistrar();
    const globalConstraintRegistrar2 = await org2.globalConstraintRegistrar();
    assert.equal(globalConstraintRegistrar1.address, globalConstraintRegistrar2.address);

  });
  //
  it("has a working proposeScheme function [TO DO]", async function(){
  //   const organization = await Organization.new({
  //     orgName: 'Skynet',
  //     tokenName: 'Tokens of skynet',
  //     tokenSymbol: 'SNT'
  //   });
  //   //
  //   // await organization.proposeScheme({
  //   //   schemeType: 'SimpleICO',
  //   //   cap: 100, // uint cap; // Cap in Eth
  //   //   price: .001, // uint price; // Price represents Tokens per 1 Eth
  //   //   startBlock: 5,// uint startBlock;
  //   //   endBlock: 10, // uint endBlock;
  //   //   admin: accounts[3], // address admin; // The admin can halt or resume ICO.
  //   //   etherAddress: accounts[4], // address etherAddress; // all funds received will be transffered to this address.
  //   //
  //   // });
  });
});
