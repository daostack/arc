import * as helpers from './helpers';
const constants = require('./constants');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const ARCVotingMachineCallbacksMock = artifacts.require("./ARCVotingMachineCallbacksMock.sol");

const proposalId = "0x1234000000000000000000000000000000000000000000000000000000000000";
const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.standardTokenMock = await ERC20Mock.new(testSetup.org.avatar.address,100);

   testSetup.arcVotingMachineCallbacksMock = await ARCVotingMachineCallbacksMock.new();

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                          [testSetup.arcVotingMachineCallbacksMock.address],
                                          [helpers.NULL_HASH],
                                          [permissions]);
   await testSetup.arcVotingMachineCallbacksMock.propose(proposalId,
                                                           testSetup.org.avatar.address,
                                                           accounts[0]);


   return testSetup;
};
contract('VotingMachineCallbacks', function(accounts) {

    it("getTotalReputationSupply & reputationOf  ", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.arcVotingMachineCallbacksMock.getTotalReputationSupply(proposalId),1000);
       assert.equal(await testSetup.arcVotingMachineCallbacksMock.reputationOf(accounts[0],proposalId),1000);
    });

    it("mintReputation allowed only for genesisProtocol", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.arcVotingMachineCallbacksMock.mintReputation(1000,accounts[0],proposalId,{from:accounts[1]});
           assert(false, 'mintReputation allowed only for votingMachine');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("mintReputation  ", async function() {
       var testSetup = await setup(accounts);
       await testSetup.arcVotingMachineCallbacksMock.mintReputation(1000,accounts[2],proposalId,{from:accounts[0]});
       assert.equal(await testSetup.org.reputation.totalSupply(),2000);
    });

    it("burnReputation allowed only for votingMachine", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.arcVotingMachineCallbacksMock.burnReputation(500,accounts[0],proposalId,{from:accounts[1]});
           assert(false, 'burnReputation allowed only for votingMachine');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("burnReputation  ", async function() {
       var testSetup = await setup(accounts);
       await testSetup.arcVotingMachineCallbacksMock.burnReputation(500,accounts[0],proposalId,{from:accounts[0]});
       assert.equal(await testSetup.org.reputation.totalSupply(),500);
    });

    it("stakingTokenTransfer allowed only for votingMachine", async function() {
       var testSetup = await setup(accounts);
       try {
           await testSetup.arcVotingMachineCallbacksMock.stakingTokenTransfer(testSetup.standardTokenMock.address,
                                                                                accounts[0],
                                                                                100,
                                                                                proposalId,
                                                                                {from:accounts[1]});
           assert(false, 'stakingTokenTransfer allowed only for votingMachine');
       } catch (ex) {
         helpers.assertVMException(ex);
       }
    });

    it("stakingTokenTransfer  ", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),0);
       await testSetup.arcVotingMachineCallbacksMock.stakingTokenTransfer(testSetup.standardTokenMock.address,
                                                                             accounts[0],
                                                                             100,
                                                                             proposalId,
                                                                             {from:accounts[0]});
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),100);
    });

    it("balanceOfStakingToken", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.arcVotingMachineCallbacksMock.balanceOfStakingToken(testSetup.standardTokenMock.address,proposalId),100);
    });
});
