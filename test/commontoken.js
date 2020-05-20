const helpers = require('./helpers');

const CommonToken = artifacts.require("./CommonToken.sol");
var token;
contract('CommonToken', accounts => {
    const testTokenName = "CommonToken";
    const testTokenSymbol = "CMN";
    beforeEach( async function() {
      token = await CommonToken.new();
      await token.initialize(testTokenName,testTokenSymbol,18,[accounts[0]],[accounts[0]]);
   });
    it("should put 0 Coins in the first account", async () => {

        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance.valueOf(), 0);
    });

    it("should be owned by its creator", async () => {

        assert.equal(await token.isMinter(accounts[0]), true);
    });

    it("should mint tokens to owner account", async () => {
        await helpers.etherForEveryone(accounts);

        let owner, totalSupply, userSupply;

        totalSupply = await token.totalSupply();
        owner = accounts[0];
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
        await helpers.etherForEveryone(accounts);

        let owner = accounts[0];
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
        assert.equal(totalSupply.toNumber(), newSupply.toNumber());
    });

    it("log the Transfer event on mint", async () => {


        const tx = await token.mint(accounts[1], 1000, { from: accounts[0] });

        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "Transfer");
        assert.equal(tx.logs[0].args.to, accounts[1]);
        assert.equal(tx.logs[0].args.value.toNumber(), 1000);
    });

    it("mint should be reflected in totalSupply", async () => {


        await token.mint(accounts[1], 1000, { from: accounts[0] });
        let amount = await token.totalSupply();

        assert.equal(amount, 1000);

        await token.mint(accounts[2], 500, { from: accounts[0] });
        amount = await token.totalSupply();

        assert.equal(amount.toNumber(), 1500);
    });

    it("mint should be reflected in balances", async () => {


        await token.mint(accounts[1], 1000, { from: accounts[0] });

        const amount = await token.balanceOf(accounts[1]);

        assert.equal(amount.toNumber(), 1000);
    });

    it("totalSupply is 0 on init", async () => {


        const totalSupply = await token.totalSupply();

        assert.equal(totalSupply.toNumber(), 0);
    });

    it("burn", async () => {

        await token.mint(accounts[1], 1000, { from: accounts[0] });

        var amount = await token.balanceOf(accounts[1]);

        assert.equal(amount.toNumber(), 1000);

        await token.burn(accounts[1] ,100);

        amount = await token.balanceOf(accounts[1]);

        assert.equal(amount.toNumber(), 900);

        const totalSupply = await token.totalSupply();

        assert.equal(totalSupply.toNumber(), 900);
    });


    describe('onlyOwner', () => {
        it('mint by owner', async () => {
            try {
                await token.mint(accounts[1], 10, { from: accounts[0] });
            } catch (ex) {
                assert(false, 'owner could not mint');
            }
        });

        it('mint by not owner', async () => {

            try {
                await token.mint(accounts[1], 10, { from: accounts[1] });
            } catch (ex) {
                return;
            }

            assert(false, 'non-owner was able to mint');
        });

        it('burn by owner', async () => {
            await token.mint(accounts[1], 10);
            try {
                await token.burn(accounts[1], 10, { from: accounts[0] });
            } catch (ex) {
                assert(false, 'owner could not mint');
            }
        });

        it('burn by not owner', async () => {
            await token.mint(accounts[1], 10, { from: accounts[0] });
            try {
                await token.burn(accounts[1], 10, { from: accounts[1] });
            } catch (ex) {
                return;
            }

            assert(false, 'non-owner was able to mint');
        });
    });
});
