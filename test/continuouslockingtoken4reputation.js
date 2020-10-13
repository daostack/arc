const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");

const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
var ContinuousLocking4Reputation = artifacts.require("./ContinuousLocking4Reputation.sol");


const setup = async function (accounts,
                             _initialize = true,
                             _reputationReward = 850000,
                             _startTime = 0,
                             _periodsUnit = (30*60*60),
                             _redeemEnableTime = (30*60*60),
                             _maxLockingPeriod = 12,
                             _repRewardConstA = 85000,
                             _repRewardConstB = 900,
                             _periodsCap = 100,
                             _agreementHash = helpers.SOME_HASH
                           ) {
   var testSetup = new helpers.TestSetup();
   testSetup.lockingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
   var controllerCreator = await ControllerCreator.new();
   var daoTracker = await DAOTracker.new();
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address);

   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.startTime = (await web3.eth.getBlock("latest")).timestamp + _startTime;
   testSetup.redeemEnableTime = (await web3.eth.getBlock("latest")).timestamp + _redeemEnableTime;
   testSetup.continuousLocking4Reputation = await ContinuousLocking4Reputation.new();
   testSetup.periodsUnit = _periodsUnit;
   testSetup.agreementHash = _agreementHash;
   testSetup.maxLockingPeriod = _maxLockingPeriod;

   testSetup.repRewardConstA = _repRewardConstA;
   testSetup.repRewardConstB = _repRewardConstB;
   testSetup.reputationReward = _reputationReward;
   testSetup.periodsCap = _periodsCap;
   if (_initialize === true ) {
     await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                     testSetup.reputationReward,
                                                     testSetup.startTime,
                                                     testSetup.periodsUnit,
                                                     testSetup.redeemEnableTime,
                                                     testSetup.maxLockingPeriod,
                                                     testSetup.repRewardConstA,
                                                     testSetup.repRewardConstB,
                                                     testSetup.periodsCap,
                                                     testSetup.lockingToken.address,
                                                     testSetup.agreementHash
                                                     );
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.continuousLocking4Reputation.address],[web3.utils.asciiToHex("0")],[permissions],"metaData");
   await testSetup.lockingToken.approve(testSetup.continuousLocking4Reputation.address,web3.utils.toWei('100', "ether"));
   return testSetup;
};

