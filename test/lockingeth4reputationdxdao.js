const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');

var LockingEth4Reputation = artifacts.require("./LockingEth4Reputation.sol");
var DxDAOLockETH = artifacts.require("./DxDAOLockETH.sol");

const setup = async function (accounts,
                             _repAllocation = 100,
                             _lockingStartTime = 0,
                             _lockingEndTime = 3000,
                             _redeemEnableTime = 3000,
                             _maxLockingPeriod = (30*24*60*80)+1,
                             _agreementHash = helpers.SOME_HASH,
                             _initialize = true) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.lockingEndTime = (await web3.eth.getBlock("latest")).timestamp + _lockingEndTime;
   testSetup.lockingStartTime = (await web3.eth.getBlock("latest")).timestamp + _lockingStartTime;
   testSetup.redeemEnableTime = (await web3.eth.getBlock("latest")).timestamp + _redeemEnableTime;
   testSetup.lockingEth4Reputation = await LockingEth4Reputation.new();
   testSetup.agreementHash = _agreementHash;
   if (_initialize === true) {
      await testSetup.lockingEth4Reputation.initialize(testSetup.org.avatar.address,
                                                          _repAllocation,
                                                          testSetup.lockingStartTime,
                                                          testSetup.lockingEndTime,
                                                          testSetup.redeemEnableTime,
                                                          _maxLockingPeriod,
                                                          testSetup.agreementHash);
   }


   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.lockingEth4Reputation.address],[helpers.NULL_HASH],[permissions],"metaData");
   return testSetup;
};

contract('LockingEth4Reputation', accounts => {

    it("lock", async () => {
      let testSetup = await setup(accounts);
      var testSetup2 = new helpers.TestSetup();
      var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
      testSetup2.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
      testSetup2.org = await helpers.setupOrganization(testSetup2.daoCreator,accounts[0],1000,1000);
      var permissions = "0x00000010";
      testSetup2.dxDAOLockETH = await DxDAOLockETH.new();
      await testSetup2.daoCreator.setSchemes(testSetup2.org.avatar.address,[testSetup2.dxDAOLockETH.address],[helpers.NULL_HASH],[permissions],"metaData");
      await web3.eth.sendTransaction({from:accounts[0],to:testSetup2.org.avatar.address, value: web3.utils.toWei('20', "ether")});
      await testSetup2.dxDAOLockETH.init(testSetup2.org.avatar.address, testSetup.lockingEth4Reputation.address,testSetup.agreementHash);
      var tx = await testSetup2.dxDAOLockETH.lock();
      var lockingId = await helpers.getValueFromLogs(tx, '_lockingId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"LockEth");
      assert.equal(tx.logs[0].args._lockingId,lockingId);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('10', "ether"));
      assert.equal(tx.logs[0].args._period.toString(),(30*24*60*60));
      try {
        await testSetup2.dxDAOLockETH.lock();
        assert(false, "cannot lock twice");
      } catch(error) {
        helpers.assertVMException(error);
      }


    });
});
