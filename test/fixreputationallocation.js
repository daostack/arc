const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
var FixedReputationAllocation = artifacts.require("./FixedReputationAllocation.sol");

const setup = async function (accounts,_repAllocation = 300,_initialize = true,_redeemEnableTime = 3000) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],0,0);

   testSetup.fixedReputationAllocation = await FixedReputationAllocation.new();
   if (_initialize ===  true) {
    var block = await web3.eth.getBlock("latest");
    testSetup.redeemEnableTime = block.timestamp + _redeemEnableTime;
    await testSetup.fixedReputationAllocation.initialize(testSetup.org.avatar.address,
                                                         _repAllocation,
                                                         testSetup.redeemEnableTime);
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.fixedReputationAllocation.address],[helpers.NULL_HASH],[permissions]);
   return testSetup;
};

contract('FixedReputationAllocation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.fixedReputationAllocation.reputationReward(),300);
      assert.equal(await testSetup.fixedReputationAllocation.isEnable(),false);
      assert.equal(await testSetup.fixedReputationAllocation.redeemEnableTime(),testSetup.redeemEnableTime);
    });

    it("add beneficiary", async () => {
       let testSetup = await setup(accounts);
       let tx = await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0]);
       assert.equal(tx.logs.length,1);
       assert.equal(tx.logs[0].event,"BeneficiaryAddressAdded");
       assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
    });

    it("add beneficiary check only owner", async () => {
       let testSetup = await setup(accounts);
       try {
         await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0],{from: accounts[1]});
         assert(false, "addBeneficiary is only owner");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("add beneficiaries", async () => {
      let testSetup = await setup(accounts);
      let tx = await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      assert.equal(tx.logs.length,accounts.length);
    });

    it("redeem", async () => {
      let testSetup = await setup(accounts);
      let tx = await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      assert.equal(await testSetup.fixedReputationAllocation.numberOfBeneficiaries(),accounts.length);
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),0);
      await testSetup.fixedReputationAllocation.enable();
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),300/accounts.length);
      var beneficiaryReward;
      var reputation;
      await helpers.increaseTime(3001);
      for (var i = 0 ;i< accounts.length ;i++) {
          tx = await testSetup.fixedReputationAllocation.redeem(accounts[i]);
          assert.equal(tx.logs.length,1);
          assert.equal(tx.logs[0].event,"Redeem");
          beneficiaryReward = await testSetup.fixedReputationAllocation.beneficiaryReward();
          assert.equal(tx.logs[0].args._amount,beneficiaryReward.toNumber());
          reputation = await testSetup.org.reputation.balanceOf(accounts[i]);
          assert.equal(reputation.toNumber(),tx.logs[0].args._amount);
      }

    });

    it("cannot redeem twice", async () => {
      let testSetup = await setup(accounts);
      let tx = await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      assert.equal(await testSetup.fixedReputationAllocation.numberOfBeneficiaries(),accounts.length);
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),0);
      await testSetup.fixedReputationAllocation.enable();
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),300/accounts.length);
      var beneficiaryReward;
      var reputation;
      await helpers.increaseTime(3001);
      for (var i = 0 ;i< accounts.length ;i++) {
          tx = await testSetup.fixedReputationAllocation.redeem(accounts[i]);
          assert.equal(tx.logs.length,1);
          assert.equal(tx.logs[0].event,"Redeem");
          beneficiaryReward = await testSetup.fixedReputationAllocation.beneficiaryReward();
          assert.equal(tx.logs[0].args._amount,beneficiaryReward.toNumber());
          reputation = await testSetup.org.reputation.balanceOf(accounts[i]);
          assert.equal(reputation.toNumber(),tx.logs[0].args._amount);
      }

      try {
        await testSetup.fixedReputationAllocation.redeem(accounts[0]);
        assert(false, "cannot redeem  twice");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot redeem if not initialize", async () => {
      let testSetup = await setup(accounts,300,false);
      await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      assert.equal(await testSetup.fixedReputationAllocation.numberOfBeneficiaries(),accounts.length);
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),0);
      await testSetup.fixedReputationAllocation.enable();
      try {
        await testSetup.fixedReputationAllocation.redeem(accounts[0]);
        assert(false, "cannot redeem if not initialize");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot redeem before redeemEnableTime", async () => {
      let testSetup = await setup(accounts);
      await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      assert.equal(await testSetup.fixedReputationAllocation.numberOfBeneficiaries(),accounts.length);
      assert.equal(await testSetup.fixedReputationAllocation.beneficiaryReward(),0);
      await testSetup.fixedReputationAllocation.enable();
      try {
        await testSetup.fixedReputationAllocation.redeem(accounts[0]);
        assert(false, "cannot redeem if not initialize");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await helpers.increaseTime(3001);
      await testSetup.fixedReputationAllocation.redeem(accounts[0]);


    });

    it("redeem without enable should revert", async () => {
      let testSetup = await setup(accounts);
      await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
      try {
        await testSetup.fixedReputationAllocation.redeem(accounts[0]);
        assert(false, "redeem without enable should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("redeem from none white listed beneficiary should revert", async () => {
      let testSetup = await setup(accounts);
      await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0]);
      await testSetup.fixedReputationAllocation.enable();
      try {
        await testSetup.fixedReputationAllocation.redeem(accounts[1]);
        assert(false, "redeem from none white listed beneficiary should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("enable is onlyOwner", async () => {
      let testSetup = await setup(accounts);
      await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0]);
      try {
        await testSetup.fixedReputationAllocation.enable({from:accounts[1]});
        assert(false, "enable is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.fixedReputationAllocation.initialize(testSetup.org.avatar.address,
                                                                     100,
                                                                    100);
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("initialize is onlyOwner", async () => {
      var fixedReputationAllocation = await FixedReputationAllocation.new();
      try {
        await fixedReputationAllocation.initialize(accounts[0],
                                                       100,
                                                       100,
                                                       {from:accounts[1]});
        assert(false, "initialize is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await fixedReputationAllocation.initialize(accounts[0],
                                                     100,
                                                     100,
                                                     {from:accounts[0]});
    });
});
