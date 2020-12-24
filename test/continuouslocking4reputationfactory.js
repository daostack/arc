const helpers = require('./helpers');

const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const ContinuousLocking4Reputation = artifacts.require('./ContinuousLocking4Reputation.sol');
const ContinuousLocking4ReputationFactory = artifacts.require('./ContinuousLocking4ReputationFactory.sol');

const setup = async function () {
   var testSetup = new helpers.TestSetup();
   testSetup.continuousLocking4ReputationFactory = await ContinuousLocking4ReputationFactory.new();
   return testSetup;
};

contract('competitionFactory', function(accounts) {
  it('initialize', async () => {
    let testSetup = await setup();
    testSetup.lockingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
    testSetup.startTime = (await web3.eth.getBlock("latest")).timestamp;
    testSetup.redeemEnableTime = (await web3.eth.getBlock("latest")).timestamp + (30*60*60);
    testSetup.continuousLocking4Reputation = await ContinuousLocking4Reputation.new();
    testSetup.periodsUnit = (30*60*60);
    testSetup.agreementHash = helpers.SOME_HASH;
    testSetup.maxLockingPeriod = 12;

    testSetup.repRewardConstA = 85000;
    testSetup.repRewardConstB = 900;
    testSetup.reputationReward = 850000;
    testSetup.periodsCap = 100;
    let cl4rAddress = await testSetup.continuousLocking4ReputationFactory.createCL4R.call(
      helpers.SOME_ADDRESS,
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
    await testSetup.continuousLocking4ReputationFactory.createCL4R(
      helpers.SOME_ADDRESS,
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
    let continuousLocking4Reputation = await ContinuousLocking4Reputation.at(cl4rAddress);
    assert.equal(await continuousLocking4Reputation.reputationRewardLeft(),testSetup.reputationReward);
    assert.equal(await continuousLocking4Reputation.startTime(),testSetup.startTime);
    assert.equal(await continuousLocking4Reputation.redeemEnableTime(),testSetup.redeemEnableTime);
    assert.equal(await continuousLocking4Reputation.token(),testSetup.lockingToken.address);
    assert.equal(await continuousLocking4Reputation.batchTime(),testSetup.periodsUnit);
    assert.equal(await continuousLocking4Reputation.getAgreementHash(),testSetup.agreementHash);
    assert.equal(await continuousLocking4Reputation.batchesIndexCap(),testSetup.periodsCap);
  });

});
