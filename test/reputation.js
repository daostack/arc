contract('Test Reputation', function(accounts) {


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

    rep.setReputation(accounts[0], bigNum, {from: accounts[0]}).then(function(tx) {
      // If this callback is called, the transaction was successfully processed.
      // Note that Ether Pudding takes care of watching the network and triggering
      // this callback.
      assert(false, "overflow tx should fail");
    }).catch(function(e) {
      // error is expected
    })    
    
    //let tx = await rep.setReputation(accounts[1], bigNum, {from: accounts[0]});    
        
    let totalRep = await rep.totalReputation();

    assert( totalRep.greaterThanOrEqualTo(bigNum), "should not overflow" );        
  });


/*
  it("abc", async function() {
    let rep = Reputation.deployed();
    let account0Rep = await rep.reputationOf(accounts[0]);
    let totalRep = await rep.totalReputation();
    assert.equal(account0Rep, 1, "as");
    assert.equal(totalRep, 1, "as");    
  });
*/

/*
  it("should put 10000 reputation in the second account", function() {
    var rep = Reputation.deployed();

    console.log("sd");
          console.log(rep);
    console.log("sd2");              
    rep.set_reputation(accounts[1], 1000, {from: accounts[0]}).then(function(tx_id) {
    // If this callback is called, the transaction was successfully processed.
    // check balance
        console.log("hello");
        rep.reputationOf.call(accounts[1]).then(function(reputation) {
          assert.equal(reputation.valueOf(),1000, "1000 rep wasn't in the first account");
        }).catch(function(e) {
          assert(false,"reputationOf failed");
        });      
  }).catch(function(e) {
    assert(false,"tx failed");
  });
  });
  */
});
