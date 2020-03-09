const helpers = require('./helpers');

const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
var LockingToken4Reputation = artifacts.require("./LockingToken4Reputation.sol");
const PriceOracleMock = artifacts.require('./test/PriceOracleMock.sol');

export class LockingToken4ReputationParams {
  constructor() {
  }
}

var registration;

const setup = async function (accounts,
                             _repAllocation = 100,
                             _lockingStartTime = 0,
                             _lockingEndTime = 3000,
                             _redeemEnableTime = 3000,
                             _maxLockingPeriod = 6000,
                             _agreementHash = helpers.SOME_HASH) {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   testSetup.lockingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
   testSetup.lockingToken2 = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
   

   testSetup.proxyAdmin = accounts[5];
   testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                       accounts,
                                                                       registration,
                                                                       [accounts[0]],
                                                                       [1000],
                                                                       [1000]);
                                                                       
   testSetup.lockingEndTime = (await web3.eth.getBlock("latest")).timestamp + _lockingEndTime;
   testSetup.lockingStartTime = (await web3.eth.getBlock("latest")).timestamp + _lockingStartTime;
   testSetup.redeemEnableTime = (await web3.eth.getBlock("latest")).timestamp + _redeemEnableTime;
   testSetup.agreementHash = _agreementHash;

   testSetup.lockingToken4Reputation = await LockingToken4Reputation.new();
   testSetup.priceOracleMock = await PriceOracleMock.new();
   await testSetup.priceOracleMock.initialize(accounts[0]);
   await testSetup.priceOracleMock.setTokenPrice(testSetup.lockingToken.address,100,4);
   await testSetup.priceOracleMock.setTokenPrice(testSetup.lockingToken2.address,200,4);

  testSetup.lockingToken4ReputationParams = new LockingToken4ReputationParams();

   testSetup.lockingToken4ReputationParams.initdata = await new web3.eth.Contract(registration.lockingToken4Reputation.abi)
   .methods
   .initialize(testSetup.org.avatar.address,
    _repAllocation,
    testSetup.lockingStartTime,
    testSetup.lockingEndTime,
    testSetup.redeemEnableTime,
    _maxLockingPeriod,
    testSetup.priceOracleMock.address,
    testSetup.agreementHash)
   .encodeABI();


   var permissions = "0x00000000";

   var tx = await registration.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [web3.utils.fromAscii("LockingToken4Reputation")],
    testSetup.lockingToken4ReputationParams.initdata,
    [helpers.getBytesLength(testSetup.lockingToken4ReputationParams.initdata)],
    [permissions],
    "metaData",
    {from:testSetup.proxyAdmin});

   testSetup.lockingToken4Reputation = await LockingToken4Reputation.at(tx.logs[1].args._scheme);
   
   await testSetup.lockingToken.approve(testSetup.lockingToken4Reputation.address,web3.utils.toWei('100', "ether"));
   return testSetup;
};

