import * as helpers from "./helpers";
const constants = require("./constants");
const Controller = artifacts.require("./Controller.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Reputation = artifacts.require("./Reputation.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const SchemesFactory = artifacts.require("./SchemesFactory.sol");

var daoFactory, actorsFactory, schemesFactory, controllerFactory;

const setupFactories = async function() {
  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  daoFactory = await DAOFactory.new(
    controllerFactory.address,
    actorsFactory.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );

  var upgradeSchemeLibrary = await UpgradeScheme.new({
    gas: constants.ARC_GAS_LIMIT
  });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setUpgradeSchemeLibraryAddress(
    upgradeSchemeLibrary.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
};

const setupNewController = async function(accounts, permission = "0x00000000") {
  // set up a reputation system
  var reputation = await Reputation.new();

  var token = await DAOToken.at(
    (await actorsFactory.createDAOToken("TEST", "TST", 0)).logs[0].args
      .newTokenAddress
  );

  var avatar = await Avatar.at(
    (await actorsFactory.createAvatar(
      "name",
      token.address,
      reputation.address
    )).logs[0].args.newAvatarAddress
  );

  var _controller;
  if (permission !== "0") {
    _controller = await Controller.at(
      (await controllerFactory.createController(avatar.address, {
        from: accounts[1],
        gas: constants.ARC_GAS_LIMIT
      })).logs[0].args.newControllerAddress
    );
    await _controller.registerScheme(accounts[0], permission, {
      from: accounts[1]
    });
    await _controller.unregisterSelf({ from: accounts[1] });
  } else {
    _controller = await Controller.at(
      (await controllerFactory.createController(avatar.address, {
        gas: constants.ARC_GAS_LIMIT
      })).logs[0].args.newControllerAddress
    );
  }
  return _controller;
};

const setup = async function(accounts) {
  var testSetup = new helpers.TestSetup();
  testSetup.fee = 10;
  testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1], 100);

  testSetup.reputationArray = [20, 40, 70];
  testSetup.org = await helpers.setupOrganizationWithArrays(
    daoFactory,
    [accounts[0], accounts[1], accounts[2]],
    [1000, 0, 0],
    testSetup.reputationArray
  );

  testSetup.votingMachine = await helpers.setupAbsoluteVote();

  testSetup.upgradeScheme = await UpgradeScheme.at(
    (await schemesFactory.createUpgradeScheme(
      testSetup.org.avatar.address,
      testSetup.votingMachine.absoluteVote.address,
      testSetup.votingMachine.params
    )).logs[0].args._newSchemeAddress
  );

  var permissions = "0x0000000a";

  await daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.upgradeScheme.address],
    [permissions]
  );

  return testSetup;
};

contract("UpgradeScheme", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("proposeUpgrade log", async () => {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      newController.address
    );

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewUpgradeProposal");

    var _newController = await helpers.getValueFromLogs(
      tx,
      "_newController",
      1
    );
    assert.equal(_newController, newController.address);
  });

  it("proposeUpgrade check owner vote", async function() {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      newController.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("proposeChangeUpgradingScheme log", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      accounts[0],
      "0x00000000"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ChangeUpgradeSchemeProposal");
    var newUpgradeScheme = await helpers.getValueFromLogs(
      tx,
      "_newUpgradeScheme",
      1
    );
    assert.equal(newUpgradeScheme, accounts[0]);
  });

  it("proposeChangeUpgradingScheme check owner vote", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      accounts[0],
      "0x00000002"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("execute proposal upgrade controller -yes - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    assert.notEqual(newController.address, await testSetup.org.avatar.owner());
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      newController.address
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    //check organizationProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[0], newController.address); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 1); //proposalType
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    assert.equal(newController.address, await testSetup.org.avatar.owner());
    //check organizationProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType
  });

  it("execute proposal upgrade controller - no decision (same for update scheme) - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      newController.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    //check organizationProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[0], newController.address); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 1); //proposalType

    //Vote with reputation to trigger execution
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 0, 0, {
      from: accounts[2]
    });
    //should not upgrade because the decision is "no"
    assert.notEqual(newController.address, await testSetup.org.avatar.owner());
    //check organizationProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType
  });

  it("execute proposal ChangeUpgradingScheme - yes decision - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      accounts[0],
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check organizationProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[0], accounts[0]); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 2); //proposalType

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), false);
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      true
    );

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    //check organizationProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //check if scheme upgraded
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      false
    );
  });

  it("execute proposal ChangeUpgradingScheme - yes decision - check approve increase fee ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      accounts[0],
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check organizationProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[0], accounts[0]); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 2); //proposalType

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), false);
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      true
    );

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    //check organizationProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //check if scheme upgraded
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      false
    );
  });

  it("execute proposal ChangeUpgradingScheme - yes decision - check upgrade it self. ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      testSetup.upgradeScheme.address,
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      true
    );

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    //check organizationProposals after execution
    var organizationProposal = await testSetup.upgradeScheme.organizationProposals(
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //schemes should still be registered
    assert.equal(
      await controller.isSchemeRegistered(testSetup.upgradeScheme.address),
      true
    );
  });
});
