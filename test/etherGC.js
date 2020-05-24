import * as helpers from './helpers';
const DAOToken   = artifacts.require("./DAOToken.sol");
const EtherGC = artifacts.require('./globalConstraints/EtherGC.sol');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
var constants = require('../test/constants');


let reputation, avatar,token,controller,etherGC;
var periodLengthConst = 1000;
const setup = async function () {
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  controller = await Controller.new(avatar.address,{gas: constants.ARC_GAS_LIMIT});
  await avatar.transferOwnership(controller.address);
  etherGC = await EtherGC.new();
  await etherGC.initialize(avatar.address,periodLengthConst,web3.utils.toWei('5', "ether")); //periodLengthConst seconds ,5 eth
};

contract('EtherGC', accounts =>  {
    it("initialize", async () => {
      await setup();
      assert.equal(await etherGC.avatar(),avatar.address);
      assert.equal(await etherGC.amountAllowedPerPeriod(),web3.utils.toWei('5', "ether"));
      assert.equal(await etherGC.periodLength(),1000);
    });

  it("send ether check", async () => {

    await setup();
    try {
     await etherGC.initialize(avatar.address,periodLengthConst,web3.utils.toWei('5', "ether")); //periodLengthConst seconds ,5 eth
     assert(false,"cannpt init twice ");
   }   catch(ex){
     helpers.assertVMException(ex);
    }
    var startTime = await etherGC.startTime();

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
    helpers.increaseTime(periodLengthConst+1);
    await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);
    await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);
    await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});
    var diff = ((await web3.eth.getBlock("latest")).timestamp - startTime.toNumber())% periodLengthConst;
    //increment time for next period
    helpers.increaseTime(periodLengthConst-diff);
     await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);
    });

    it("genericCall check", async () => {

      await setup();
      try {
       await etherGC.initialize(avatar.address,periodLengthConst,web3.utils.toWei('5', "ether")); //periodLengthConst seconds ,5 eth
       assert(false,"cannpt init twice ");
     }   catch(ex){
       helpers.assertVMException(ex);
      }
      var startTime = await etherGC.startTime();

      await controller.addGlobalConstraint(etherGC.address,helpers.NULL_HASH,avatar.address);
      //move 10 ether to avatar
      await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});

      let actionMock =  await ActionMock.new();
      let a = 7;
      let b = actionMock.address;
      let c = "0x1234";
      const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.test(a,b,c).encodeABI();
      await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('1', "ether"));
      await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('4', "ether"));

      try {
        await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);
        assert(false,"sendEther should fail due to the etherGC global constraint ");
      }
      catch(ex){
        helpers.assertVMException(ex);
      }

      try {
        await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('1', "ether"));
        assert(false,"sendEther should fail due to the etherGC global constraint ");
      }
      catch(ex){
        helpers.assertVMException(ex);
      }
      helpers.increaseTime(periodLengthConst+1);
      await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('1', "ether"));
      await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('4', "ether"));
      await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});
      var diff = ((await web3.eth.getBlock("latest")).timestamp - startTime.toNumber())% periodLengthConst;
      //increment time for next period
      helpers.increaseTime(periodLengthConst-diff);
      await controller.genericCall(actionMock.address,encodeABI,avatar.address,web3.utils.toWei('4', "ether"));
      });
});
