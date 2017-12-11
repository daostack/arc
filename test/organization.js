//
// import { Organization } from '../lib/organization.js';
// import * as helpers from './helpers';
// import { proposeSimpleContributionScheme } from './simplecontribution.js';
//
//
// contract('Organization', function(accounts) {
//   let organization;
//
//   before(function() {
//     helpers.etherForEveryone();
//   });
//
//   it("can be created with 'new' using default settings", async function(){
//     organization = await Organization.new({
//       orgName: 'Skynet',
//       tokenName: 'Tokens of skynet',
//       tokenSymbol: 'SNT'
//     });
//     // an organization has an avatar
//     assert.ok(organization.avatar, 'Organization must have an avatar defined');
//   });
//
//   it("can be instantiated with 'at' if it was already deployed", async function(){
//     // first create an organization
//     const org1 = await Organization.new({
//       orgName: 'Skynet',
//       tokenName: 'Tokens of skynet',
//       tokenSymbol: 'SNT'
//     });
//     // then instantiate it with .at
//     const org2 = await Organization.at(org1.avatar.address);
//
//     // check if the two orgs are indeed the same
//     assert.equal(org1.avatar.address, org2.avatar.address);
//     assert.equal(org1.orgName, org2.orgName);
//     assert.equal(org1.orgToken, org2.orgToken);
//     const schemeRegistrar1 = await org1.scheme('SchemeRegistrar');
//     const schemeRegistrar2 = await org2.scheme('SchemeRegistrar');
//     assert.equal(schemeRegistrar1.address, schemeRegistrar2.address);
//     const upgradeScheme1 = await org1.scheme('UpgradeScheme');
//     const upgradeScheme2 = await org2.scheme('UpgradeScheme');
//     assert.equal(upgradeScheme1.address, upgradeScheme2.address);
//     const globalConstraintRegistrar1 = await org1.scheme('GlobalConstraintRegistrar');
//     const globalConstraintRegistrar2 = await org2.scheme('GlobalConstraintRegistrar');
//     assert.equal(globalConstraintRegistrar1.address, globalConstraintRegistrar2.address);
//   });
//
//   it("has a working schemes() function to access its schemes", async function(){
//       organization = await helpers.forgeOrganization();
//       const settings = await helpers.settingsForTest();
//       // a new organization comes with three known schemes
//       assert.equal((await organization.schemes()).length, 3);
//       let scheme = await organization.scheme('GlobalConstraintRegistrar');
//       assert.equal(scheme.address, settings.daostackContracts.GlobalConstraintRegistrar.address);
//       assert.isTrue(!!scheme.contract, "contract must be set");
//       scheme = await organization.scheme('SchemeRegistrar');
//       assert.equal(scheme.address, settings.daostackContracts.SchemeRegistrar.address);
//       assert.isTrue(!!scheme.contract, "contract must be set");
//       scheme = await organization.scheme('UpgradeScheme');
//       assert.equal(scheme.address, settings.daostackContracts.UpgradeScheme.address);
//       assert.isTrue(!!scheme.contract, "contract must be set");
//
//
//       // now we add another known scheme
//       await proposeSimpleContributionScheme(organization, accounts);
//
//       assert.equal((await organization.schemes()).length, 4);
//       // TODO: the organizaiton must be registered with the scheme before the next works
//       // assert.equal((await organization.scheme('SimpleContributionScheme')).address, settings.daostackContracts.ContributionScheme.address);
//   });
//
//   // it("has a working proposeScheme function for SimpleICO", async function(){
//
//   //   organization = await Organization.new({
//   //     orgName: 'Skynet',
//   //     tokenName: 'Tokens of skynet',
//   //     tokenSymbol: 'SNT'
//   //   });
//
//   //   proposalId = await organization.proposeScheme({
//   //     contract: 'SimpleICO',
//   //     params: {
//   //       cap: 100, // uint cap; // Cap in Eth
//   //       price: .001, // uint price; // Price represents Tokens per 1 Eth
//   //       startBlock: 5, // uint startBlock;
//   //       endBlock: 10, // uint endBlock;
//   //       admin: accounts[3], // address admin; // The admin can halt or resume ICO.
//   //       beneficiary: accounts[4], // address beneficiary; // all funds received will be transffered to this address.
//   //     }
//   //   });
//   //   //
//   //   assert.isOk(proposalId);
//   //   assert.notEqual(proposalId, helpers.NULL_HASH);
//
//   // });
//
//   // it("has a working proposeScheme function for ContributionScheme [IN PROGRESS]", async function(){
//   //   organization = await Organization.new({
//   //     orgName: 'Skynet',
//   //     tokenName: 'Tokens of skynet',
//   //     tokenSymbol: 'SNT'
//   //   });
//
//   //   proposalId = await organization.proposeScheme({
//   //     contract: 'SimpleContributionScheme',
//   //   });
//   //   //
//   //   assert.isOk(proposalId);
//   //   assert.notEqual(proposalId, helpers.NULL_HASH);
//
//   //   // TODO: test with non-default settings
//
//   // });
//
//   // it("has a working proposeScheme function for UpgradeScheme [TODO]", async function(){
//   // });
//
// });
