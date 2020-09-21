const helpers = require('./helpers');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
var SchemeFactory = artifacts.require("./SchemeFactory.sol");
var ContinuousLocking4Reputation = artifacts.require("./ContinuousLocking4Reputation.sol");
var CL4RRedeemer = artifacts.require("./CL4RRedeemer.sol");
const Controller = artifacts.require('./Controller.sol');

class ContinuousLocking4ReputationParams {
  constructor() {
  }
}
class CL4RRedeemerParams {
  constructor() {
  }
}

class SchemeFactoryParams {
  constructor() {
  }
}
let registration;

const setupSchemeFactoryParams = async function(
  accounts,
  genesisProtocol
  ) {
var schemeFactoryParams = new SchemeFactoryParams();
    if (genesisProtocol === true) {
      schemeFactoryParams.votingMachine = await helpers.setupGenesisProtocol(accounts,helpers.NULL_ADDRESS,helpers.NULL_ADDRESS);
      schemeFactoryParams.initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
      .methods
      .initialize(helpers.NULL_ADDRESS,
      schemeFactoryParams.votingMachine.genesisProtocol.address,
      schemeFactoryParams.votingMachine.uintArray,
      schemeFactoryParams.votingMachine.voteOnBehalf,
      helpers.NULL_HASH,
      registration.daoFactory.address)
      .encodeABI();
    } else {
      schemeFactoryParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      schemeFactoryParams.initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
      .methods
      .initialize(helpers.NULL_ADDRESS,
      schemeFactoryParams.votingMachine.absoluteVote.address,
      [0,0,0,0,0,0,0,0,0,0,0],
      helpers.NULL_ADDRESS,
      schemeFactoryParams.votingMachine.params,
      registration.daoFactory.address)
      .encodeABI();
    }

    return schemeFactoryParams;
};
const setup = async function (accounts,
                             _reputationReward = 850000,
                             _startTime = 0,
                             _periodsUnit = (30*60*60),
                             _redeemEnableTime = (30*60*60),
                             _maxLockingPeriod = 12,
                             _repRewardConstA = 85000,
                             _repRewardConstB = 900,
                             _periodsCap = 100,
                             _agreementHash = helpers.SOME_HASH
                           )
  {
    var testSetup = new helpers.TestSetup();
    testSetup.proxyAdmin = accounts[5];
    registration = await helpers.registerImplementation();
    testSetup.lockingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
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
    testSetup.continuousLocking4ReputationParams = new ContinuousLocking4ReputationParams();
    testSetup.continuousLocking4ReputationParams.initdata = await new web3.eth.Contract(registration.continuousLocking4Reputation.abi)
    .methods
    .initialize(helpers.NULL_ADDRESS,
                testSetup.reputationReward,
                testSetup.startTime,
                testSetup.periodsUnit,
                testSetup.redeemEnableTime,
                testSetup.maxLockingPeriod,
                testSetup.repRewardConstA,
                testSetup.repRewardConstB,
                testSetup.periodsCap,
                testSetup.lockingToken.address,
                testSetup.agreementHash)
                .encodeABI();
    testSetup.schemeFactoryParams= await setupSchemeFactoryParams(
      accounts,
      false);

    var permissions = ["0x00000000", "0x0000001f"];

   [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(
     testSetup.proxyAdmin,
     accounts,
     registration,
     [accounts[0]],
     [1000],
     [1000],
     0,
     [web3.utils.fromAscii("ContinuousLocking4Reputation"), web3.utils.fromAscii("SchemeFactory")],
     helpers.concatBytes(testSetup.continuousLocking4ReputationParams.initdata, testSetup.schemeFactoryParams.initdata),
     [helpers.getBytesLength(testSetup.continuousLocking4ReputationParams.initdata), helpers.getBytesLength(testSetup.schemeFactoryParams.initdata)],
     permissions,
     "metaData"
  );
  testSetup.continuousLocking4Reputation = await ContinuousLocking4Reputation.at(tx.logs[6].args._scheme);
  testSetup.schemeFactory = await SchemeFactory.at(tx.logs[8].args._scheme);
  var tx = await testSetup.schemeFactory.proposeScheme(
    [0,0,0],
    '',
    '0x',
    "0x00000000",
    testSetup.continuousLocking4Reputation.address,
    helpers.NULL_HASH);

    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    tx = await testSetup.schemeFactoryParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
    let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
    assert.equal(proxyEvents.length,0);
    assert.equal(await controller.isSchemeRegistered(testSetup.continuousLocking4Reputation.address),false);

   await testSetup.lockingToken.approve(testSetup.continuousLocking4Reputation.address,web3.utils.toWei('100', "ether"));

   testSetup.cL4RRedeemer = await CL4RRedeemer.new();
   testSetup.cL4RRedeemerParams = new CL4RRedeemerParams();
   testSetup.cL4RRedeemerParams.initdata = await new web3.eth.Contract(registration.cL4RRedeemer.abi)
   .methods.initialize(helpers.NULL_ADDRESS, testSetup.continuousLocking4Reputation.address).encodeABI();

    permissions = "0x00000000";

  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(
    testSetup.proxyAdmin,
    accounts,
    registration,
    [accounts[0]],
    [1000],
    [1000],
    0,
    [web3.utils.fromAscii("CL4RRedeemer")],
    testSetup.cL4RRedeemerParams.initdata,
    [helpers.getBytesLength(testSetup.cL4RRedeemerParams.initdata)],
    [permissions],
    "metaData"
 );

  testSetup.cL4RRedeemer = await CL4RRedeemer.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
   return testSetup;
};


contract('ContinuousLocking4ReputationRedeemer', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.cL4RRedeemer.reputationRewardLeft(),testSetup.reputationReward);
      assert.equal(await testSetup.cL4RRedeemer.startTime(),testSetup.startTime);
      assert.equal(await testSetup.cL4RRedeemer.redeemEnableTime(),testSetup.redeemEnableTime);
      assert.equal(await testSetup.cL4RRedeemer.token(),testSetup.lockingToken.address);
      assert.equal(await testSetup.cL4RRedeemer.batchTime(),testSetup.periodsUnit);
      assert.equal(await testSetup.cL4RRedeemer.batchesIndexCap(),testSetup.periodsCap);
      assert.equal(await testSetup.cL4RRedeemer.cl4r(),testSetup.continuousLocking4Reputation.address);
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var period = 12;
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),period,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit * period +1);
        tx = await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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
        tx = await testSetup.cL4RRedeemer.redeem(accounts[0],id);
        var totalRedeemAmount = 230349;

        assert.equal(tx.logs.length,3);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+totalRedeemAmount);

        await helpers.increaseTime(testSetup.periodsUnit * 9  +1);
        tx = await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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
        await testSetup.cL4RRedeemer.redeem(accounts[0],id1);
        await testSetup.cL4RRedeemer.redeem(accounts[1],id2);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+85000/4);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),85000*3/4);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.continuousLocking4Reputation.lock(web3.utils.toWei('1', "ether"),1,0,testSetup.agreementHash);
        var id = await helpers.getValueFromLogs(tx, '_lockingId',1);
        await helpers.increaseTime(testSetup.periodsUnit  +1);
        await testSetup.cL4RRedeemer.redeem(accounts[0],id);
        try {
          await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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
             await testSetup.cL4RRedeemer.redeem(accounts[0],id);
             assert(false, "redeem before redeemEnableTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
        await helpers.increaseTime(testSetup.redeemEnableTime);
        await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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
        await testSetup.cL4RRedeemer.redeem(accounts[0],id1);
        await testSetup.cL4RRedeemer.redeem(accounts[0],id2);
        await testSetup.cL4RRedeemer.redeem(accounts[0],id3);
      //  assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+300);
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

        tx = await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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

        tx = await testSetup.cL4RRedeemer.redeem(accounts[0],id);
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
