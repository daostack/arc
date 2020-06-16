const helpers = require("./helpers");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');

const ARCVotingMachineCallbacksMock = artifacts.require("./ARCVotingMachineCallbacksMock.sol");

const proposalId = "0x1234000000000000000000000000000000000000000000000000000000000000";


 var registration;
const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   testSetup.proxyAdmin = accounts[5];

   testSetup.standardTokenMock = await ERC20Mock.new(accounts[0],100);



   var schemeMockData = await new web3.eth.Contract(registration.arcVotingMachineCallbacksMock.abi)
   .methods
   .initialize(helpers.NULL_ADDRESS , accounts[0])
   .encodeABI();

   var permissions = "0x00000000";

    [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                        accounts,
                                                                        registration,
                                                                        [accounts[0]],
                                                                        [1000],
                                                                        [1000],0,
                                                                        [web3.utils.fromAscii("ARCVotingMachineCallbacksMock")],
                                                                        schemeMockData,
                                                                        [helpers.getBytesLength(schemeMockData)],
                                                                        [permissions],
                                                                        "metaData");

      testSetup.arcVotingMachineCallbacksMock = await ARCVotingMachineCallbacksMock.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
      await testSetup.arcVotingMachineCallbacksMock.propose(proposalId);
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,100);

      return testSetup;

};
contract('VotingMachineCallbacks', function(accounts) {

   it("avatar address cannot be 0 ", async function() {
      try {
         await setup(accounts);
         assert(false, "avatar 0 address should revert");
       } catch(error) {
          // revert
       }
   });

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
