const helpers = require("./helpers");
const SchemeFactory = artifacts.require("./SchemeFactory.sol");
const Controller = artifacts.require('./Controller.sol');

class SchemeFactoryParams {
  constructor() {
  }
}

var registration;
const setupSchemeFactoryParams = async function(
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            _packageVersion=[0,1,0]
                                            ) {
  var schemeFactoryParams = new SchemeFactoryParams();
  if (genesisProtocol === true) {
    schemeFactoryParams.votingMachine = await helpers.setupGenesisProtocol(accounts,helpers.NULL_ADDRESS,helpers.NULL_ADDRESS);
    schemeFactoryParams.initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            schemeFactoryParams.votingMachine.uintArray,
                            schemeFactoryParams.votingMachine.voteOnBehalf,
                            registration.daoFactory.address,
                            token,
                            _packageVersion,
                            "GenesisProtocol")
                          .encodeABI();
    } else {
      schemeFactoryParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      schemeFactoryParams.initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                            .methods
                            .initialize(helpers.NULL_ADDRESS,
                              schemeFactoryParams.votingMachine.uintArray,
                              schemeFactoryParams.votingMachine.voteOnBehalf,
                              registration.daoFactory.address,
                              token,
                              _packageVersion,
                              "AbsoluteVote")
                            .encodeABI();
  }

  return schemeFactoryParams;
};

const setup = async function (accounts,genesisProtocol = false,tokenAddress=helpers.NULL_ADDRESS) {
  var testSetup = new helpers.TestSetup();
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [2000,4000,7000];
  testSetup.proxyAdmin = accounts[5];

  testSetup.schemeFactoryParams= await setupSchemeFactoryParams(
                                        accounts,
                                        genesisProtocol,
                                        tokenAddress);

  var permissions = "0x0000001f";


  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      accounts[2]],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("SchemeFactory")],
                                                                      testSetup.schemeFactoryParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.schemeFactoryParams.initdata)],
                                                                      [permissions],
                                                                      "metaData"
                                                                     );

   testSetup.schemeFactory = await SchemeFactory.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
   testSetup.schemeFactoryParams.votingMachineInstance =
   await helpers.getVotingMachine(await testSetup.schemeFactory.votingMachine(),genesisProtocol);
  return testSetup;
};
contract('SchemeFactory', accounts => {

   it("initialize", async() => {
     var testSetup = await setup(accounts);
     assert.equal(await testSetup.schemeFactory.votingMachine(),
     testSetup.schemeFactoryParams.votingMachineInstance.address);
     assert.equal(await testSetup.schemeFactory.avatar(),testSetup.org.avatar.address);
     assert.equal(await testSetup.schemeFactory.daoFactory(),registration.daoFactory.address);
     });

    it("proposeScheme log", async function() {
      var testSetup = await setup(accounts);

      var tx = await testSetup.schemeFactory.proposeScheme(
                                                             [0,1,0],
                                                             'SchemeFactory',
                                                             testSetup.schemeFactoryParams.initdata,
                                                             "0x0000001f",
                                                             helpers.NULL_ADDRESS,
                                                             helpers.NULL_HASH);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewSchemeProposal");
     });

     it("proposeScheme no scheme to un/register", async function() {
      var testSetup = await setup(accounts);

      try {
        await testSetup.schemeFactory.proposeScheme(
          [0,1,0],
          '',
          testSetup.schemeFactoryParams.initdata,
          "0x0000001f",
          helpers.NULL_ADDRESS,
          helpers.NULL_HASH);
      } catch(error) {
        helpers.assertVMException(error);
      }
     });

    it("execute proposeScheme and execute -yes - permissions== 0x0000001f", async function() {
      var testSetup = await setup(accounts);
      var initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                            .methods
                            .initialize(testSetup.org.avatar.address,
                              testSetup.schemeFactoryParams.votingMachine.uintArray,
                              testSetup.schemeFactoryParams.votingMachine.voteOnBehalf,
                              registration.daoFactory.address,
                              helpers.NULL_ADDRESS,
                              [0,1,0],
                              "AbsoluteVote")
                            .encodeABI();
      var tx = await testSetup.schemeFactory.proposeScheme(
        [0,1,0],
        'SchemeFactory',
        initdata,
        "0x0000001f",
        helpers.NULL_ADDRESS,
        helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.schemeFactoryParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      var schemeAddress = proxyEvents[1].returnValues._proxy;
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(schemeAddress),true);
      assert.equal(await controller.schemesPermissions(schemeAddress),"0x0000001f");
     });

     it("execute proposeScheme and execute -yes - replace scheme", async function() {
      var testSetup = await setup(accounts);
      var initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                            .methods
                            .initialize(testSetup.org.avatar.address,
                              testSetup.schemeFactoryParams.votingMachine.uintArray,
                              testSetup.schemeFactoryParams.votingMachine.voteOnBehalf,
                              registration.daoFactory.address,
                              helpers.NULL_ADDRESS,
                              [0,1,0],
                              "AbsoluteVote")
                            .encodeABI();
      var tx = await testSetup.schemeFactory.proposeScheme(
        [0,1,0],
        'SchemeFactory',
        initdata,
        "0x0000001f",
        testSetup.schemeFactory.address,
        helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),true);
      tx = await testSetup.schemeFactoryParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      var schemeAddress = proxyEvents[1].returnValues._proxy;
      assert.equal(await controller.isSchemeRegistered(schemeAddress),true);
      assert.equal(await controller.schemesPermissions(schemeAddress),"0x0000001f");
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),false);
     });

     it("execute proposeScheme and execute -yes - replace scheme + genesisProtocol", async function() {
      var testSetup = await setup(accounts,true);
      var initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                            .methods
                            .initialize(testSetup.org.avatar.address,
                              testSetup.schemeFactoryParams.votingMachine.uintArray,
                              testSetup.schemeFactoryParams.votingMachine.voteOnBehalf,
                              registration.daoFactory.address,
                              helpers.NULL_ADDRESS,
                              [0,1,0],
                              "GenesisProtocol")
                            .encodeABI();
      var tx = await testSetup.schemeFactory.proposeScheme(
        [0,1,0],
        'SchemeFactory',
        initdata,
        "0x0000001f",
        testSetup.schemeFactory.address,
        helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),true);
      tx = await testSetup.schemeFactoryParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      var schemeAddress = proxyEvents[1].returnValues._proxy;
      assert.equal(await controller.isSchemeRegistered(schemeAddress),true);
      assert.equal(await controller.schemesPermissions(schemeAddress),"0x0000001f");
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),false);
     });

     it("execute proposeScheme and execute -yes - unregister scheme", async function() {
      var testSetup = await setup(accounts);
      var tx = await testSetup.schemeFactory.proposeScheme(
        [0,0,0],
        '',
        '0x',
        "0x00000000",
        testSetup.schemeFactory.address,
        helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),true);
      tx = await testSetup.schemeFactoryParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      assert.equal(proxyEvents.length,0);
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),false);
     });

    it("execute proposeScheme - no decision - proposal data delete", async function() {
    var testSetup = await setup(accounts);
    var tx = await testSetup.schemeFactory.proposeScheme(
      [0,1,0],
      'SchemeFactory',
      testSetup.schemeFactoryParams.initdata,
      "0x0000001f",
      helpers.NULL_ADDRESS,
      helpers.NULL_HASH);

    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

      //Vote with reputation to trigger execution
      tx = await testSetup.schemeFactoryParams.votingMachineInstance.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      //should not register because the decision is "no"
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      assert.equal(proxyEvents.length,0);
    });
});
