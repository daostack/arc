const helpers = require("./helpers");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const SchemeMock = artifacts.require('./test/SchemeMock.sol');



var registration;
const setup = async function (accounts, initGov=true) {
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
         testSetup.votingMachine.uintArray,
         testSetup.votingMachine.voteOnBehalf,
         registration.daoFactory.address,
         standardTokenMock.address,
         [0,1,0],
         "GenesisProtocol",
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
                                                                       [Number(helpers.getBytesLength(schemeMockData))],
                                                                       [permissions],
                                                                       "metaData");
   testSetup.standardTokenMock = await ERC20Mock.new(testSetup.org.avatar.address,100);

   if (!initGov) {
      testSetup.schemeMock = await SchemeMock.at(tx.logs[6].args._scheme);
   } else {
      testSetup.schemeMock = await SchemeMock.at(tx.logs[7].args._scheme);
      testSetup.votingMachine = tx.logs[5].args._proxy;

   }
   return testSetup;

};
contract('ArcScheme', function(accounts) {

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
      assert.equal(await testSetup.schemeMock.votingMachine(), testSetup.votingMachine);
   });

});
