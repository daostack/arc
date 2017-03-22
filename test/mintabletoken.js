const helpers = require('./helpers')
var MintableToken = artifacts.require("./MintableToken.sol");

contract('Test MintableToken', function(accounts) {
    it("should mint tokens to owner account", async function() {
        helpers.tokensforeveryone()
        let owner, totalSupply, userSupply
        let token = await MintableToken.new();
        totalSupply = await token.totalSupply();
        owner = await token.owner()
        userSupply = await token.balanceOf(owner)
        assert.equal(totalSupply, 0);
        assert.equal(userSupply, 0);

        await token.mint(1000, owner)
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(owner)
        assert.equal(totalSupply, 1000);
        assert.equal(userSupply, 1000);

        await token.mint(1300, accounts[2])
        totalSupply = await token.totalSupply();
        userSupply = await token.balanceOf(accounts[2])
        assert.equal(totalSupply, 2300);
        assert.equal(userSupply, 1300);
     
    });

    it("should allow minting tokens only by owner", async function() {
        helpers.tokensforeveryone()
        let token = await MintableToken.new();
        let owner = await token.owner()
        let totalSupply = await token.totalSupply();

        // the next call fails silently
        await token.mint(1000, owner, {'from': accounts[1]})

        // and so the supply of tokens should remain unchanged
        let newSupply = await token.totalSupply();
        assert.equal(totalSupply.valueOf(), newSupply.valueOf())
    });
});
