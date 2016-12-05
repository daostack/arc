contract('Test Token', function(accounts) {
  it("should put 10000 Coins in the first account", function() {
    var token = Token.deployed();
    return token.balanceOf.call(accounts[0]).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });

  it("should be owned by the main account", async function() {
    var token = Token.deployed();
    let owner = await token.owner();
    assert.equal(owner, accounts[0]);
  });

  it("should be killable", async function() {
    // we only test that the function actually exists
    // "real" tests are in zeppelin-solidity/Killable.js
    var token = Token.deployed();
    var txnhash = await token.kill();
    assert.isOk(txnhash);
  });
});
