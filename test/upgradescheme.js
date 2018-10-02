import * as helpers from "./helpers";
const constants = require("./constants");
const Controller = artifacts.require("./Controller.sol");
const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Reputation = artifacts.require("./Reputation.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");

export class UpgradeSchemeParams {
  constructor() {}
}

const setupUpgradeSchemeParams = async function(upgradeScheme) {
  var upgradeSchemeParams = new UpgradeSchemeParams();
  upgradeSchemeParams.votingMachine = await helpers.setupAbsoluteVote();
  await upgradeScheme.setParameters(
    upgradeSchemeParams.votingMachine.params,
    upgradeSchemeParams.votingMachine.absoluteVote.address
  );
  upgradeSchemeParams.paramsHash = await upgradeScheme.getParametersHash(
    upgradeSchemeParams.votingMachine.params,
    upgradeSchemeParams.votingMachine.absoluteVote.address
  );
  return upgradeSchemeParams;
};

var controllerFactory;

const setupNewController = async function(accounts, permission = "0x00000000") {
  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  var actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

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
    await _controller.registerScheme(
      accounts[0],
      helpers.NULL_HASH,
      permission,
      avatar.address,
      { from: accounts[1] }
    );
    await _controller.unregisterSelf(avatar.address, { from: accounts[1] });
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
  testSetup.upgradeScheme = await UpgradeScheme.new();

  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  var actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  testSetup.daoFactory = await DAOFactory.new(
    controllerFactory.address,
    actorsFactory.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
  testSetup.reputationArray = [20, 40, 70];
  testSetup.org = await helpers.setupOrganizationWithArrays(
    testSetup.daoFactory,
    [accounts[0], accounts[1], accounts[2]],
    [1000, 0, 0],
    testSetup.reputationArray
  );
  testSetup.upgradeSchemeParams = await setupUpgradeSchemeParams(
    testSetup.upgradeScheme
  );

  var permissions = "0x0000000a";

  await testSetup.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.upgradeScheme.address],
    [testSetup.upgradeSchemeParams.paramsHash],
    [permissions]
  );

  return testSetup;
};

contract("UpgradeScheme", accounts => {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it("setParameters", async () => {
    var upgradeScheme = await UpgradeScheme.new();
    var absoluteVote = await AbsoluteVote.new();
    await upgradeScheme.setParameters("0x1234", absoluteVote.address);
    var paramHash = await upgradeScheme.getParametersHash(
      "0x1234",
      absoluteVote.address
    );
    var parameters = await upgradeScheme.parameters(paramHash);
    assert.equal(parameters[1], absoluteVote.address);
  });

  it("proposeUpgrade log", async () => {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      testSetup.org.avatar.address,
      newController.address
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewUpgradeProposal");
    var votingMachine = await helpers.getValueFromLogs(
      tx,
      "_intVoteInterface",
      1
    );
    assert.equal(
      votingMachine,
      testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address
    );
  });

  it("proposeUpgrade check owner vote", async function() {
    var testSetup = await setup(accounts);

    var newController = await setupNewController(accounts);
    var tx = await testSetup.upgradeScheme.proposeUpgrade(
      testSetup.org.avatar.address,
      newController.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.upgradeSchemeParams.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("proposeChangeUpgradingScheme log", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      testSetup.org.avatar.address,
      accounts[0],
      "0x00000000"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ChangeUpgradeSchemeProposal");
    var votingMachine = await helpers.getValueFromLogs(
      tx,
      "_intVoteInterface",
      1
    );
    assert.equal(
      votingMachine,
      testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address
    );
  });

  it("proposeChangeUpgradingScheme check owner vote", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      testSetup.org.avatar.address,
      accounts[0],
      "0x00000002"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.upgradeSchemeParams.votingMachine.absoluteVote,
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
      testSetup.org.avatar.address,
      newController.address
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    //check organizationsProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(organizationProposal[0], newController.address); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 1); //proposalType
    await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(
      proposalId,
      1,
      0,
      { from: accounts[2] }
    );
    assert.equal(newController.address, await testSetup.org.avatar.owner());
    //check organizationsProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
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
      testSetup.org.avatar.address,
      newController.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    //check organizationsProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(organizationProposal[0], newController.address); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 1); //proposalType

    //Vote with reputation to trigger execution
    await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(
      proposalId,
      0,
      0,
      { from: accounts[2] }
    );
    //should not upgrade because the decision is "no"
    assert.notEqual(newController.address, await testSetup.org.avatar.owner());
    //check organizationsProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
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
      testSetup.org.avatar.address,
      accounts[0],
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check organizationsProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(organizationProposal[0], accounts[0]); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 2); //proposalType

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(
      await controller.isSchemeRegistered(
        accounts[0],
        testSetup.org.avatar.address
      ),
      false
    );
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      true
    );

    await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(
      proposalId,
      1,
      0,
      { from: accounts[2] }
    );

    //check organizationsProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //check if scheme upgraded
    assert.equal(
      await controller.isSchemeRegistered(
        accounts[0],
        testSetup.org.avatar.address
      ),
      true
    );
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      false
    );
  });

  it("execute proposal ChangeUpgradingScheme - yes decision - check approve increase fee ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      testSetup.org.avatar.address,
      accounts[0],
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check organizationsProposals before execution
    var organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(organizationProposal[0], accounts[0]); //new contract address
    assert.equal(organizationProposal[2].toNumber(), 2); //proposalType

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(
      await controller.isSchemeRegistered(
        accounts[0],
        testSetup.org.avatar.address
      ),
      false
    );
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      true
    );

    await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(
      proposalId,
      1,
      0,
      { from: accounts[2] }
    );

    //check organizationsProposals after execution
    organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //check if scheme upgraded
    assert.equal(
      await controller.isSchemeRegistered(
        accounts[0],
        testSetup.org.avatar.address
      ),
      true
    );
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      false
    );
  });

  it("execute proposal ChangeUpgradingScheme - yes decision - check upgrade it self. ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(
      testSetup.org.avatar.address,
      testSetup.upgradeScheme.address,
      "0x00000002"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    //check schemes registration before execution
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      true
    );

    await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(
      proposalId,
      1,
      0,
      { from: accounts[2] }
    );

    //check organizationsProposals after execution
    var organizationProposal = await testSetup.upgradeScheme.organizationsProposals(
      testSetup.org.avatar.address,
      proposalId
    );
    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
    assert.equal(organizationProposal[2], 0); //proposalType

    //schemes should still be registered
    assert.equal(
      await controller.isSchemeRegistered(
        testSetup.upgradeScheme.address,
        testSetup.org.avatar.address
      ),
      true
    );
  });
});
