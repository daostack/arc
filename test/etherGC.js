import * as helpers from './helpers';
const DAOToken   = artifacts.require("./DAOToken.sol");
const EtherGC = artifacts.require('./globalConstraints/EtherGC.sol');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
var constants = require('../test/constants');


let reputation, avatar,token,controller,etherGC;
const setup = async function (permission='0') {
  var _controller;
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  if (permission !== '0'){
    _controller = await Controller.new(avatar.address,{from:accounts[1],gas: constants.ARC_GAS_LIMIT});
    await _controller.registerScheme(accounts[0],0,permission,0,{from:accounts[1]});
    await _controller.unregisterSelf(0,{from:accounts[1]});
  }
  else {
    _controller = await Controller.new(avatar.address,{gas: constants.ARC_GAS_LIMIT});
  }
  controller = _controller;
  await avatar.transferOwnership(controller.address);
  etherGC = await EtherGC.new();
  await etherGC.initialize(avatar.address,10,web3.utils.toWei('5', "ether"),controller.address); //10 blocks ,5 eth
  return _controller;
};

contract('EtherGC', accounts =>  {
    it("initialize", async () => {
      await setup();
      assert.equal(await etherGC.avatar(),avatar.address);
      assert.equal(await etherGC.amountAllowedPerPeriod(),web3.utils.toWei('5', "ether"));
      assert.equal(await etherGC.constraintPeriodWindow(),10);
    });

  it("send ether check", async () => {

    await setup();
    try {
     await etherGC.initialize(avatar.address,20,web3.utils.toWei('5', "ether"),controller.address); //10 blocks ,5 eth
     assert(false,"cannpt init twice ");
   }   catch(ex){
     helpers.assertVMException(ex);
    }
    await controller.addGlobalConstraint(etherGC.address,helpers.NULL_HASH,avatar.address);
    //move 10 ether to avatar
    await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});
    await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);
    await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);

    try {
      await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);
      assert(false,"sendEther should fail due to the etherGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }
    for (var i = 0 ;i< 21;i++) {
      //increment 21 blocks in ganache
      await Reputation.new();

    }

    await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);
    await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);
    //send more than 10 eth
    await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});
    await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);

    });
});
