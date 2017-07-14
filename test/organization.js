import { Organization } from '../lib/organization.js';
const helpers = require('./helpers')

// var UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const SimpleContributionScheme = artifacts.require('./SimpleContributionScheme.sol');
const UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
const MintableToken = artifacts.require('./MintableToken.sol');

contract('Organization', function(accounts) {

    it("New Organization constructor", async function(){
      const organization = await Organization.new({});
      // an organization has an avatar
      
    });

});
