contract('Test Reputation', function(accounts) {
  it("test setting and getting reputation by the owner", async function() {
    let value;
    var reputation = Reputation.deployed();  
    
    await reputation.setReputation.sendTransaction(accounts[0], 3131);
    
    value = await reputation.reputationOf.call(accounts[0]);
    assert.equal(value.valueOf(), 3131);
  });
    
  it("should be owned by the main account", async function() {
    var reputation = Reputation.deployed();
    let owner = await reputation.owner();
    assert.equal(owner, accounts[0]);
  });

  it("check premissionss", async function() {
    let rep = Reputation.deployed();
    await rep.setReputation(accounts[1], 1000, {from: accounts[0]});
    // this tx should have no effect
    await rep.setReputation(accounts[2], 1000, {from: accounts[1]});
    let account0Rep = await rep.reputationOf(accounts[0]);    
    let account1Rep = await rep.reputationOf(accounts[1]);
    let account2Rep = await rep.reputationOf(accounts[2]);
    let totalRep = await rep.totalReputation();
    
            
    assert.equal(account1Rep, 1000, "account 1 reputation should be 1000");
    assert.equal(account2Rep, 0, "account 2 reputation should be 0");
    
    assert.equal(parseInt(totalRep), parseInt(account0Rep) + parseInt(account1Rep), "total reputation should be sum of account0 and account1");
  });

  it("check total reputation", async function() {
    let rep = Reputation.deployed();
    await rep.setReputation(accounts[1], 1000, {from: accounts[0]});
    await rep.setReputation(accounts[0], 2000, {from: accounts[0]});
    await rep.setReputation(accounts[2], 3000, {from: accounts[0]});
    await rep.setReputation(accounts[1], 500, {from: accounts[0]});        
        
    // this tx should have no effect
    let account0Rep = await rep.reputationOf(accounts[0]);    
    let account1Rep = await rep.reputationOf(accounts[1]);
    let account2Rep = await rep.reputationOf(accounts[2]);
    
    assert.equal(account0Rep, 2000, "account 0 reputation should be 2000");    
    assert.equal(account1Rep, 500, "account 1 reputation should be 500");    
    assert.equal(account2Rep, 3000, "account 2 reputation should be 3000");
    
    let totalRep = await rep.totalReputation();
    
            
    assert.equal(parseInt(totalRep), parseInt(account0Rep) + parseInt(account1Rep) + parseInt(account2Rep), "total reputation should be sum of accounts");
  });


  it("check total reputation overflow", async function() {
    let rep = Reputation.deployed();
    var BigNumber = require('bignumber.js');
    var bigNum = ((new BigNumber(2)).toPower(255));

    let tx = await rep.setReputation(accounts[0], bigNum, {from: accounts[0]});

    let totalRepBefore = await rep.totalReputation();

    const assertJump = require('./zeppelin-solidity/helpers/assertJump');
    try {
      let tx2 = await rep.setReputation(accounts[1], bigNum, {from: accounts[0]});
      throw 'an error' // make sure that an error is thrown
    } catch(error) {
      assertJump(error);
    }

    let totalRepAfter = await rep.totalReputation();
        
    assert( totalRepBefore.equals(totalRepAfter), "reputation should remain the same");
  });
});
