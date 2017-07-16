const helpers = require('./helpers');

var GenesisScheme = artifacts.require("./GenesisScheme.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
import { daostack } from '../lib/daostack.js';

contract('SchemeRegistrar', function(accounts) {

  it("the daostack.createSchemeRegistrar function should work as expected with default values", async function() {
    // create a schemeRegistrar
    const registrar = await daostack.createSchemeRegistrar();

    // because the registrar is constructed without a token address, it should have
    // created a new MintableToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    const token = await MintableToken.at(tokenAddress);
    const accounts = web3.eth.accounts;
    let balance;
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 0);
    await token.mint(1000 * Math.pow(10, 18), web3.eth.accounts[0]);
    balance = await token.balanceOf(accounts[0]);
    assert.equal(balance.valueOf(), 1000 * Math.pow(10, 18));
  });

  it("the daostack.createSchemeRegistrar function should work as expected with non-default values", async function() {
    // create a schemeRegistrar, passing some options
    const token = await MintableToken.new();

    const registrar = await daostack.createSchemeRegistrar({
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
