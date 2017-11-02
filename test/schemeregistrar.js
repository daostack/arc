const DAOToken = artifacts.require("./DAOToken.sol");

import { SchemeRegistrar } from   '../lib/schemeregistrar.js';

contract('SchemeRegistrar', function(accounts) {

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
