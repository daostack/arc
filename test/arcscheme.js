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
      console.log("testSetup.org.avatar.address",testSetup.org.avatar.address,schemeMockData,web3.eth.abi.encodeParameters(['address'],
                                     [testSetup.org.avatar.address]));
// 0xcd6dc687000000000000000000000000ec741c277992defb75f6f64f981e93d14b49ca760000000000000000000000000000000000000000000000000000000000000001
// 0x        000000000000000000000000ec741c277992defb75f6f64f981e93d14b49ca76

   } else {
       console.log(1)
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      testSetup.votingMachine = await helpers.setupGenesisProtocol(accounts,standardTokenMock.address,helpers.NULL_ADDRESS);
      console.log(2)

// 000000000000000000000000ec741c277992defb75f6f64f981e93d14b49ca76
// 0000000000000000000000000000000000000000000000000000000000000001


      var addresses = [registration.daoFactory,
                       helpers.NULL_ADDRESS,
                       testSetup.org.avatar.address,
                       helpers.NULL_ADDRESS,
                       helpers.NULL_ADDRESS,
                       helpers.NULL_ADDRESS
                       ];
      console.log(3,avatarZero,testSetup.votingMachine.uintArray)
      schemeMockData = await new web3.eth.Contract(registration.schemeMock.abi)
      .methods
      .initializeGovernance(
         avatarZero ? helpers.NULL_ADDRESS : testSetup.org.avatar.address,
         testSetup.votingMachine.uintArray,
         addresses,
         [0,1,0],
         "GenesisProtocol",
         1
      )
      .encodeABI();
   }


   var permissions = "0x00000000";
   console.log(3)
   var tx = await registration.daoFactory.setSchemes(
      testSetup.org.avatar.address,
      [web3.utils.fromAscii("SchemeMock")],
      schemeMockData,
      [helpers.getBytesLength(schemeMockData)],
      [permissions],
      "metaData",
      {from:testSetup.proxyAdmin});
      console.log(4)

   if (!avatarZero && !vmZero) {
      testSetup.schemeMock = await SchemeMock.at(tx.logs[1].args._scheme);

      return testSetup;
   }
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
