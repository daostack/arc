const DAOToken   = artifacts.require("./DAOToken.sol");
const TokenCapGC = artifacts.require('./globalConstraints/TokenCapGC.sol');

contract('TokenCapGC', function (accounts)  {
    it("setParameters", async () => {
      var paramsHash;
      var tokenCapGC = await TokenCapGC.new();
      var token  = await DAOToken.new("TEST","TST");
      await tokenCapGC.setParameters(token.address,100);
      paramsHash = await tokenCapGC.getParametersHash(token.address,100);
      var param = await tokenCapGC.params(paramsHash);
      assert.equal(param[1].toNumber(),100);
    });

  it("pre and post", async () => {
    var paramsHash,post,pre;
    var tokenCapGC = await TokenCapGC.new();
    var token  = await DAOToken.new("TEST","TST");
    await tokenCapGC.setParameters(token.address,100);
    paramsHash = await tokenCapGC.getParametersHash(token.address,100);
    pre = await tokenCapGC.pre(token.address,paramsHash,0);
    assert.equal(pre,true);
    post = await tokenCapGC.post(token.address,paramsHash,0);
    //token total supply is 0
    assert.equal(post,true);
    //increase the total supply
    await token.mint(accounts[2], 101);
    post = await tokenCapGC.post(token.address,paramsHash,0);
    //token total supply is 101
    assert.equal(post,false);
  });

  it("post with wrong paramHash", async () => {
    var post;
    var tokenCapGC = await TokenCapGC.new();
    var token  = await DAOToken.new("TEST","TST");
    await tokenCapGC.setParameters(token.address,100);
    await tokenCapGC.getParametersHash(token.address,100);
    post = await tokenCapGC.post(token.address,1,0);
    //token total supply is 0
    assert.equal(post,true);
    //increase the total supply
    await token.mint(accounts[2], 101);
    post = await tokenCapGC.post(token.address,1,0);
    //token total supply is 101
    assert.equal(post,true);
  });
});
