const helpers = require('./helpers')

var GenesisScheme = artifacts.require("./GenesisScheme.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
import { daostack } from '../lib/daostack.js';

contract('createGlobalConstraintRegistrar', function(accounts) {

  it("the daostack.createGlobalConstraintRegistrar function should work as expected with the default parameters", async function() {    
    // create a schemeRegistrar
    const registrar = await daostack.createGlobalConstraintRegistrar();

    // because the registrar is constructed without a token address, it should have
    // created a new MintableToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    const token = await MintableToken.at(tokenAddress);
    const accounts = web3.eth.accounts;
    let balance;
    balance = await token.balanceOf(accounts[0])
    assert.equal(balance.valueOf(), 0)
    await token.mint(1000 * Math.pow(10, 18), web3.eth.accounts[0]);
    balance = await token.balanceOf(accounts[0])
    assert.equal(balance.valueOf(), 1000 * Math.pow(10, 18))
  });

  it("the daostack.createGlobalConstraintRegistrar function should work as expected with specific parameters", async function() {    
    // create a schemeRegistrar, passing some options
    const token = await MintableToken.new();

    const registrar = await daostack.createGlobalConstraintRegistrar({
        tokenAddress:token.address,
        fee: 3e18,
        beneficiary: accounts[1]
    });

    // because the registrar is constructed without a token address, it should have
    // created a new MintableToken - we check if it works as expected
    const tokenAddress = await registrar.nativeToken();
    assert.equal(tokenAddress, token.address);
    const fee = await registrar.fee();
    assert.equal(fee, 3e18);
    const beneficiary = await registrar.beneficiary();
    assert.equal(beneficiary, accounts[1]);
  });
});
