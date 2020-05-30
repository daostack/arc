const helpers = require("./helpers");
const Controller = artifacts.require("./Controller.sol");
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const ControllerUpgradeScheme = artifacts.require('./ControllerUpgradeScheme.sol');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

class ControllerUpgradeSchemeParams {
  constructor() {
  }
}
var registration;
const setupControllerUpgradeSchemeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token,
                                              _daoFactoryAddress,
                                              _packageVersion = [0,1,0]
                                            ) {
    var controllerUpgradeSchemeParams = new ControllerUpgradeSchemeParams();
    if (genesisProtocol === true) {
      controllerUpgradeSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,helpers.NULL_ADDRESS,helpers.NULL_ADDRESS);
      controllerUpgradeSchemeParams.initdata = await new web3.eth.Contract(registration.controllerUpgradeScheme.abi)
                            .methods
                            .initialize(helpers.NULL_ADDRESS,
                              controllerUpgradeSchemeParams.votingMachine.uintArray,
                              controllerUpgradeSchemeParams.votingMachine.voteOnBehalf,
                              _daoFactoryAddress,
                              token,
                              _packageVersion,
                              "GenesisProtocol")
                            .encodeABI();
      } else {
    controllerUpgradeSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
    controllerUpgradeSchemeParams.initdata = await new web3.eth.Contract(registration.controllerUpgradeScheme.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            controllerUpgradeSchemeParams.votingMachine.uintArray,
                            controllerUpgradeSchemeParams.votingMachine.voteOnBehalf,
                            _daoFactoryAddress,
                            helpers.NULL_ADDRESS,
                            _packageVersion,
                            "AbsoluteVote")
                          .encodeABI();
    }
    return controllerUpgradeSchemeParams;
};


const setupNewController = async function (accounts,permission='0x00000000') {
  var token  = await DAOToken.new();
  await token.initialize("TEST","TST",0,accounts[0]);
  // set up a reputation system
  var reputation = await Reputation.new();
  await reputation.initialize(accounts[0]);
  var avatar = await Avatar.new('name', token.address, reputation.address);
  await avatar.initialize('name', token.address, reputation.address,accounts[0]);
  var _controller;
  if (permission !== '0'){
    _controller = await Controller.new({from:accounts[1]});
    await _controller.initialize(avatar.address,accounts[1],{from:accounts[1]});
    await _controller.registerScheme(accounts[0],permission,{from:accounts[1]});
    await _controller.unregisterSelf({from:accounts[1]});
  }
  else {
    _controller = await Controller.new();
    await _controller.initialize(avatar.address,accounts[0]);
  }
  return _controller;
};


const setup = async function (accounts,genesisProtocol=false,tokenAddress= helpers.NULL_ADDRESS) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray =  [20,40,70];
  testSetup.proxyAdmin = accounts[5];
  testSetup.controllerUpgradeSchemeParams= await setupControllerUpgradeSchemeParams(
    accounts,
    genesisProtocol,
    tokenAddress,
    registration.daoFactory.address);
  var permissions = "0x0000000a";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      accounts[2]],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("ControllerUpgradeScheme")],
                                                                      testSetup.controllerUpgradeSchemeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.controllerUpgradeSchemeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData");