contract('LockingToken4Reputation', accounts => {
    it("get earned reputation", async () => {
        let testSetup = await setup(accounts);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(3001);
        const reputation = await testSetup.lockingToken4Reputation.redeem.call(accounts[0]);
        assert.equal(reputation,100);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
    });

    it("priceOracleMock is onlyOwner", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.priceOracleMock.setTokenPrice(testSetup.lockingToken.address,100,4,{from:accounts[1]});
        assert(false, "priceOracleMock is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }

    });

    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.lockingToken4Reputation.reputationReward(),100);
      assert.equal(await testSetup.lockingToken4Reputation.maxLockingPeriod(),6000);
      assert.equal(await testSetup.lockingToken4Reputation.lockingEndTime(),testSetup.lockingEndTime);
      assert.equal(await testSetup.lockingToken4Reputation.redeemEnableTime(),testSetup.redeemEnableTime);
      assert.equal(await testSetup.lockingToken4Reputation.priceOracleContract(),testSetup.priceOracleMock.address);
      assert.equal(await testSetup.lockingToken4Reputation.getAgreementHash(),testSetup.agreementHash);
    });

    it("lock", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,2);
      assert.equal(tx.logs[0].event,"Lock");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._period,100);
      assert.equal(tx.logs[0].args._locker,accounts[0]);

      assert.equal(tx.logs[1].event,"LockToken");
      assert.equal(tx.logs[1].args._lockingId,lockingId);
      assert.equal(tx.logs[1].args._token,testSetup.lockingToken.address);
      assert.equal(tx.logs[1].args._numerator,100);
      assert.equal(tx.logs[1].args._denominator,4);

      assert.equal(await testSetup.lockingToken4Reputation.totalScore(),100*web3.utils.toWei('1', "ether")*100/4);
      await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
      assert.equal(await testSetup.lockingToken4Reputation.totalScore(),2*100*web3.utils.toWei('1', "ether")*100/4);
    });

    it("cannot lock with wrong agreementHash", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,helpers.NULL_HASH);
        assert(false, "cannot lock with wrong agreementHash");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('0', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "lock with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("numerator == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      await testSetup.priceOracleMock.setTokenPrice(testSetup.lockingToken.address,0,4);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "numerator == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("denominator == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      await testSetup.priceOracleMock.setTokenPrice(testSetup.lockingToken.address,100,0);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "denominator == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock after _lockingEndTime should revert", async () => {
      let testSetup = await setup(accounts);
      await helpers.increaseTime(3001);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "lock after _lockingEndTime should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock before start should  revert", async () => {
      let testSetup = await setup(accounts,100,100);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),0,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "lock before start should  revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock with period == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),0,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "lock with period == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("lock over _maxLockingPeriod should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),6001,testSetup.lockingToken.address,testSetup.agreementHash);
        assert(false, "lock over _maxLockingPeriod should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("release", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      await helpers.increaseTime(101);
      tx = await testSetup.lockingToken4Reputation.release(accounts[0],lockingId);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Release");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
    });

    it("release before locking period should revert", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
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
        var tx = await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
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
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(3001);
        var tx = await testSetup.lockingToken4Reputation.redeem(accounts[0]);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"Redeem");
        assert.equal(tx.logs[0].args._amount,100);
        assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+100);
    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100 ,testSetup.lockingToken.address,testSetup.agreementHash,{from:accounts[0]});
        await testSetup.lockingToken.transfer(accounts[1],web3.utils.toWei('1', "ether"));
        await testSetup.lockingToken.approve(testSetup.lockingToken4Reputation.address,web3.utils.toWei('100', "ether"),{from:accounts[1]});
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),300,testSetup.lockingToken.address,testSetup.agreementHash,{from:accounts[1]});
        await helpers.increaseTime(3001);
        await testSetup.lockingToken4Reputation.redeem(accounts[0]);
        await testSetup.lockingToken4Reputation.redeem(accounts[1]);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+25);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),75);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(3001);
        await testSetup.lockingToken4Reputation.redeem(accounts[0]);
        try {
          await testSetup.lockingToken4Reputation.redeem(accounts[0]);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before lockingEndTime should revert", async () => {
        let testSetup = await setup(accounts);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(50);
        try {
             await testSetup.lockingToken4Reputation.redeem(accounts[0]);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("redeem before redeemEnableTime should revert", async () => {
        let testSetup = await setup(accounts,100,0,3000,4000,6000,helpers.SOME_HASH,true);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(3500);
        try {
             await testSetup.lockingToken4Reputation.redeem(accounts[0]);
             assert(false, "redeem before lockingEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
        await helpers.increaseTime(501);
        await testSetup.lockingToken4Reputation.redeem(accounts[0]);
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.lockingToken4Reputation.initialize(testSetup.org.avatar.address,
                                                                  100,
                                                                  testSetup.lockingStartTime,
                                                                  testSetup.lockingEndTime,
                                                                  testSetup.redeemEnableTime,
                                                                  6000,
                                                                  testSetup.lockingToken.address,
                                                                  testSetup.agreementHash);
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("redeemEnableTime >= lockingEndTime", async () => {
      var lockingToken4Reputation = await LockingToken4Reputation.new();
      try {
        await lockingToken4Reputation.initialize(accounts[1],
                                                  100,
                                                  0,
                                                  100,
                                                  100-1,
                                                  6000,
                                                  accounts[1],
                                                  helpers.SOME_HASH);
        assert(false, "redeemEnableTime >= lockingEndTime");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await lockingToken4Reputation.initialize(accounts[1],
                                                100,
                                                0,
                                                100,
                                                100,
                                                6000,
                                                accounts[1],
                                                helpers.SOME_HASH);
    });

    it("get earned reputation", async () => {
        let testSetup = await setup(accounts);
        await testSetup.lockingToken4Reputation.lock(web3.utils.toWei('1', "ether"),100,testSetup.lockingToken.address,testSetup.agreementHash);
        await helpers.increaseTime(3001);
        const reputation = await testSetup.lockingToken4Reputation.redeem.call(accounts[0]);
        assert.equal(reputation,100);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
    });
});
