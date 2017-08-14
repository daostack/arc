const helpers = require('./helpers');
import { Organization } from '../lib/organization.js';

const SimpleICO = artifacts.require("./SimpleICO.sol");
//
// let nativeToken, fee, creator, accounts;
//
// const setupSimpleICO = async function() {
//   organization = await Organization.new({
//     orgName: 'Skynet',
//     tokenName: 'Tokens of skynet',
//     tokenSymbol: 'SNT'
//   });
//   accounts = web3.eth.accounts;
//   nativeToken = organization.orgToken;
//
//   // Give some tokens to the founder
//   await nativeToken.mint(100, accounts[0]);
//
//   // Register ICO parameters
//   let cap = 1000000;
//   let price = 1;
//   let startBlock = 15;
//   let endBlock = 500;
//   let beneficiary = organization.avatarAddress;
//   let admin = organization.avatarAddress;
//   await SimpleICO.setParameters(cap, price, startBlock, endBlock, beneficiary, admin);
//   const paramsHash = await simpleVote.getParametersHash(cap, price, startBlock, endBlock, beneficiary, admin);
//
//   return simpleICO;
// };
//
// contract('SimpleICO', function(accounts) {
//
//   before(function() {
//     helpers.etherForEveryone();
//   });
//
//   it("should mint tokens to owner account", async function() {
//
//       let owner, totalSupply, userSupply;
//       let token = await MintableToken.new();
//       totalSupply = await token.totalSupply();
//       owner = await token.owner();
//       userSupply = await token.balanceOf(owner);
//       assert.equal(totalSupply, 0);
//       assert.equal(userSupply, 0);
//
//       await token.mint(1000, owner);
//       totalSupply = await token.totalSupply();
//       userSupply = await token.balanceOf(owner);
//       assert.equal(totalSupply, 1000);
//       assert.equal(userSupply, 1000);
//
//       await token.mint(1300, accounts[2]);
//       totalSupply = await token.totalSupply();
//       userSupply = await token.balanceOf(accounts[2]);
//       assert.equal(totalSupply, 2300);
//       assert.equal(userSupply, 1300);
//
//   });
//
//
// });
