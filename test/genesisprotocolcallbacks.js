import * as helpers from './helpers';
const constants = require('./constants');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const GenesisProtocolCallbacks = artifacts.require("./GenesisProtocolCallbacks.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.standardTokenMock = await StandardTokenMock.new(testSetup.org.avatar.address,100);

   testSetup.genesisProtocolCallbacks = await GenesisProtocolCallbacks.new(testSetup.org.avatar.address,
                                                                           testSetup.standardTokenMock.address,
                                                                           accounts[1]);

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                          [testSetup.genesisProtocolCallbacks.address],
                                          [0],
                                          [permissions]);

   return testSetup;
};
contract('GenesisProtocolCallbacks', function(accounts) {

    it("constructor", async function() {
        var testSetup = await setup(accounts);
        assert.equal(await testSetup.genesisProtocolCallbacks.genesisProtocol(),accounts[1]);
        assert.equal(await testSetup.genesisProtocolCallbacks.stakingToken(),testSetup.standardTokenMock.address);
        assert.equal(await testSetup.genesisProtocolCallbacks.avatar(),testSetup.org.avatar.address);
     });

     it("setProposal allowed only for genesisProtocol  ", async function() {
        var testSetup = await setup(accounts);
        try {
            await testSetup.genesisProtocolCallbacks.setProposal(0x1234);
            assert(false, 'setProposal allowed only for genesisProtocol');
        } catch (ex) {
          helpers.assertVMException(ex);
        }
     });

    it("getTotalReputationSupply & reputationOf  ", async function() {
       var testSetup = await setup(accounts);
       await testSetup.genesisProtocolCallbacks.setProposal(0x1234,{from:accounts[1]});
       assert.equal(await testSetup.genesisProtocolCallbacks.getTotalReputationSupply(0x1234),1000);
       assert.equal(await testSetup.genesisProtocolCallbacks.reputationOf(accounts[0],0x1234),1000);
    });

    it("mintReputation allowed only for genesisProtocol", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.genesisProtocolCallbacks.mintReputation(1000,accounts[0],0);
           assert(false, 'mintReputation allowed only for genesisProtocol');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("mintReputation  ", async function() {
       var testSetup = await setup(accounts);
       await testSetup.genesisProtocolCallbacks.mintReputation(1000,accounts[2],0,{from:accounts[1]});
       assert.equal(await testSetup.org.reputation.totalSupply(),2000);
    });

    it("burnReputation allowed only for genesisProtocol", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.genesisProtocolCallbacks.burnReputation(500,accounts[0],0);
           assert(false, 'burnReputation allowed only for genesisProtocol');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("burnReputation  ", async function() {
       var testSetup = await setup(accounts);
       await testSetup.genesisProtocolCallbacks.burnReputation(500,accounts[0],0,{from:accounts[1]});
       assert.equal(await testSetup.org.reputation.totalSupply(),500);
    });

    it("stakingTokenTransfer allowed only for genesisProtocol", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.genesisProtocolCallbacks.stakingTokenTransfer(accounts[0],100,0);
           assert(false, 'burnReputation allowed only for genesisProtocol');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("stakingTokenTransfer  ", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),0);
       await testSetup.genesisProtocolCallbacks.stakingTokenTransfer(accounts[0],100,0,{from:accounts[1]});
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),100);
    });

    it("executeProposal allowed only for genesisProtocol", async function() {
       var testSetup = await setup(accounts);
       var executable = await ExecutableTest.new();
       try {
           await testSetup.genesisProtocolCallbacks.executeProposal(0x1234,1,executable.address);
           assert(false, 'burnReputation allowed only for genesisProtocol');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("executeProposal  ", async function() {
       var testSetup = await setup(accounts);
       var executable = await ExecutableTest.new();
       var tx = await testSetup.genesisProtocolCallbacks.executeProposal(0x1234,1,executable.address,{from:accounts[1]});
       var log = await new Promise((resolve) => {
              executable.LogBytes32({fromBlock: tx.blockNumber})
                  .get((err,events) => {
                          resolve(events);
                  });
              });
      assert.equal(log[0].args._msg,0x1234000000000000000000000000000000000000000000000000000000000000);
      log = await new Promise((resolve) => {
             executable.LogAddress({fromBlock: tx.blockNumber})
                 .get((err,events) => {
                         resolve(events);
                 });
             });
      assert.equal(log[0].args._msg,testSetup.org.avatar.address);

      log = await new Promise((resolve) => {
             executable.LogInt({fromBlock: tx.blockNumber})
                 .get((err,events) => {
                         resolve(events);
                 });
             });
      assert.equal(log[0].args._msg,1);
    });
});
