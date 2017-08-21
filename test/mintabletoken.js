const helpers = require('./helpers');

const MintableToken = artifacts.require("./MintableToken.sol");

contract('MintableToken', function (accounts) {

    it("should mint tokens to owner account", async function () {
        helpers.etherForEveryone();

        let owner, totalSupply, userSupply;
        let token = await MintableToken.new();
        totalSupply = await token.totalSupply();
        owner = await token.owner();
        userSupply = await token.balanceOf(owner);
        assert.equal(totalSupply, 0);
        assert.equal(userSupply, 0);

        await token.mint(1000, owner);
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(owner);
        assert.equal(totalSupply, 1000);
        assert.equal(userSupply, 1000);

        await token.mint(1300, accounts[2]);
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(accounts[2]);
        assert.equal(totalSupply, 2300);
        assert.equal(userSupply, 1300);

    });

    it("should allow minting tokens only by owner", async function () {
        helpers.etherForEveryone();
        let token = await MintableToken.new();
        let owner = await token.owner();
        let totalSupply = await token.totalSupply();

        // calling 'mint' as a non-owner throws an error
        try {
            await token.mint(1000, owner, { 'from': accounts[1] });
            throw 'an error';
        } catch (error) {
            helpers.assertVMException(error);
        }

        // and so the supply of tokens should remain unchanged
        let newSupply = await token.totalSupply();
        assert.equal(totalSupply.valueOf(), newSupply.valueOf());
    });

    it("log the Mint event on mint", async function () {
        const token = await MintableToken.new();

        const tx = await token.mint(1000, accounts[1], { from: accounts[0] });

        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "Mint");
        assert.equal(tx.logs[0].args.to, accounts[1]);
        assert.equal(tx.logs[0].args.value, 1000);
    });

    it("mint should be reflected in totalSupply", async function () {
        const token = await MintableToken.new();

        await token.mint(1000, accounts[1], { from: accounts[0] });
        let amount = await token.totalSupply();

        assert.equal(amount, 1000);

        await token.mint(500, accounts[2], { from: accounts[0] });
        amount = await token.totalSupply();

        assert.equal(amount, 1500);
    });

    it("mint should be reflected in balances", async function () {
        const token = await MintableToken.new();

        await token.mint(1000, accounts[1], { from: accounts[0] });

        const amount = await token.balanceOf(accounts[1]);

        assert.equal(amount, 1000);
    });

    it("totalSupply is 0 on init", async function () {
        const token = await MintableToken.new();

        assert.equal(await token.totalSupply(), 0);
    });
});
