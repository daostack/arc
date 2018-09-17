const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');

var LockingEth4Reputation = artifacts.require("./LockingEth4Reputation.sol");

const setup = async function (accounts,_repAllocation = 100,_lockingStartTime = 0,_lockingEndTime = 3000,_maxLockingPeriod = 6000) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.lockingEndTime = (await web3.eth.getBlock("latest")).timestamp + _lockingEndTime;
   testSetup.lockingStartTime = (await web3.eth.getBlock("latest")).timestamp + _lockingStartTime;
   testSetup.lockingEth4Reputation = await LockingEth4Reputation.new(testSetup.org.avatar.address,_repAllocation,testSetup.lockingStartTime,testSetup.lockingEndTime,_maxLockingPeriod);

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.lockingEth4Reputation.address],[helpers.NULL_HASH],[permissions]);
   return testSetup;
};

contract('LockingEth4Reputation', accounts => {
    it("constructor", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.lockingEth4Reputation.reputationReward(),100);
      assert.equal(await testSetup.lockingEth4Reputation.maxLockingPeriod(),6000);
      assert.equal(await testSetup.lockingEth4Reputation.lockingEndTime(),testSetup.lockingEndTime);
    });

    it("lock", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Lock");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._period,100);
      assert.equal(tx.logs[0].args._locker,accounts[0]);
    });

    it("lock with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('0', "ether")});
        assert(false, "lock with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock before start should revert", async () => {
      let testSetup = await setup(accounts,100,1000);
      try {
        await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        assert(false, "lock before start should  revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock after _lockingEndTime should revert", async () => {
      let testSetup = await setup(accounts);
      await helpers.increaseTime(3001);
      try {
        await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        assert(false, "lock after _lockingEndTime should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with period == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingEth4Reputation.lock(0,{value:web3.utils.toWei('1', "ether")});
        assert(false, "lock with period == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock over _maxLockingPeriod should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingEth4Reputation.lock(6001,{value:web3.utils.toWei('1', "ether")});
        assert(false, "lock over _maxLockingPeriod should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      await helpers.increaseTime(101);
      tx = await testSetup.lockingEth4Reputation.release(accounts[0],lockingId);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Release");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
    });

    it("release before locking period should revert", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      try {
        await testSetup.lockingEth4Reputation.release(accounts[0],lockingId);
        assert(false, "release before locking period  should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release cannot release twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(101);
        await testSetup.lockingEth4Reputation.release(accounts[0],lockingId);
        try {
          await testSetup.lockingEth4Reputation.release(accounts[0],lockingId);
          assert(false, "release cannot release twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        tx = await testSetup.lockingEth4Reputation.redeem(accounts[0],lockingId);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"Redeem");
        assert.equal(tx.logs[0].args._lockingId,lockingId);
        assert.equal(tx.logs[0].args._amount,100);
        assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[0]),1000+100);
    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingEth4Reputation.lock(100,{from:accounts[0],value:web3.utils.toWei('1', "ether")});
        var lockingId1 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        tx = await testSetup.lockingEth4Reputation.lock(300,{from:accounts[1],value:web3.utils.toWei('1', "ether")});
        var lockingId2 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        await testSetup.lockingEth4Reputation.redeem(accounts[0],lockingId1);
        await testSetup.lockingEth4Reputation.redeem(accounts[1],lockingId2);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[0]),1000+25);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[1]),75);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        await testSetup.lockingEth4Reputation.redeem(accounts[0],lockingId);
        try {
          await testSetup.lockingEth4Reputation.redeem(accounts[0],lockingId);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before lockingEndTime should revert", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingEth4Reputation.lock(100,{value:web3.utils.toWei('1', "ether")});
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(50);
        try {
             await testSetup.lockingEth4Reputation.redeem(accounts[0],lockingId);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });
});
