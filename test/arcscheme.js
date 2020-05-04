const helpers = require("./helpers");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');

const SchemeMock = artifacts.require('./test/SchemeMock.sol');


 var registration;
const setup = async function (accounts, initGov=true, avatarZero=false, vmZero=false, gpParamsHash=true) {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   testSetup.proxyAdmin = accounts[5];
   testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                       accounts,
                                                                       registration,
                                                                       [accounts[0]],
                                                                       [1000],
                                                                       [1000]);
   testSetup.standardTokenMock = await ERC20Mock.new(testSetup.org.avatar.address,100);

   var schemeMockData;
   if (!initGov) {
      schemeMockData = await new web3.eth.Contract(registration.schemeMock.abi)
      .methods
      .initialize(
         avatarZero ? helpers.NULL_ADDRESS : testSetup.org.avatar.address,
         1
      )
      .encodeABI();
   } else {
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      testSetup.votingMachine = await helpers.setupGenesisProtocol(accounts,standardTokenMock.address,helpers.NULL_ADDRESS);
      schemeMockData = await new web3.eth.Contract(registration.schemeMock.abi)
      .methods
      .initializeGovernance(
         avatarZero ? helpers.NULL_ADDRESS : testSetup.org.avatar.address,
         vmZero ? helpers.NULL_ADDRESS : testSetup.votingMachine.genesisProtocol.address,
         testSetup.votingMachine.uintArray,
         testSetup.votingMachine.voteOnBehalf,
         gpParamsHash ? testSetup.votingMachine.params : helpers.NULL_HASH,
         1
      )
      .encodeABI();
   }
    

   var permissions = "0x00000000";
   var tx = await registration.daoFactory.setSchemes(
      testSetup.org.avatar.address,
      [web3.utils.fromAscii("SchemeMock")],
      schemeMockData,
      [helpers.getBytesLength(schemeMockData)],
      [permissions],
      "metaData",
      {from:testSetup.proxyAdmin});

   if (!avatarZero && !vmZero) {
      testSetup.schemeMock = await SchemeMock.at(tx.logs[1].args._scheme);

      return testSetup;
   }
};
contract('VotingMachineCallbacks', function(accounts) {

   it("avatar address cannot be 0 ", async function() {
      try {
         await setup(accounts, false, true);
         assert(false, "avatar 0 address should revert");
       } catch(error) {
          // revert
      }
   });

   it("vm address cannot be 0 ", async function() {
      try {
         await setup(accounts, true, false, true);
         assert(false, "vm 0 address should revert");
       } catch(error) {
          // revert
       }
   });

   it("initialize ", async function() {
      var testSetup = await setup(accounts, false);

      assert.equal(await testSetup.schemeMock.avatar(), testSetup.org.avatar.address);
   });

   it("initializeGovernance ", async function() {
      var testSetup = await setup(accounts);
      assert.equal(await testSetup.schemeMock.avatar(), testSetup.org.avatar.address);
      assert.equal(await testSetup.schemeMock.votingMachine(), testSetup.votingMachine.genesisProtocol.address);
      assert.equal(await testSetup.schemeMock.voteParamsHash(), testSetup.votingMachine.params);
   });

   it("initializeGovernance gp set params", async function() {
      var testSetup = await setup(accounts, true, false, false, false);
      assert.equal(await testSetup.schemeMock.avatar(), testSetup.org.avatar.address);
      assert.equal(await testSetup.schemeMock.votingMachine(), testSetup.votingMachine.genesisProtocol.address);
      assert.equal(await testSetup.schemeMock.voteParamsHash(), testSetup.votingMachine.params);
   });
});
