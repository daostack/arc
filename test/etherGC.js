import * as helpers from './helpers';
const DAOToken   = artifacts.require("./DAOToken.sol");
const EtherGC = artifacts.require('./globalConstraints/EtherGC.sol');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
var constants = require('../test/constants');


let reputation, avatar,token,controller,etherGC;
const setup = async function () {
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  controller = await Controller.new(avatar.address,{gas: constants.ARC_GAS_LIMIT});
  await avatar.transferOwnership(controller.address);
  etherGC = await EtherGC.new();
  await etherGC.initialize(avatar.address,10,web3.utils.toWei('5', "ether")); //10 blocks ,5 eth
};

contract('EtherGC', accounts =>  {
    it("initialize", async () => {
      await setup();
      assert.equal(await etherGC.avatar(),avatar.address);
      assert.equal(await etherGC.amountAllowedPerPeriod(),web3.utils.toWei('5', "ether"));
      assert.equal(await etherGC.periodLength(),10);
    });

  it("send ether check", async () => {

    await setup();
    try {
     await etherGC.initialize(avatar.address,10,web3.utils.toWei('5', "ether")); //10 blocks ,5 eth
     assert(false,"cannpt init twice ");
   }   catch(ex){
     helpers.assertVMException(ex);
    }
    var startBlock = await etherGC.startBlock();

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
    var i;
    for (i = 0 ;i< 10;i++) {
      //increment 10 blocks in ganache
      //use mint rep to increment blocks number in ganache.
      tx = await reputation.mint(accounts[0],1);
    }
    await controller.sendEther(web3.utils.toWei('1', "ether"), accounts[2],avatar.address);

    var tx = await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);
    var periodIndex = Math.floor((tx.receipt.blockNumber - startBlock.toNumber())/10);
    await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('10', "ether")});

    for (i = 0 ;i< 10;i++) {
      //increment 10 blocks or till the period index is changed (in ganache)
      //use mint rep to increment blocks number in ganache.
      tx = await reputation.mint(accounts[0],1);
      if (Math.floor((tx.receipt.blockNumber - startBlock.toNumber())/10) !== periodIndex) {
        break;
      }
    }
     await controller.sendEther(web3.utils.toWei('4', "ether"), accounts[2],avatar.address);
    });
});
