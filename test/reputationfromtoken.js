const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
var ReputationFromToken = artifacts.require("./ReputationFromToken.sol");
var ExternalTokenLockerMock = artifacts.require("./ExternalTokenLockerMock.sol");

const setup = async function (accounts, _initialize = true) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.extetnalTokenLockerMock = await ExternalTokenLockerMock.new();
   await testSetup.extetnalTokenLockerMock.lock(100,accounts[0]);
   await testSetup.extetnalTokenLockerMock.lock(200,accounts[1]);
   await testSetup.extetnalTokenLockerMock.lock(300,accounts[2]);

   testSetup.reputationFromToken = await ReputationFromToken.new();
   if (_initialize === true) {
     await testSetup.reputationFromToken.initialize(testSetup.org.avatar.address,
                                                    testSetup.extetnalTokenLockerMock.address);
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.reputationFromToken.address],[helpers.NULL_HASH],[permissions],"metaData");
   return testSetup;
};

contract('ReputationFromToken', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.reputationFromToken.tokenContract(),testSetup.extetnalTokenLockerMock.address);
      assert.equal(await testSetup.reputationFromToken.avatar(),testSetup.org.avatar.address);
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

    it("redeem", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.reputationFromToken.redeem(accounts[1]);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Redeem");
      assert.equal(tx.logs[0].args._beneficiary,accounts[1]);
      assert.equal(tx.logs[0].args._amount,100);
      assert.equal(tx.logs[0].args._sender,accounts[0]);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),100);
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.reputationFromToken.initialize(testSetup.org.avatar.address,
                                                            testSetup.extetnalTokenLockerMock.address,
                                                            );
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });
});
