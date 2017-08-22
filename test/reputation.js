const helpers = require('./helpers');

var Reputation = artifacts.require("./Reputation.sol");


contract('Reputation', function (accounts) {
    it("test setting and getting reputation by the owner", async function () {
        let value;
        let reputation = await Reputation.new();

        await reputation.mint(3131, accounts[1]);

        value = await reputation.reputationOf(accounts[1]);
        assert.equal(value.valueOf(), 3131);
    });

    it("should be owned by the main account", async function () {
        let reputation = await Reputation.new();
        let owner = await reputation.owner();
        assert.equal(owner, accounts[0]);
    });

    it("check permissions", async function () {
        let rep = await Reputation.new();
        await rep.setReputation(1000, accounts[1]);

        // only the owner can call setReputation
        try {
            await rep.setReputation(1000, accounts[2], { from: accounts[2] });
            throw 'an error'; // make sure that an error is thrown
        } catch (error) {
            helpers.assertVMException(error);
        }

        let account0Rep = await rep.reputationOf(accounts[0]);
        let account1Rep = await rep.reputationOf(accounts[1]);
        let account2Rep = await rep.reputationOf(accounts[2]);
        let totalRep = await rep.totalSupply();

        assert.equal(account1Rep, 1000, "account 1 reputation should be 1000");
        assert.equal(account2Rep, 0, "account 2 reputation should be 0");

        assert.equal(parseInt(totalRep), parseInt(account0Rep) + parseInt(account1Rep), "total reputation should be sum of account0 and account1");
    });

    it("check total reputation", async function () {
        let rep = await Reputation.new();
        await rep.mint(2000, accounts[0]);
        await rep.mint(1000, accounts[1]);
        await rep.mint(500, accounts[1]);
        await rep.mint(3000, accounts[2]);

        // this tx should have no effect
        let account0Rep = await rep.reputationOf(accounts[0]);
        let account1Rep = await rep.reputationOf(accounts[1]);
        let account2Rep = await rep.reputationOf(accounts[2]);

        // assert.equal(account0Rep, 2001, "account 0 reputation should be 2000");
        assert.equal(account1Rep.valueOf(), 1500, "account 1 reputation should be 1000 + 500");
        assert.equal(account2Rep.valueOf(), 3000, "account 2 reputation should be 3000");

        let totalRep = await rep.totalSupply();

        assert.equal(parseInt(totalRep), parseInt(account0Rep) + parseInt(account1Rep) + parseInt(account2Rep), "total reputation should be sum of accounts");
    });


    it("check total reputation overflow", async function () {
        let rep = await Reputation.new();
        let BigNumber = require('bignumber.js');
        let bigNum = ((new BigNumber(2)).toPower(254));

        await rep.mint(bigNum, accounts[0]);
        await rep.mint(bigNum, accounts[0]);
        await rep.mint(bigNum, accounts[0]);

        let totalRepBefore = await rep.totalSupply();

        try {
            await rep.mint(bigNum, accounts[1]);
            throw 'an error'; // make sure that an error is thrown
        } catch (error) {
            helpers.assertVMException(error);
        }

        let totalRepAfter = await rep.totalSupply();

        assert(totalRepBefore.equals(totalRepAfter), "reputation should remain the same");
    });

    it("test reducing reputation", async function () {
        let value;
        let reputation = await Reputation.new();

        await reputation.mint(1500, accounts[1]);
        await reputation.mint(-500, accounts[1]);

        value = await reputation.reputationOf(accounts[1]);
        let totalRepSupply = await reputation.totalSupply();

        assert.equal(value.valueOf(), 1000);
        assert.equal(totalRepSupply.valueOf(), 1000);
    });

    it("totalSupply is 0 on init", async function () {
        const reputation = await Reputation.new();
        const totalSupply = await reputation.totalSupply();

        assert.equal(totalSupply.toNumber(), 0);
    });
});
