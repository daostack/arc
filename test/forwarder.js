const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
var Forwarder = artifacts.require("./Forwarder.sol");
var ControllerInterface = artifacts.require("./ControllerInterface.sol");

const setup = async function (accounts,
                             _expirationTime = 300)
  {
   var testSetup = new helpers.TestSetup();
   testSetup.biddingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.forwarder = await Forwarder.new();

   testSetup.expirationTime = (await web3.eth.getBlock("latest")).timestamp + _expirationTime;

   await testSetup.forwarder.initialize(testSetup.org.avatar.address,
                                        testSetup.expirationTime);

   var permissions = "0x0000001f";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [accounts[0],testSetup.forwarder.address],
                                        [web3.utils.asciiToHex("0"),web3.utils.asciiToHex("0")],
                                        [permissions,permissions]);
   return testSetup;
};

contract('Forwarder', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);

      assert.equal(await testSetup.forwarder.avatar(),testSetup.org.avatar.address);
      assert.equal(await testSetup.forwarder.expirationTime(),testSetup.expirationTime);
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.forwarder.initialize(testSetup.org.avatar.address,
                                                  testSetup.expirationTime);
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("forwardCall (fallback)", async () => {
      let testSetupA = await setup(accounts);
      let testSetupB = await setup(accounts);
       // transferOwnership of testSetupA.forwarder to testSetupB avatar
      await testSetupA.forwarder.transferOwnership(testSetupB.org.avatar.address);
      //do generic call from testSetupB controller to testSetupA controller to "registerScheme"
      let controllerB = await ControllerInterface.at(await testSetupB.org.avatar.owner());
      let controllerA = await ControllerInterface.at(await testSetupA.org.avatar.owner());
      const encodeABI = await new web3.eth.Contract(controllerA.abi).
                                  methods.
                                  registerScheme(accounts[1],helpers.NULL_HASH,"0x0000001f",testSetupA.org.avatar.address).
                                  encodeABI();
      assert.equal(await controllerA.isSchemeRegistered(accounts[1],testSetupA.org.avatar.address),false);
      await controllerB.genericCall(testSetupA.forwarder.address,encodeABI,testSetupB.org.avatar.address);
      //check that accounts[1] register as scheme at controllerA.
      assert.equal(await controllerA.isSchemeRegistered(accounts[1],testSetupA.org.avatar.address),true);

    });

    it("forwardCall (fallback) -check expirationTime", async () => {
      let testSetupA = await setup(accounts);
      let testSetupB = await setup(accounts);
       // transferOwnership of testSetupA.forwarder to testSetupB avatar
      await testSetupA.forwarder.transferOwnership(testSetupB.org.avatar.address);
      //do generic call from testSetupB controller to testSetupA controller to "registerScheme"
      let controllerB = await ControllerInterface.at(await testSetupB.org.avatar.owner());
      let controllerA = await ControllerInterface.at(await testSetupA.org.avatar.owner());
      const encodeABI = await new web3.eth.Contract(controllerA.abi).
                                  methods.
                                  registerScheme(accounts[1],helpers.NULL_HASH,"0x0000001f",testSetupA.org.avatar.address).
                                  encodeABI();
       //expiered
      await helpers.increaseTime(301);

      let tx = await controllerB.genericCall(testSetupA.forwarder.address,encodeABI,testSetupB.org.avatar.address);
      await testSetupB.org.avatar.getPastEvents('GenericCall', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"GenericCall");
            assert.equal(events[0].args._success,false);
        });

    });


    it("forwardCall (fallback) is onlyOwner ", async () => {
      let testSetupA = await setup(accounts);
      let testSetupB = await setup(accounts);
      //do generic call from testSetupB controller to testSetupA controller to "registerScheme"
      let controllerB = await ControllerInterface.at(await testSetupB.org.avatar.owner());
      let controllerA = await ControllerInterface.at(await testSetupA.org.avatar.owner());
      const encodeABI = await new web3.eth.Contract(controllerA.abi).
                                  methods.
                                  registerScheme(accounts[1],helpers.NULL_HASH,"0x0000001f",testSetupA.org.avatar.address).
                                  encodeABI();
      let tx = await controllerB.genericCall(testSetupA.forwarder.address,encodeABI,testSetupB.org.avatar.address);
      await testSetupB.org.avatar.getPastEvents('GenericCall', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"GenericCall");
            assert.equal(events[0].args._success,false);
        });

    });

    it("unregisterSelf", async () => {
      let testSetupA = await setup(accounts);
      let testSetupB = await setup(accounts);
      let controllerA = await ControllerInterface.at(await testSetupA.org.avatar.owner());
       // transferOwnership of testSetupA.forwarder to testSetupB avatar
      await testSetupA.forwarder.transferOwnership(testSetupB.org.avatar.address);
      assert.equal(await controllerA.isSchemeRegistered(testSetupA.forwarder.address,testSetupA.org.avatar.address),true);
      try {
        await testSetupA.forwarder.unregisterSelf();
        assert(false, "expirationTime did not passed");
      } catch(error) {
        helpers.assertVMException(error);
      }
      assert.equal(await controllerA.isSchemeRegistered(testSetupA.forwarder.address,testSetupA.org.avatar.address),true);
      await helpers.increaseTime(301);
      await testSetupA.forwarder.unregisterSelf();
      assert.equal(await controllerA.isSchemeRegistered(testSetupA.forwarder.address,testSetupA.org.avatar.address),false);

    });
});