testSetup.controllerUpgradeScheme = await ControllerUpgradeScheme.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
testSetup.controllerUpgradeSchemeParams.votingMachineInstance =
await helpers.getVotingMachine(await testSetup.controllerUpgradeScheme.votingMachine(),genesisProtocol);  return testSetup;
};
contract('ControllerUpgradeScheme', accounts => {
  before(function() {
    helpers.etherForEveryone(accounts);
  });


     it("proposeUpgrade log", async() => {
       var testSetup = await setup(accounts);

       var newController = await setupNewController(accounts);
       var tx = await testSetup.controllerUpgradeScheme.proposeUpgrade(newController.address,helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewControllerUpgradeProposal");
       var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
       assert.equal(votingMachine,testSetup.controllerUpgradeSchemeParams.votingMachineInstance.address);
      });

        it("proposeChangeControllerUpgradingScheme log", async function() {
          var testSetup = await setup(accounts);

          var tx = await testSetup.controllerUpgradeScheme.proposeChangeControllerUpgradingScheme(accounts[0],helpers.NULL_HASH);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ChangeControllerUpgradeSchemeProposal");
          var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
          assert.equal(votingMachine,testSetup.controllerUpgradeSchemeParams.votingMachineInstance.address);
         });

 it("execute proposal upgrade controller -yes - proposal data delete", async function() {
   var testSetup = await setup(accounts);

   var newController = await setupNewController(accounts);
   assert.notEqual(newController.address,await testSetup.org.avatar.owner());
   var tx = await testSetup.controllerUpgradeScheme.proposeUpgrade(newController.address,helpers.NULL_HASH);
   //Vote with reputation to trigger execution
   var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //check organizationsProposals before execution
   var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
   assert.equal(organizationProposal[0],newController.address);//new contract address
   assert.equal(organizationProposal[1].toNumber(),1);//proposalType
   await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   assert.equal(newController.address,await testSetup.org.avatar.owner());
   //check organizationsProposals after execution
   organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
   assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
   assert.equal(organizationProposal[1],0);//proposalType
  });

  it("execute proposal upgrade controller -yes - proposal data delete + genesisProtocol", async function() {
    var testSetup = await setup(accounts,true);

    var newController = await setupNewController(accounts);
    assert.notEqual(newController.address,await testSetup.org.avatar.owner());
    var tx = await testSetup.controllerUpgradeScheme.proposeUpgrade(newController.address,helpers.NULL_HASH);
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
    //check organizationsProposals before execution
    var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
    assert.equal(organizationProposal[0],newController.address);//new contract address
    assert.equal(organizationProposal[1].toNumber(),1);//proposalType
    await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    assert.equal(newController.address,await testSetup.org.avatar.owner());
    //check organizationsProposals after execution
    organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
    assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
    assert.equal(organizationProposal[1],0);//proposalType
   });

  it("execute proposal upgrade controller - no decision (same for update scheme) - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.controllerUpgradeScheme.proposeUpgrade(newController.address,helpers.NULL_HASH);
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
    //check organizationsProposals before execution
    var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
    assert.equal(organizationProposal[0],newController.address);//new contract address
    assert.equal(organizationProposal[1].toNumber(),1);//proposalType

    //Vote with reputation to trigger execution
    await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    //should not upgrade because the decision is "no"
    assert.notEqual(newController.address,await testSetup.org.avatar.owner());
    //check organizationsProposals after execution
    organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
    assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
    assert.equal(organizationProposal[1],0);//proposalType
   });

   it("execute proposal ChangeUpgradingScheme - yes decision - proposal data delete", async function() {
     var testSetup = await setup(accounts);


     var tx = await testSetup.controllerUpgradeScheme.proposeChangeControllerUpgradingScheme(accounts[0],helpers.NULL_HASH);
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

     //check organizationsProposals before execution
     var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
     assert.equal(organizationProposal[0],accounts[0]);//new contract address
     assert.equal(organizationProposal[1].toNumber(),2);//proposalType

     //check schemes registration before execution
     var controller = await Controller.at(await testSetup.org.avatar.owner());
     assert.equal(await controller.isSchemeRegistered(accounts[0]),false);
     assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),true);

     await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

     //check organizationsProposals after execution
     organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
     assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
     assert.equal(organizationProposal[1],0);//proposalType

     //check if scheme upgraded
     assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
     assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),false);
    });

    it("execute proposal ChangeUpgradingScheme - yes decision - check approve increase fee ", async function() {
      var testSetup = await setup(accounts);


      var tx = await testSetup.controllerUpgradeScheme.proposeChangeControllerUpgradingScheme(accounts[0],helpers.NULL_HASH);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

      //check organizationsProposals before execution
      var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal[0],accounts[0]);//new contract address
      assert.equal(organizationProposal[1].toNumber(),2);//proposalType

      //check schemes registration before execution
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(accounts[0]),false);
      assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),true);

      await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

      //check organizationsProposals after execution
      organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
      assert.equal(organizationProposal[1],0);//proposalType

      //check if scheme upgraded
      assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
      assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),false);
     });

     it("execute proposal ChangeUpgradingScheme - yes decision - check upgrade it self. ", async function() {
       var testSetup = await setup(accounts);


       var tx = await testSetup.controllerUpgradeScheme.proposeChangeControllerUpgradingScheme(testSetup.controllerUpgradeScheme.address,helpers.NULL_HASH);
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

       //check schemes registration before execution
       var controller = await Controller.at(await testSetup.org.avatar.owner());
       assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),true);

       await testSetup.controllerUpgradeSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

       //check organizationsProposals after execution
       var organizationProposal = await testSetup.controllerUpgradeScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
       assert.equal(organizationProposal[1],0);//proposalType

       //schemes should still be registered
       assert.equal(await controller.isSchemeRegistered(testSetup.controllerUpgradeScheme.address),true);
      });
});
