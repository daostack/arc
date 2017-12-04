const helpers = require('./helpers');

const DAOToken = artifacts.require("./DAOToken.sol");

contract('DAOToken', accounts => {
    it("should put 0 Coins in the first account", async () => {
        let token = await DAOToken.new();
        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance.valueOf(), 0);
    });

    it("should be owned by its creator", async () => {
        let token = await DAOToken.new();
        let owner = await token.owner();
        assert.equal(owner, accounts[0]);
    });

    it("should be destructible", async () => {
        // we only test that the function actually exists
        // "real" tests are in zeppelin-solidity/Killable.js
        let token = await DAOToken.new();
        let txnhash = await token.destroy();
        assert.isOk(txnhash);
    });

    it("should mint tokens to owner account", async () => {
        helpers.etherForEveryone();

        let owner, totalSupply, userSupply;
        let token = await DAOToken.new();
        totalSupply = await token.totalSupply();
        owner = await token.owner();
        userSupply = await token.balanceOf(owner);
        assert.equal(totalSupply, 0);
        assert.equal(userSupply, 0);

        await token.mint(owner, 1000);
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(owner);
        assert.equal(totalSupply, 1000);
        assert.equal(userSupply, 1000);

        await token.mint(accounts[2], 1300);
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(accounts[2]);
        assert.equal(totalSupply, 2300);
        assert.equal(userSupply, 1300);

    });

    it("should allow minting tokens only by owner", async () => {
        helpers.etherForEveryone();
        let token = await DAOToken.new();
        let owner = await token.owner();
        let totalSupply = await token.totalSupply();

        // calling 'mint' as a non-owner throws an error
        try {
            await token.mint(owner, 1000, { 'from': accounts[1] });
            throw 'an error';
        } catch (error) {
            helpers.assertVMException(error);
        }

        // and so the supply of tokens should remain unchanged
        let newSupply = await token.totalSupply();
        assert.equal(totalSupply.valueOf(), newSupply.valueOf());
    });

    it("log the Mint event on mint", async () => {
        const token = await DAOToken.new();

        const tx = await token.mint(accounts[1], 1000, { from: accounts[0] });

        assert.equal(tx.logs[0].event, "Mint");
        assert.equal(tx.logs[0].args.to, accounts[1]);
        assert.equal(tx.logs[0].args.amount.toNumber(), 1000);
    });

    it("mint should be reflected in totalSupply", async () => {
        const token = await DAOToken.new();

        await token.mint(accounts[1], 1000, { from: accounts[0] });
        let amount = await token.totalSupply();

        assert.equal(amount, 1000);

        await token.mint(accounts[2], 500, { from: accounts[0] });
        amount = await token.totalSupply();

        assert.equal(amount.toNumber(), 1500);
    });

    it("mint should be reflected in balances", async () => {
        const token = await DAOToken.new();

        await token.mint(accounts[1], 1000, { from: accounts[0] });

        const amount = await token.balanceOf(accounts[1]);

        assert.equal(amount.toNumber(), 1000);
    });

    it("totalSupply is 0 on init", async () => {
        const token = await DAOToken.new();

        const totalSupply = await token.totalSupply();

        assert.equal(totalSupply.toNumber(), 0);
    });

    describe('onlyOwner', () => {
        it('mint by owner', async () => {
            const token = await DAOToken.new();
            try {
                await token.mint(accounts[1], 10, { from: accounts[0] });
            } catch (ex) {
                assert(false, 'owner could not mint');
            }
        });

        it('mint by not owner', async () => {
            const token = await DAOToken.new();
            try {
                await token.mint(accounts[1], 10, { from: accounts[1] });
            } catch (ex) {
                return;
            }

            assert(false, 'non-owner was able to mint');
        });
    });
});
