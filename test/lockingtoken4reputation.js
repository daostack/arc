const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
var LockingToken4Reputation = artifacts.require("./LockingToken4Reputation.sol");

const setup = async function (accounts,_repAllocation = 100,_lockingStartTime = 0,_lockingEndTime = 3000,_maxLockingPeriod = 6000) {
   var testSetup = new helpers.TestSetup();
   testSetup.lockingToken = await StandardTokenMock.new(accounts[0], web3.toWei('100', "ether"));
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.lockingEndTime = await web3.eth.getBlock("latest").timestamp + _lockingEndTime;
   testSetup.lockingStartTime = await web3.eth.getBlock("latest").timestamp + _lockingStartTime;
   testSetup.lockingToken4Reputation = await LockingToken4Reputation.new(testSetup.org.avatar.address,
                                                                       _repAllocation,
                                                                      testSetup.lockingStartTime,
                                                                      testSetup.lockingEndTime,
                                                                      _maxLockingPeriod,
                                                                      testSetup.lockingToken.address);

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.lockingToken4Reputation.address],[0],[permissions]);
   await testSetup.lockingToken.approve(testSetup.lockingToken4Reputation.address,web3.toWei('100', "ether"));
   return testSetup;
};

contract('LockingToken4Reputation', accounts => {
    it("constructor", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.lockingToken4Reputation.reputationReward(),100);
      assert.equal(await testSetup.lockingToken4Reputation.maxLockingPeriod(),6000);
      assert.equal(await testSetup.lockingToken4Reputation.lockingEndTime(),testSetup.lockingEndTime);
      assert.equal(await testSetup.lockingToken4Reputation.token(),testSetup.lockingToken.address);
    });

    it("lock", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Lock");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._period,100);
      assert.equal(tx.logs[0].args._locker,accounts[0]);
    });

    it("lock with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.toWei('0', "ether"),100);
        assert(false, "lock with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock after _lockingEndTime should revert", async () => {
      let testSetup = await setup(accounts);
      await helpers.increaseTime(3001);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
        assert(false, "lock after _lockingEndTime should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock before start should  revert", async () => {
      let testSetup = await setup(accounts,100,100);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),0);
        assert(false, "lock before start should  revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with period == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),0);
        assert(false, "lock with period == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock over _maxLockingPeriod should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),6001);
        assert(false, "lock over _maxLockingPeriod should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      await helpers.increaseTime(101);
      tx = await testSetup.lockingToken4Reputation.release(accounts[0],lockingId);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Release");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
    });

    it("release before locking period should revert", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      try {
        await testSetup.lockingToken4Reputation.release(accounts[0],lockingId);
        assert(false, "release before locking period  should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release cannot release twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(101);
        await testSetup.lockingToken4Reputation.release(accounts[0],lockingId);
        try {
          await testSetup.lockingToken4Reputation.release(accounts[0],lockingId);
          assert(false, "release cannot release twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        tx = await testSetup.lockingToken4Reputation.redeem(accounts[0],lockingId);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"Redeem");
        assert.equal(tx.logs[0].args._lockingId,lockingId);
        assert.equal(tx.logs[0].args._amount,100);
        assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[0]),1000+100);
    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100 ,{from:accounts[0]});
        var lockingId1 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await testSetup.lockingToken.transfer(accounts[1],web3.toWei('1', "ether"));
        await testSetup.lockingToken.approve(testSetup.lockingToken4Reputation.address,web3.toWei('100', "ether"),{from:accounts[1]});
        tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),300 ,{from:accounts[1]});
        var lockingId2 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        await testSetup.lockingToken4Reputation.redeem(accounts[0],lockingId1);
        await testSetup.lockingToken4Reputation.redeem(accounts[1],lockingId2);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[0]),1000+25);
        assert.equal(await testSetup.org.reputation.reputationOf(accounts[1]),75);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(3001);
        await testSetup.lockingToken4Reputation.redeem(accounts[0],lockingId);
        try {
          await testSetup.lockingToken4Reputation.redeem(accounts[0],lockingId);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before lockingEndTime should revert", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.lockingToken4Reputation.lock(web3.toWei('1', "ether"),100);
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(50);
        try {
             await testSetup.lockingToken4Reputation.redeem(accounts[0],lockingId);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });
});
