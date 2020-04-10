const helpers = require("./helpers");
const DAOToken   = artifacts.require("./DAOToken.sol");
const TokenCapGC = artifacts.require('./globalConstraints/TokenCapGC.sol');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");

let reputation, avatar,token,controller,tokenCapGC;

const setup = async function (accounts,permission='0') {
  var _controller;
  tokenCapGC = await TokenCapGC.new();
  token  = await DAOToken.new();
  await token.initialize("TEST","TST",0,accounts[0]);
  await tokenCapGC.initialize(token.address,100);
  // set up a reputation system
  reputation = await Reputation.new();
  await reputation.initialize(accounts[0]);
  avatar = await Avatar.new();
  await avatar.initialize('name', token.address, reputation.address, accounts[0]);
  if (permission !== '0'){
    _controller = await Controller.new({from:accounts[1]});
    await _controller.initialize(avatar.address,accounts[0],{from:accounts[1]});
    await _controller.registerScheme(accounts[0],permission,{from:accounts[1]});
    await _controller.unregisterSelf({from:accounts[1]});
  }
  else {
     _controller = await Controller.new();
      await _controller.initialize(avatar.address,accounts[0]);
  }
  controller = _controller;
  return _controller;
};

contract('TokenCapGC', accounts =>  {

    it("initialize", async () => {
      await setup(accounts);
      var param = await tokenCapGC.parameters();
      assert.equal(param[1].toNumber(),100);
    });

  it("pre and post", async () => {
    var post,pre;
    await setup(accounts);
    pre = await tokenCapGC.pre(token.address,helpers.NULL_HASH);
    assert.equal(pre,true);
    post = await tokenCapGC.post(token.address,helpers.NULL_HASH);
    //token total supply is 0
    assert.equal(post,true);
    //increase the total supply
    await token.mint(accounts[2], 101);
    post = await tokenCapGC.post(token.address,helpers.NULL_HASH);
    //token total supply is 101
    assert.equal(post,false);
  });

  it("mintTokens check", async () => {

    controller = await setup(accounts);

    await controller.addGlobalConstraint(tokenCapGC.address);
    await token.transferOwnership(controller.address);
    await controller.mintTokens(50,accounts[0]);
    try {
      await controller.mintTokens(51,accounts[0]);
      assert(false,"mint tokens should fail due to the tokenCapGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }
    });
});
