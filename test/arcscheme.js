const helpers = require("./helpers");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');

const SchemeMock = artifacts.require('./test/SchemeMock.sol');


 var registration;
const setup = async function (accounts, initGov=true, vmZero=false, gpParamsHash=true) {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   testSetup.proxyAdmin = accounts[5];
   var schemeMockData;
   if (!initGov) {
      schemeMockData = await new web3.eth.Contract(registration.schemeMock.abi)
      .methods
      .initialize(
         helpers.NULL_ADDRESS,
         1
      )
      .encodeABI();
   } else {
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      testSetup.votingMachine = await helpers.setupGenesisProtocol(accounts,standardTokenMock.address,helpers.NULL_ADDRESS);
      schemeMockData = await new web3.eth.Contract(registration.schemeMock.abi)
      .methods
      .initializeGovernance(
         helpers.NULL_ADDRESS,
         vmZero ? helpers.NULL_ADDRESS : testSetup.votingMachine.genesisProtocol.address,
         testSetup.votingMachine.uintArray,
         testSetup.votingMachine.voteOnBehalf,
         gpParamsHash ? testSetup.votingMachine.params : helpers.NULL_HASH,
         1
      )
      .encodeABI();
   }

   var permissions = "0x00000000";
   [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                        accounts,
                                                                        registration,
                                                                        [accounts[0]],
                                                                        [1000],
                                                                        [1000],
                                                                        0,
                                                                        [web3.utils.fromAscii("SchemeMock")],
                                                                        schemeMockData,
                                                                        [helpers.getBytesLength(schemeMockData)],
                                                                        [permissions],
                                                                        "metaData");
                                                                        testSetup.standardTokenMock = await ERC20Mock.new(testSetup.org.avatar.address,100);

   testSetup.schemeMock = await SchemeMock.at(tx.logs[6].args._scheme);
   return testSetup;
};
contract('arcscheme', function(accounts) {

   it("avatar address cannot be 0 ", async function() {
      var schemeMock = await SchemeMock.new();

      try {
         await schemeMock.initialize(helpers.NULL_ADDRESS,1);
         assert(false, "avatar 0 address should revert");
       } catch(error) {
          // revert
      }
      await schemeMock.initialize(accounts[0],1);

      var params = await helpers.setupGenesisProtocol(accounts,helpers.NULL_ADDRESS,helpers.NULL_ADDRESS);

      schemeMock = await SchemeMock.new();
      try {
         await schemeMock.initializeGovernance(accounts[0],
            helpers.NULL_ADDRESS,                                   
            params.uintArray,
            params.voteOnBehalf,
            helpers.NULL_HASH,
            1
         );
         assert(false, "votingMachine cannot be zero");
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

   it("initializeGovernance parameters already set", async function() {
      var testSetup = await setup(accounts);
      testSetup = await setup(accounts);
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
