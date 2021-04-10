import * as helpers from './helpers';
const DAOToken   = artifacts.require("./DAOToken.sol");
const ReputationGC = artifacts.require('./globalConstraints/ReputationGC.sol');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
var constants = require('../test/constants');


let reputation, avatar,token,controller,reputationGC;
var periodLengthConst = 1000;
const setup = async function (accounts) {
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  controller = await Controller.new(avatar.address,{gas: constants.ARC_GAS_LIMIT});
  await avatar.transferOwnership(controller.address);
  await reputation.transferOwnership(controller.address);
  reputationGC = await ReputationGC.new();
  //mint 1000 reputation before the global constraint registration
  await controller.mintReputation(1000, accounts[2],avatar.address);
  await reputationGC.initialize(avatar.address,periodLengthConst,5); //1000 seconds ,5%
};

contract('ReputationGC', accounts =>  {
    it("initialize", async () => {
      await setup(accounts);
      assert.equal(await reputationGC.avatar(),avatar.address);
      assert.equal(await reputationGC.percentageAllowedPerPeriod(),5);
      assert.equal(await reputationGC.periodLength(),periodLengthConst);
    });

  it("mint/burn reputation check", async () => {

    await setup(accounts);
    try {
     await reputationGC.initialize(avatar.address,periodLengthConst,5); //1000 seconds ,5%
     assert(false,"cannpt init twice ");
   }   catch(ex){
     helpers.assertVMException(ex);
    }
    var startTime = await reputationGC.startTime();
    await controller.addGlobalConstraint(reputationGC.address,helpers.NULL_HASH,avatar.address);


    try {
      //try to mint more than 5 percentage
      await controller.mintReputation(51, accounts[2],avatar.address);
      assert(false,"mint rep should fail due to the reputationGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }

    await controller.mintReputation(50, accounts[2],avatar.address);
    assert.equal(await reputation.totalSupply(),1050);

    try {
      await controller.burnReputation(51, accounts[2],avatar.address);
      assert(false,"burn rep should fail due to the reputationGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }

    await controller.burnReputation(50, accounts[2],avatar.address);
    assert.equal(await reputation.totalSupply(),1000);

    try {
      await controller.mintReputation(10, accounts[2],avatar.address);
      assert(false,"mint rep should fail due to the reputationGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }
    var diff = ((await web3.eth.getBlock("latest")).timestamp - startTime.toNumber())% periodLengthConst;
    //increment time for next period
    helpers.increaseTime(periodLengthConst-diff);

    await controller.mintReputation(10, accounts[2],avatar.address);
    assert.equal(await reputation.totalSupply(),1010);

    await controller.burnReputation(50, accounts[2],avatar.address);
    assert.equal(await reputation.totalSupply(),960);

    try {
      await controller.burnReputation(10, accounts[2],avatar.address);
      assert(false,"burn rep should fail due to the reputationGC global constraint ");
    }
    catch(ex){
      helpers.assertVMException(ex);
    }

    diff = ((await web3.eth.getBlock("latest")).timestamp - startTime.toNumber())% periodLengthConst;
    //increment time for next period
    helpers.increaseTime(periodLengthConst-diff);
    await controller.burnReputation(10, accounts[2],avatar.address);
    assert.equal(await reputation.totalSupply(),950);

    });
});
