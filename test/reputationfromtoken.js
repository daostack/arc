const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const constants = require('./constants');
var ReputationFromToken = artifacts.require("./ReputationFromToken.sol");
var RepAllocation = artifacts.require("./RepAllocation.sol");

var PolkaCurve = artifacts.require("./PolkaCurve.sol");

var NectarRepAllocation = artifacts.require("./NectarRepAllocation.sol");
const NectarToken = artifacts.require('./Reputation.sol');
var ethereumjs = require('ethereumjs-abi');

const setupNectar = async function (accounts)  {
  var testSetup = new helpers.TestSetup();
  var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
  var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
  testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
  testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
  testSetup.nectarToken = await NectarToken.new();
  await testSetup.nectarToken.mint(accounts[0],100);
  await testSetup.nectarToken.mint(accounts[1],200);
  testSetup.blockReference =  await web3.eth.getBlockNumber();
  testSetup.nectarRepAllocation = await NectarRepAllocation.new();
  testSetup.reputationReward = 100000;
  await testSetup.nectarRepAllocation.initialize(
                                                  testSetup.reputationReward,
                                                  0,
                                                  0,
                                                  testSetup.blockReference,
                                                  testSetup.nectarToken.address);

  testSetup.reputationFromToken = await ReputationFromToken.new();
  testSetup.curve = helpers.NULL_ADDRESS;
  await testSetup.reputationFromToken.initialize(testSetup.org.avatar.address,
                                                   testSetup.nectarRepAllocation.address,
                                                   helpers.NULL_ADDRESS);


  var permissions = "0x00000000";
  await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.reputationFromToken.address],[helpers.NULL_HASH],[permissions],"metaData");
  return testSetup;
};

const setup = async function (accounts, _initialize = true) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.repAllocation = await RepAllocation.new();
   await testSetup.repAllocation.addBeneficiary(accounts[0],100);
   await testSetup.repAllocation.addBeneficiary(accounts[1],200);
   await testSetup.repAllocation.addBeneficiary(accounts[2],300);

   testSetup.reputationFromToken = await ReputationFromToken.new();
   testSetup.curve = await PolkaCurve.new();
   if (_initialize === true) {
     await testSetup.reputationFromToken.initialize(testSetup.org.avatar.address,
                                                    testSetup.repAllocation.address,
                                                    testSetup.curve.address);
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.reputationFromToken.address],[helpers.NULL_HASH],[permissions],"metaData");
   return testSetup;
};
const signatureType = 1;
const redeem = async function(_testSetup,_beneficiary,_redeemer,_fromAccount) {
  var textMsg = "0x"+ethereumjs.soliditySHA3(
    ["address","address"],
    [_testSetup.reputationFromToken.address, _beneficiary]
  ).toString("hex");
  //https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsign
  let signature = await web3.eth.sign(textMsg , _redeemer);
  const signature1 =  signature.substring(0, signature.length-2);
  var v = signature.substring(signature.length-2, signature.length);

  if (v === '00') {
   signature = signature1+'1b';
 } else {
   signature = signature1+'1c';
 }
  return (await _testSetup.reputationFromToken.redeemWithSignature(_beneficiary,signatureType,signature
    ,{from:_fromAccount}));
};
contract('ReputationFromToken and RepAllocation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.reputationFromToken.tokenContract(),testSetup.repAllocation.address);
      assert.equal(await testSetup.reputationFromToken.avatar(),testSetup.org.avatar.address);
      assert.equal(await testSetup.reputationFromToken.curve(),testSetup.curve.address);
    });

    it("repAllocation is onlyOwner", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.repAllocation.addBeneficiary(accounts[3],1030,{from:accounts[1]});
        assert(false, "repAllocation is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }

    });

    it("repAllocation cannot allocate after freeze", async () => {
      let testSetup = await setup(accounts);
      await testSetup.repAllocation.addBeneficiary(accounts[3],1030);
      await testSetup.repAllocation.freeze();


      try {
          await testSetup.repAllocation.addBeneficiary(accounts[4],1030);
        assert(false, "cannot allocate after freeze");
      } catch(error) {
        helpers.assertVMException(error);
      }

    });

    it("repAllocation cannot allocate twice", async () => {
      let testSetup = await setup(accounts);
      assert(await testSetup.repAllocation.balanceOf(accounts[1]),200);
      await testSetup.repAllocation.addBeneficiary(accounts[1],1030);
      assert(await testSetup.repAllocation.balanceOf(accounts[1]),200);
    });

    it("repAllocation addBeneficiaries", async () => {
      let testSetup = await setup(accounts);
      let tx = await testSetup.repAllocation.addBeneficiaries([accounts[3],accounts[4]],[300,400]);
      assert.equal(tx.logs.length,2);
    });



    it("redeem", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.reputationFromToken.redeem(accounts[1]);
      var total_reputation = await testSetup.curve.TOTAL_REPUTATION();
      var sum_of_sqrt = await testSetup.curve.SUM_OF_SQRTS();
      var expected = Math.floor(((10*total_reputation)/sum_of_sqrt) * 1000000000) * 1000000000;

      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Redeem");
      assert.equal(tx.logs[0].args._beneficiary,accounts[1]);
      assert.equal(tx.logs[0].args._amount.toString(),expected);
      assert.equal(tx.logs[0].args._sender,accounts[0]);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),expected);
    });

    it("redeemWithSignature", async () => {
      let testSetup = await setup(accounts);
      var tx = await redeem(testSetup,accounts[1],accounts[0],accounts[2]);
      var total_reputation = await testSetup.curve.TOTAL_REPUTATION();
      var sum_of_sqrt = await testSetup.curve.SUM_OF_SQRTS();
      var expected = Math.floor(((10*total_reputation)/sum_of_sqrt) * 1000000000) * 1000000000;

      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Redeem");
      assert.equal(tx.logs[0].args._beneficiary,accounts[1]);
      assert.equal(tx.logs[0].args._amount.toString(),expected);
      assert.equal(tx.logs[0].args._sender,accounts[0]);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),expected);
    });

    it("redeem with no beneficiary", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.reputationFromToken.redeem(helpers.NULL_ADDRESS);
      var total_reputation = await testSetup.curve.TOTAL_REPUTATION();
      var sum_of_sqrt = await testSetup.curve.SUM_OF_SQRTS();
      var expected = Math.floor(((10*total_reputation)/sum_of_sqrt) * 1000000000) * 1000000000;
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Redeem");
      assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
      assert.equal(tx.logs[0].args._amount,expected);
      assert.equal(tx.logs[0].args._sender,accounts[0]);
      assert.equal((await testSetup.org.reputation.balanceOf(accounts[0])).toString(),
                  (expected + 1000).toString());
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),0);
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.reputationFromToken.initialize(testSetup.org.avatar.address,
                                                            testSetup.repAllocation.address,
                                                            testSetup.curve.address
                                                            );
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("redeem nectar", async () => {
      let testSetup = await setupNectar(accounts);
      var tx = await testSetup.reputationFromToken.redeem(accounts[1],{from:accounts[1]});
      var expected = Math.floor((200*testSetup.reputationReward)/300);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Redeem");
      assert.equal(tx.logs[0].args._beneficiary,accounts[1]);
      assert.equal(tx.logs[0].args._amount.toString(),expected);
      assert.equal(tx.logs[0].args._sender,accounts[1]);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),expected);
    });
});
