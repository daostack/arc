contract('Test Reputation', function(accounts) {
    it("test setting and getting reputation by the owner", async function() {
        let value;
        var reputation = Reputation.deployed();  
        
         await reputation.set_reputation.sendTransaction(accounts[0], 3131);
        
        value = await reputation.reputationOf.call(accounts[0]);
        assert.equal(value.valueOf(), 3131);
      });
    
  it("should be owned by the main account", async function() {
    var reputation = Reputation.deployed();
    let owner = await reputation.owner();
    assert.equal(owner, accounts[0]);
  });
});
