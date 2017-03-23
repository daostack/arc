const helpers = require('./helpers')
var MintableToken = artifacts.require("./MintableToken.sol");

contract('Test Token', function(accounts) {
    it("should put 10000 Coins in the first account", async function() {
        let token = await MintableToken.new();
        let balance = await token.balanceOf.call(accounts[0])
        assert.equal(balance.valueOf(), 0)
    });

    it("should be owned by the creator account", async function() {
        let token = await MintableToken.new();
        let owner = await token.owner();
        assert.equal(owner, accounts[0]);
    });

    it("should be killable", async function() {
        // we only test that the function actually exists
        // "real" tests are in zeppelin-solidity/Killable.js
        let token = await MintableToken.new();
        let txnhash = await token.kill();
        assert.isOk(txnhash);
    });
});
