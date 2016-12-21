contract('Test MintableToken', function(accounts) {
  it("should mint tokens to owner account", async function() {
    let owner, totalSupply, userSupply
    var token = MintableToken.deployed();
    totalSupply = await token.totalSupply();
    owner = await token.owner()
    userSupply = await token.balanceOf(owner)
    assert.equal(totalSupply, 10000);
    assert.equal(userSupply, 10000);

    await token.mint(1000)
    totalSupply = await token.totalSupply();
    userSupply = await token.balanceOf(owner)
    assert.equal(totalSupply, 11000);
    assert.equal(userSupply, 11000);
  });

  it("should allow mint tokens only by owner", async function() {
    var token = MintableToken.deployed();
    let owner = await token.owner()
    let totalSupply = await token.totalSupply();

    // the next call should fail
    await token.mint(1000, {'from': accounts[1]})

    // and so the supply of tokens should remain unchanged
    let newSupply = await token.totalSupply();
    assert.equal(totalSupply.valueOf(), newSupply.valueOf())
  });
});