contract('ContinuousLocking4Reputation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.continuousLocking4Reputation.reputationRewardLeft(),testSetup.reputationReward);
      assert.equal(await testSetup.continuousLocking4Reputation.startTime(),testSetup.startTime);
      assert.equal(await testSetup.continuousLocking4Reputation.redeemEnableTime(),testSetup.redeemEnableTime);
      assert.equal(await testSetup.continuousLocking4Reputation.token(),testSetup.lockingToken.address);
      assert.equal(await testSetup.continuousLocking4Reputation.batchTime(),testSetup.periodsUnit);
      assert.equal(await testSetup.continuousLocking4Reputation.getAgreementHash(),testSetup.agreementHash);
      assert.equal(await testSetup.continuousLocking4Reputation.batchesIndexCap(),testSetup.periodsCap);
    });

    it("initialize periodsUnit <= 15 seconds  is not allowed", async () => {
      let testSetup = await setup(accounts,false);
      try {
        await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                        testSetup.reputationReward,
                                                        testSetup.startTime,
                                                        1,
                                                        testSetup.redeemEnableTime,
                                                        testSetup.maxLockingPeriod,
                                                        testSetup.repRewardConstA,
                                                        testSetup.repRewardConstB,
                                                        testSetup.periodsCap,
                                                        testSetup.lockingToken.address,
                                                        testSetup.agreementHash
                                                        );
        assert(false, "periodsUnit < 15  is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("initialize _redeemEnableTime < _startTime+_periodsUnit is not allowed", async () => {
      let testSetup = await setup(accounts,false);
      try {
        await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                        testSetup.reputationReward,
                                                        testSetup.startTime,
                                                        testSetup.periodsUnit,
                                                        testSetup.startTime + testSetup.periodsUnit -7,
                                                        testSetup.maxLockingPeriod,
                                                        testSetup.repRewardConstA,
                                                        testSetup.repRewardConstB,
                                                        testSetup.periodsCap,
                                                        testSetup.lockingToken.address,
                                                        testSetup.agreementHash
                                                        );
        assert(false, "_redeemEnableTime < _startTime+_periodsUnit  is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("period cap", async () => {
      let testSetup = await setup(accounts,false);
      try {
        await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                        testSetup.reputationReward,
                                                        testSetup.startTime,
                                                        testSetup.periodsUnit,
                                                        testSetup.redeemEnableTime,
                                                        testSetup.maxLockingPeriod,
                                                        testSetup.repRewardConstA,
                                                        testSetup.repRewardConstB,
                                                        testSetup.periodsCap +1,
                                                        testSetup.lockingToken.address,
                                                        testSetup.agreementHash
                                                        );
        assert(false, "period cap cannot be greater than 100");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("repRewardConstA < reputationReward", async () => {
      let testSetup = await setup(accounts,false);

      try {
        //try to init with repRewardConstA == reputationReward
        await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                        testSetup.reputationReward,
                                                        testSetup.startTime,
                                                        testSetup.periodsUnit,
                                                        testSetup.redeemEnableTime,
                                                        testSetup.maxLockingPeriod,
                                                        testSetup.reputationReward,
                                                        testSetup.repRewardConstB,
                                                        testSetup.periodsCap,
                                                        testSetup.lockingToken.address,
                                                        testSetup.agreementHash
                                                        );
        assert(false, "repRewardConstA < reputationReward");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });


    it("lock", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"), 12 , 0, testSetup.agreementHash);
      var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"LockToken");
      assert.equal(tx.logs[0].args._lockingId,id);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._locker,accounts[0]);
      //test the tokens moved to the wallet.
      assert.equal(await testSetup.lockingToken.balanceOf(testSetup.continuousLocking4Reputation.address),web3.utils.toWei('1', "ether"));
    });

    it("lock twice does not overwrite score", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.continuousLocking4Reputation.lock(100, 12 , 0, testSetup.agreementHash);
      var id1= await helpers.getValueFromLogs(tx, '_lockingId',0);
      tx = await testSetup.continuousLocking4Reputation.lock(500, 12 , 0, testSetup.agreementHash);
      var id2 = await helpers.getValueFromLogs(tx, '_lockingId',0);

      assert.equal((await testSetup.continuousLocking4Reputation.getLockingIdScore(11,id1)).toNumber(),100);
      assert.equal((await testSetup.continuousLocking4Reputation.getLockingIdScore(11,id2)).toNumber(),500);

    });


    it("lock without initialize should fail", async () => {
      let testSetup = await setup(accounts,false);
      try {
        await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0, testSetup.agreementHash);
        assert(false, "lock without initialize should fail");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with wrong agreementHash should fail", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0, helpers.NULL_HASH);
        assert(false, "lock with wrong agreementHash should fail");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('0', "ether"),1,0,testSetup.agreementHash);
        assert(false, "lock with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with period over maxLockingPeriod should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('0', "ether"),testSetup.maxLockingPeriod +1 ,0,testSetup.agreementHash);
        assert(false, "lock with period over maxLockingPeriod should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit * period +1);
        tx = await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        assert.equal(tx.logs.length,12);
        var totalRedeemAmount = 0;
        var redeemAmount = 0;
        for (var lockingPeriodToRedeemFrom = 0; lockingPeriodToRedeemFrom < period; lockingPeriodToRedeemFrom++) {
            redeemAmount = testSetup.repRewardConstA * (Math.pow((testSetup.repRewardConstB/1000),lockingPeriodToRedeemFrom));
            totalRedeemAmount += redeemAmount;
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].event,"Redeem");
            var rep  = tx.logs[lockingPeriodToRedeemFrom].args._amount.toNumber();
            //this is due to real math calculation
            assert.equal(((rep === Math.floor(redeemAmount)) || (rep +1 === Math.floor(redeemAmount))),true);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._beneficiary,accounts[0]);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._batchIndex,lockingPeriodToRedeemFrom);
        }
        totalRedeemAmount = Math.floor(totalRedeemAmount);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount);
    });

    it("redeem part of the periods", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit * 3 +1);
        tx = await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        var totalRedeemAmount = 230349;

        assert.equal(tx.logs.length,3);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount);

        await helpers.increaseTime(testSetup.periodsUnit * 9  +1);
        tx = await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        totalRedeemAmount = 0;
        var redeemAmount = 0;
        for (var lockingPeriodToRedeemFrom = 3; lockingPeriodToRedeemFrom < period; lockingPeriodToRedeemFrom++) {
             redeemAmount = testSetup.repRewardConstA * (Math.pow((testSetup.repRewardConstB/1000),lockingPeriodToRedeemFrom));
             totalRedeemAmount += redeemAmount;
             assert.equal(tx.logs.length,9);
             assert.equal(tx.logs[lockingPeriodToRedeemFrom-3].event,"Redeem");
             var rep  = tx.logs[lockingPeriodToRedeemFrom-3].args._amount.toNumber();
             assert.equal(((rep === Math.floor(redeemAmount)) || (rep +1 === Math.floor(redeemAmount))),true);
             assert.equal(tx.logs[lockingPeriodToRedeemFrom-3].args._beneficiary,accounts[0]);
             assert.equal(tx.logs[lockingPeriodToRedeemFrom-3].args._batchIndex,lockingPeriodToRedeemFrom);
        }

        totalRedeemAmount = Math.round(totalRedeemAmount) - 1;

        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount + 230349);

    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash,{from:accounts[0]});
        var id1 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await testSetup.lockingToken.transfer(accounts[1],web3.utils.toWei('3', "ether"));
        await testSetup.lockingToken.approve(testSetup.continuousLocking4Reputation.address,web3.utils.toWei('100', "ether"),{from:accounts[1]});
        tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('3', "ether"),1,0,testSetup.agreementHash,{from:accounts[1]});
        var id2 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit  +1);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id1);
        await testSetup.continuousLocking4Reputation.redeem(accounts[1],id2);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+85000/4);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),85000*3/4);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit  +1);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        try {
          await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before redeemEnableTime should revert", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);

        try {
             await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
             assert(false, "redeem before redeemEnableTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
        await helpers.increaseTime(testSetup.redeemEnableTime);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
    });

    it("lock and redeem from all lockings", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
        var id1 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit+1);
        tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,1,testSetup.agreementHash);
        var id2 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit+1);
        tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,2,testSetup.agreementHash);
        var id3 = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime((testSetup.periodsUnit+1)*3);
        //todo oren-- fill this up :)
        // var totalBid1 = await testSetup.continuousLocking4Reputation.auctions(id1);
        // var totalBid2 = await testSetup.continuousLocking4Reputation.auctions(id2);
        // var totalBid3 = await testSetup.continuousLocking4Reputation.auctions(id3);
        // assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid2)),true);
        // assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid3)),true);
        // assert.equal(totalBid1,web3.utils.toWei('1', "ether"));
        // assert.equal(id1,0);
        // assert.equal(id2,1);
        // assert.equal(id3,2);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id1);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id2);
        await testSetup.continuousLocking4Reputation.redeem(accounts[0],id3);
      //  assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+300);
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                             testSetup.reputationReward,
                                                             testSetup.startTime,
                                                             testSetup.periodsUnit,
                                                             testSetup.redeemEnableTime,
                                                             testSetup.maxLockingPeriod,
                                                             testSetup.repRewardConstA,
                                                             testSetup.repRewardConstB,
                                                             testSetup.periodsCap,
                                                             testSetup.lockingToken.address,
                                                             testSetup.agreementHash
                                                             );
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("cannot lock with wrong _lockingPeriodToLockIn", async () => {
        var lockingPeriodToLockIn = 2;
        let testSetup = await setup(accounts);
        try {
             await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,lockingPeriodToLockIn,testSetup.agreementHash);
             assert(false, "cannot lock with wrong _lockingPeriodToLockIn");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("release", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      await helpers.increaseTime(testSetup.periodsUnit+1);
      tx = await testSetup.continuousLocking4Reputation.release(accounts[0],lockingId);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Release");
      assert.equal(tx.logs[0].args._lockingId.toNumber(),lockingId.toNumber());
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
    });

    it("release before locking period should revert", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      try {
        await testSetup.continuousLocking4Reputation.release(accounts[0],lockingId);
        assert(false, "release before locking period  should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release cannot release twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
        var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit+1);
        await testSetup.continuousLocking4Reputation.release(accounts[0],lockingId);
        try {
          await testSetup.continuousLocking4Reputation.release(accounts[0],lockingId);
          assert(false, "release cannot release twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem reward limits 100 periods", async () => {
        let testSetup = await setup(accounts);
        var repForPeriod = await testSetup.continuousLocking4Reputation.getRepRewardPerBatch(100);
        var REAL_FBITS = 40;
        var res = (repForPeriod.shrn(REAL_FBITS).toNumber() + (repForPeriod.maskn(REAL_FBITS)/Math.pow(2,REAL_FBITS))).toFixed(2);
        assert.equal(Math.floor(res),Math.floor(testSetup.repRewardConstA* Math.pow(testSetup.repRewardConstB/1000,100)));
        assert.equal(await testSetup.continuousLocking4Reputation.getRepRewardPerBatch(101),0);
    });

    it("redeem limits 100 periods", async () => {
        let testSetup = await setup(accounts,false);
        var period = 24;
        await helpers.increaseTime(testSetup.periodsUnit*90+1);
        await testSetup.continuousLocking4Reputation.initialize(testSetup.org.avatar.address,
                                                        testSetup.reputationReward,
                                                        testSetup.startTime,
                                                        testSetup.periodsUnit,
                                                        testSetup.redeemEnableTime,
                                                        period,
                                                        testSetup.repRewardConstA,
                                                        testSetup.repRewardConstB,
                                                        testSetup.periodsCap,
                                                        testSetup.lockingToken.address,
                                                        testSetup.agreementHash
                                                        );
        await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,90,testSetup.agreementHash);
        try {
          await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,90,testSetup.agreementHash);
          assert(false, "exceed max allowe periods");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("extend locking withouth lock should fail", async () => {
        let testSetup = await setup(accounts);
        try {
          await testSetup.continuousLocking4Reputation.extendLocking(1,0,helpers.SOME_HASH,testSetup.agreementHash);
          assert(false, "extend locking withouth lock should fail");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("extend locking ", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        //increase time with one period
        await helpers.increaseTime(testSetup.periodsUnit*1+1);
        tx = await testSetup.continuousLocking4Reputation.extendLocking(1,1,id,testSetup.agreementHash);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"ExtendLocking");
        assert.equal(tx.logs[0].args._lockingId.toNumber(),id.toNumber());
        assert.equal(tx.logs[0].args._extendPeriod,1);
        await helpers.increaseTime(testSetup.periodsUnit*11+1);
        try {
          await testSetup.continuousLocking4Reputation.release(accounts[0],id);
          assert(false, "release cannot release before time");
        } catch(error) {
          helpers.assertVMException(error);
        }
        await helpers.increaseTime(testSetup.periodsUnit*1+1);
        await testSetup.continuousLocking4Reputation.release(accounts[0],id);

        tx = await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        var totalRedeemAmount = 0;
        var redeemAmount = 0;
        for (var lockingPeriodToRedeemFrom = 0; lockingPeriodToRedeemFrom < period+1; lockingPeriodToRedeemFrom++) {
            redeemAmount = testSetup.repRewardConstA * (Math.pow((testSetup.repRewardConstB/1000),lockingPeriodToRedeemFrom));
            totalRedeemAmount += redeemAmount;
            assert.equal(tx.logs.length,period+1);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].event,"Redeem");
            var rep  = tx.logs[lockingPeriodToRedeemFrom].args._amount.toNumber();
            assert.equal(((rep === Math.floor(redeemAmount)) || (rep +1 === Math.floor(redeemAmount))),true);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._beneficiary,accounts[0]);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._batchIndex,lockingPeriodToRedeemFrom);
        }
        totalRedeemAmount = Math.floor(totalRedeemAmount);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount);

    });

    it("extend locking should not exceed the max period allowed", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        try {
          await testSetup.continuousLocking4Reputation.extendLocking(1,0,id,testSetup.agreementHash);
          assert(false, "extend locking should not exceed the max period allowed");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("extend locking limits", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        for (var i = 12;i< 96 ;i +=12 ) {
            await helpers.increaseTime(testSetup.periodsUnit*12+1);
            await testSetup.continuousLocking4Reputation.extendLocking(period,i,id,testSetup.agreementHash);
        }
        await helpers.increaseTime(testSetup.periodsUnit*12+1);
        await testSetup.continuousLocking4Reputation.extendLocking(4,96,id,testSetup.agreementHash);

        await helpers.increaseTime(testSetup.periodsUnit*3+1);
        try {
          await testSetup.continuousLocking4Reputation.release(accounts[0],id);
          assert(false, "release cannot release before time");
        } catch(error) {
          helpers.assertVMException(error);
        }
        await helpers.increaseTime(testSetup.periodsUnit*1+1);
        await testSetup.continuousLocking4Reputation.release(accounts[0],id);

        tx = await testSetup.continuousLocking4Reputation.redeem(accounts[0],id);
        assert.equal(tx.logs.length,100);
        var totalRedeemAmount = 0;
        var redeemAmount = 0;
        for (var lockingPeriodToRedeemFrom = 0; lockingPeriodToRedeemFrom < 100; lockingPeriodToRedeemFrom++) {
            redeemAmount = testSetup.repRewardConstA * (Math.pow((testSetup.repRewardConstB/1000),lockingPeriodToRedeemFrom));
            totalRedeemAmount += redeemAmount;
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].event,"Redeem");
            var rep  = tx.logs[lockingPeriodToRedeemFrom].args._amount.toNumber();
            assert.equal(((rep === Math.floor(redeemAmount)) || (rep +1 === Math.floor(redeemAmount))),true);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._beneficiary,accounts[0]);
            assert.equal(tx.logs[lockingPeriodToRedeemFrom].args._batchIndex,lockingPeriodToRedeemFrom);
        }
        totalRedeemAmount = Math.floor(totalRedeemAmount);

        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount);

    });
});
