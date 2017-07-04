const helpers = require('./helpers')

var UniversalGenesisScheme = artifacts.require("./UniversalGenesisScheme.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

contract('SchemeRegistrar', function(accounts) {

    it("the helper function should work as expected", async function() {    
        // calling createSchemeRegistrar without an explicit token contract
        // should give the sender a starging balance
        const registrar = await helpers.createSchemeRegistrar();
        const accounts = web3.eth.accounts;
        const tokenAddress = await registrar.nativeToken();
        const token = await MintableToken.at(tokenAddress);
        const balance = await token.balanceOf(accounts[0])
        assert.equal(balance.valueOf(), 1000 * Math.pow(10, 18))
    });
});
