const DAOToken = artifacts.require("./DAOToken.sol");

import { SchemeRegistrar } from   '../lib/schemeregistrar.js';
import { NULL_HASH, getValueFromLogs } from '../lib/utils';
import { forgeOrganization, settingsForTest } from './helpers';

contract('SchemeRegistrar', function(accounts) {

  it("proposeToAddModifyScheme javascript wrapper should add new scheme", async function() {
    const organization = await forgeOrganization();
    const settings = await settingsForTest();

    let schemeRegistrar = await organization.scheme('SchemeRegistrar');
    let simpleContributionScheme = await organization.schemes('SimpleContributionScheme');
    assert.equal(simpleContributionScheme.length,0, "scheme is already present");

    let simpleContributionSchemeAddress = settings.daostackContracts.SimpleContributionScheme.address;

    assert.isFalse(await organization.controller.isSchemeRegistered(simpleContributionSchemeAddress), "scheme is registered into the controller");

    let tx = await schemeRegistrar.proposeToAddModifyScheme({
      avatar: organization.avatar.address,
      scheme: simpleContributionSchemeAddress,
      schemeKey: "SimpleContributionScheme",
      schemeParametersHash: NULL_HASH
    });


    const proposalId = getValueFromLogs(tx, '_proposalId');

    organization.vote(proposalId, 1, {from: accounts[2]});

    assert.isTrue(await organization.controller.isSchemeRegistered(simpleContributionSchemeAddress), "scheme is not registered into the controller");
  });

  it("proposeToAddModifyScheme javascript wrapper should modify existing scheme", async function() {
    const organization = await forgeOrganization();

    let schemeRegistrar = await organization.scheme('SchemeRegistrar');
    let upgradeScheme = await organization.schemes('SchemeRegistrar');
    assert.equal(upgradeScheme.length, 1, "scheme is not present");

    let modifiedSchemeAddress = upgradeScheme[0].address;

    let tx = await schemeRegistrar.proposeToAddModifyScheme({
      avatar: organization.avatar.address,
      scheme: modifiedSchemeAddress,
      schemeKey: "SchemeRegistrar",
      schemeParametersHash: NULL_HASH
    });


    const proposalId = getValueFromLogs(tx, '_proposalId');

    organization.vote(proposalId, 1, {from: accounts[2]});

    assert.isTrue(await organization.controller.isSchemeRegistered(modifiedSchemeAddress), "scheme is not registered into the controller");

    let paramsHash = await organization.controller.getSchemeParameters(modifiedSchemeAddress);

    assert.equal(paramsHash, NULL_HASH, "parameters hash is not correct");
  });

  it("proposeToRemoveScheme javascript wrapper should remove scheme", async function() {
    const organization = await forgeOrganization();

    let schemeRegistrar = await organization.scheme('SchemeRegistrar');
    let removedScheme = schemeRegistrar;

    let tx = await schemeRegistrar.proposeToRemoveScheme({
      avatar: organization.avatar.address,
      scheme: removedScheme.address
    });

    const proposalId = getValueFromLogs(tx, '_proposalId');

    organization.vote(proposalId, 1, {from: accounts[2]});

    assert.isFalse(await organization.controller.isSchemeRegistered(removedScheme.address), "scheme is still registered into the controller");
  });

  it("schemeRegistrar.new should work as expected with default values", async function() {
    // create a schemeRegistrar
    const registrar = await SchemeRegistrar.new({
        fee: undefined,
        beneficiary: undefined,
        tokenAddress: undefined
    });

    // because the registrar is constructed without a token address, it should have
    // created a new DAOToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    const token = await DAOToken.at(tokenAddress);
    const accounts = web3.eth.accounts;
    let balance;
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 0);
    await token.mint(web3.eth.accounts[0], 1000 * Math.pow(10, 18));
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 1000 * Math.pow(10, 18));
  });

  it("schemeRegistrar.new should work as expected with non-default values", async function() {
    // create a schemeRegistrar, passing some options
    const token = await DAOToken.new();

    const registrar = await  SchemeRegistrar.new({
        tokenAddress:token.address,
        fee: 3e18,
        beneficiary: accounts[1]
    });

    // check if registrar indeed uses the specified token
    const tokenAddress = await registrar.nativeToken();
    assert.equal(tokenAddress, token.address);
    // check if the fee is as specified
    const fee = await registrar.fee();
    assert.equal(fee, 3e18);
    // check if the beneficiary is as specified
    const beneficiary = await registrar.beneficiary();
    assert.equal(beneficiary, accounts[1]);
  });
});
