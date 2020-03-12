import * as helpers from './helpers';
const SchemeFactory = artifacts.require("./SchemeFactory.sol");
const Controller = artifacts.require('./Controller.sol');

export class SchemeFactoryParams {
  constructor() {
  }
}

var registration;
const setupSchemeFactoryParams = async function(
                                            avatarAddress
                                            ) {
  var schemeFactoryParams = new SchemeFactoryParams();
  schemeFactoryParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  schemeFactoryParams.initdata = await new web3.eth.Contract(registration.schemeFactory.abi)
                        .methods
                        .initialize(avatarAddress,
                          schemeFactoryParams.votingMachine.absoluteVote.address,
                          schemeFactoryParams.votingMachine.params,
                          registration.daoFactory.address)
                        .encodeABI();
  return schemeFactoryParams;
};

const setup = async function (accounts) {
  var testSetup = new helpers.TestSetup();
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [2000,4000,7000];
  testSetup.proxyAdmin = accounts[5];
  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      accounts[2]],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray);
  testSetup.schemeFactoryParams= await setupSchemeFactoryParams(
                     testSetup.org.avatar.address);

  var permissions = "0x0000001f";
  
  var tx = await registration.daoFactory.setSchemes(
                          testSetup.org.avatar.address,
                          [web3.utils.fromAscii("SchemeFactory")],
                          testSetup.schemeFactoryParams.initdata,
                          [helpers.getBytesLength(testSetup.schemeFactoryParams.initdata)],
                          [permissions],
                          "metaData",{from:testSetup.proxyAdmin});

  testSetup.schemeFactory = await SchemeFactory.at(tx.logs[1].args._scheme);
  return testSetup;
};
contract('SchemeFactory', accounts => {

   it("initialize", async() => {
     var testSetup = await setup(accounts);
     assert.equal(await testSetup.schemeFactory.votingMachine(),
     testSetup.schemeFactoryParams.votingMachine.absoluteVote.address);
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

    it("execute proposeScheme and execute -yes - permissions== 0x0000001f", async function() {
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
      tx = await testSetup.schemeFactoryParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      var schemeAddress = proxyEvents[0].returnValues._proxy;
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(schemeAddress),true);
      assert.equal(await controller.schemesPermissions(schemeAddress),"0x0000001f");
     });

     it("execute proposeScheme and execute -yes - replace scheme", async function() {
      var testSetup = await setup(accounts);
      var tx = await testSetup.schemeFactory.proposeScheme(
        [0,1,0],
        'SchemeFactory',
        testSetup.schemeFactoryParams.initdata,
        "0x0000001f",
        testSetup.schemeFactory.address,
        helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),true);
      tx = await testSetup.schemeFactoryParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
      var schemeAddress = proxyEvents[0].returnValues._proxy;
      assert.equal(await controller.isSchemeRegistered(schemeAddress),true);
      assert.equal(await controller.schemesPermissions(schemeAddress),"0x0000001f");
      assert.equal(await controller.isSchemeRegistered(testSetup.schemeFactory.address),false);
     });

       it("execute proposeScheme - no decision (same for remove scheme) - proposal data delete", async function() {
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
         tx = await testSetup.schemeFactoryParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         //should not register because the decision is "no"
         let proxyEvents = await registration.daoFactory.getPastEvents("ProxyCreated", {fromBlock: tx.receipt.blockNumber, toBlock: tx.receipt.blockNumber});
         assert.equal(proxyEvents.length,0);//proposalType
        });
});
