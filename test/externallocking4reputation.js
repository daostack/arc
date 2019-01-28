const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
var ExternalLocking4Reputation = artifacts.require("./ExternalLocking4Reputation.sol");
var ExternalTokenLockerMock = artifacts.require("./ExternalTokenLockerMock.sol");

const setup = async function (accounts,_repAllocation = 100,_claimingStartTime = 0,_claimingEndTime = 3000,_redeemEnableTime = 3000,_initialize = true) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   var block = await web3.eth.getBlock("latest");
   testSetup.lockingEndTime = block.timestamp + _claimingEndTime;
   testSetup.lockingStartTime = block.timestamp + _claimingStartTime;
   testSetup.redeemEnableTime = block.timestamp + _redeemEnableTime;
   testSetup.extetnalTokenLockerMock = await ExternalTokenLockerMock.new();
   await testSetup.extetnalTokenLockerMock.lock(100,accounts[0]);
   await testSetup.extetnalTokenLockerMock.lock(200,accounts[1]);
   await testSetup.extetnalTokenLockerMock.lock(300,accounts[2]);

   testSetup.externalLocking4Reputation = await ExternalLocking4Reputation.new();
   if (_initialize === true) {
     await testSetup.externalLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                             _repAllocation,
                                                             testSetup.lockingStartTime,
                                                             testSetup.lockingEndTime,
                                                             testSetup.redeemEnableTime,
                                                             testSetup.extetnalTokenLockerMock.address,
                                                             "lockedTokenBalances(address)");
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.externalLocking4Reputation.address],[helpers.NULL_HASH],[permissions]);
   return testSetup;
};

contract('ExternalLocking4Reputation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.externalLocking4Reputation.reputationReward(),100);
      assert.equal(await testSetup.externalLocking4Reputation.lockingEndTime(),testSetup.lockingEndTime);
      assert.equal(await testSetup.externalLocking4Reputation.lockingStartTime(),testSetup.lockingStartTime);
      assert.equal(await testSetup.externalLocking4Reputation.redeemEnableTime(),testSetup.redeemEnableTime);
      assert.equal(await testSetup.externalLocking4Reputation.externalLockingContract(),testSetup.extetnalTokenLockerMock.address);
      assert.equal(await testSetup.externalLocking4Reputation.getBalanceFuncSignature(),"lockedTokenBalances(address)");
    });

    it("externalLockingMock is onlyOwner", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.extetnalTokenLockerMock.lock(1030,accounts[3],{from:accounts[1]});
        assert(false, "externalLockingMock is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }

    });

    it("claim", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Lock");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,100);
      assert.equal(tx.logs[0].args._period,1);
      assert.equal(tx.logs[0].args._locker,accounts[0]);
    });

    it("claim on behalf of a  beneficiary", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.externalLocking4Reputation.register({from:accounts[1]});
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Register");
      assert.equal(tx.logs[0].args._beneficiary,accounts[1]);
      tx = await testSetup.externalLocking4Reputation.claim(accounts[1]);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Lock");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,200);
      assert.equal(tx.logs[0].args._period,1);
      assert.equal(tx.logs[0].args._locker,accounts[1]);
    });

    it("cannot claim on behalf of a  beneficiary if not register", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.externalLocking4Reputation.claim(accounts[1]);
        assert(false, "cannot claim on behalf of a  beneficiary if not register");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });


    it("cannot claim before set parameters", async () => {
      let testSetup = await setup(accounts,100,0,3000,3000,false);
      try {
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        assert(false, "cannot lock before set parameters");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("claim with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS,{from:accounts[4]});
        assert(false, "lock with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("claim after _claimingEndTime should revert", async () => {
      let testSetup = await setup(accounts);
      await helpers.increaseTime(3001);
      try {
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        assert(false, "lock after _claimingEndTime should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("claim before start should  revert", async () => {
      let testSetup = await setup(accounts,100,100);
      try {
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        assert(false, "lock before start should  revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot claim twice for the same user", async () => {
      let testSetup = await setup(accounts);
      await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
      try {
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        assert(false, "cannot lock twice for the same user");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        await helpers.increaseTime(3001);
        tx = await testSetup.externalLocking4Reputation.redeem(accounts[0]);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"Redeem");
        assert.equal(tx.logs[0].args._amount,100);
        assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+100);
    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS,{from:accounts[0]});
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS,{from:accounts[2]});
        await helpers.increaseTime(3001);
        await testSetup.externalLocking4Reputation.redeem(accounts[0]);
        await testSetup.externalLocking4Reputation.redeem(accounts[2]);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+25);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]),75);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        await helpers.increaseTime(3001);
        await testSetup.externalLocking4Reputation.redeem(accounts[0]);
        try {
          await testSetup.externalLocking4Reputation.redeem(accounts[0]);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before lockingEndTime should revert", async () => {
        let testSetup = await setup(accounts);
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        await helpers.increaseTime(50);
        try {
             await testSetup.externalLocking4Reputation.redeem(accounts[0]);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("redeem before redeemEnableTime should revert", async () => {
        let testSetup = await setup(accounts,100,0,3000,4000,true);
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        await helpers.increaseTime(3500);
        try {
             await testSetup.externalLocking4Reputation.redeem(accounts[0]);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
        await helpers.increaseTime(501);
        await testSetup.externalLocking4Reputation.redeem(accounts[0]);

    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.externalLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                                     100,
                                                                     testSetup.lockingStartTime,
                                                                     testSetup.lockingEndTime,
                                                                     testSetup.redeemEnableTime,
                                                                     testSetup.extetnalTokenLockerMock.address,
                                                                     "lockedTokenBalances(address)");
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("initialize is onlyOwner", async () => {
      var externalLocking4Reputation = await ExternalLocking4Reputation.new();
      try {
        await externalLocking4Reputation.initialize(accounts[0],
                                                       100,
                                                       0,
                                                       3000,
                                                       3000,
                                                       accounts[0],
                                                       "lockedTokenBalances(address)",
                                              {from:accounts[1]});
        assert(false, "initialize is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await externalLocking4Reputation.initialize(accounts[0],
                                                     100,
                                                     0,
                                                     3000,
                                                     3000,
                                                     accounts[0],
                                                     "lockedTokenBalances(address)",
                                                     {from:accounts[0]});
    });

    it("redeemEnableTime >= lockingEndTime ", async () => {
      var externalLocking4Reputation = await ExternalLocking4Reputation.new();
      try {
        await externalLocking4Reputation.initialize(accounts[0],
                                                       100,
                                                       0,
                                                       3000,
                                                       3000-1,
                                                       accounts[0],
                                                       "lockedTokenBalances(address)",
                                              {from:accounts[0]});
        assert(false, "redeemEnableTime >= lockingEndTime");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await externalLocking4Reputation.initialize(accounts[0],
                                                     100,
                                                     0,
                                                     3000,
                                                     3000,
                                                     accounts[0],
                                                     "lockedTokenBalances(address)",
                                                     {from:accounts[0]});
    });

    it("get earned reputation", async () => {
        let testSetup = await setup(accounts);
        await testSetup.externalLocking4Reputation.claim(helpers.NULL_ADDRESS);
        await helpers.increaseTime(3001);
        const reputation = await testSetup.externalLocking4Reputation.redeem.call(accounts[0]);
        assert.equal(reputation,100);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
    });
});
