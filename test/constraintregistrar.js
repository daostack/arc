import * as helpers from "./helpers";
const constants = require("./constants");
const ConstraintRegistrar = artifacts.require("./ConstraintRegistrar.sol");
const ConstraintMock = artifacts.require("./test/ConstraintMock.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Controller = artifacts.require("./Controller.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const SchemesFactory = artifacts.require("./SchemesFactory.sol");

var daoFactory, schemesFactory;
const setupFactories = async function() {
  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  var actorsFactory = await ActorsFactory.new(
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

  var constraintRegistrarLibrary = await ConstraintRegistrar.new({
    gas: constants.ARC_GAS_LIMIT
  });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setConstraintRegistrarLibraryAddress(
    constraintRegistrarLibrary.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
};

const setup = async function(
  accounts,
  genesisProtocol = false,
  tokenAddress = 0
) {
  var testSetup = new helpers.TestSetup();
  testSetup.fee = 10;

  testSetup.reputationArray = [20, 10, 70];
  testSetup.org = await helpers.setupOrganizationWithArrays(
    daoFactory,
    [accounts[0], accounts[1], accounts[2]],
    [1000, 1000, 1000],
    testSetup.reputationArray
  );

  if (genesisProtocol === true) {
    testSetup.votingMachine = await helpers.setupGenesisProtocol(
      accounts,
      tokenAddress
    );

    testSetup.constraintRegistrar = await ConstraintRegistrar.at(
      (await schemesFactory.createConstraintRegistrar(
        testSetup.org.avatar.address,
        testSetup.votingMachine.genesisProtocol.address,
        testSetup.votingMachine.params
      )).logs[0].args._newSchemeAddress
    );
  } else {
    testSetup.votingMachine = await helpers.setupAbsoluteVote();

    testSetup.constraintRegistrar = await ConstraintRegistrar.at(
      (await schemesFactory.createConstraintRegistrar(
        testSetup.org.avatar.address,
        testSetup.votingMachine.absoluteVote.address,
        testSetup.votingMachine.params
      )).logs[0].args._newSchemeAddress
    );
  }

  var permissions = "0x00000004";

  await daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.constraintRegistrar.address],
    [permissions]
  );

  return testSetup;
};

contract("ConstraintRegistrar", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("proposeConstraint voteToRemoveParams", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      "0x1235"
    );

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    var voteToRemoveParams = await testSetup.constraintRegistrar.voteToRemoveParams(
      constraintMock.address
    );
    assert.equal(
      voteToRemoveParams,
      "0x1235000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("proposeConstraint organizationProposals", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      "0x1234"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    var organizationProposal = await testSetup.constraintRegistrar.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[0], constraintMock.address);
  });

  it("proposeConstraint log", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      "0x1234"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewConstraintsProposal");
  });

  it("proposeConstraint check owner vote", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      "0x1234"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("execute proposeConstraint ", async function() {
    var testSetup = await setup(accounts);
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    var constraintMock = await ConstraintMock.new();
    await constraintMock.setConstraint(false, false);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewConstraintsProposal");
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    let count = await controller.constraintsCount();
    assert.equal(count, 0);
    assert.equal(count, 0);
    tx = await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    count = await controller.constraintsCount();
    assert.equal(count, 1);
  });

  it("proposeToRemoveConstraint log", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();
    await constraintMock.setConstraint(false, false);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    tx = await testSetup.constraintRegistrar.proposeToRemoveConstraint(
      constraintMock.address
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RemoveConstraintsProposal");
  });

  it("proposeToRemoveConstraint without registration -should fail", async function() {
    var testSetup = await setup(accounts, false);
    var constraintMock = await ConstraintMock.new();
    try {
      await testSetup.constraintRegistrar.proposeToRemoveConstraint(
        constraintMock.address
      );
      assert(
        false,
        "proposeConstraint should  fail - due to no registration !"
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("proposeToRemoveConstraint check owner vote", async function() {
    var testSetup = await setup(accounts);
    var constraintMock = await ConstraintMock.new();
    await constraintMock.setConstraint(false, false);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    await testSetup.constraintRegistrar.proposeToRemoveConstraint(
      constraintMock.address
    );
    proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("execute proposeToRemoveConstraint ", async function() {
    var testSetup = await setup(accounts);
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    var constraintMock = await ConstraintMock.new();
    await constraintMock.setConstraint(false, false);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    assert.equal(
      await controller.isConstraintRegistered(constraintMock.address),
      true
    );
    tx = await testSetup.constraintRegistrar.proposeToRemoveConstraint(
      constraintMock.address
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RemoveConstraintsProposal");
    proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    let count = await controller.constraintsCount();
    assert.equal(count.toNumber(), 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    count = await controller.constraintsCount();
    assert.equal(count.toNumber(), 0);
  });

  it("execute proposeToRemoveConstraint (same as proposeConstraint) vote=NO ", async function() {
    var testSetup = await setup(accounts);
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    var constraintMock = await ConstraintMock.new();
    await constraintMock.setConstraint(false, false);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 0, 0, {
      from: accounts[2]
    });
    let count = await controller.constraintsCount();
    assert.equal(count, 0);
  });

  it("proposeToRemoveConstraint with genesis protocol", async function() {
    var standardTokenMock = await StandardTokenMock.new(accounts[0], 1000);
    var testSetup = await setup(accounts, true, standardTokenMock.address);
    var constraintMock = await ConstraintMock.new();
    //genesisProtocol use burn reputation.
    await constraintMock.setConstraint(true, true);

    var tx = await testSetup.constraintRegistrar.proposeConstraint(
      constraintMock.address,
      testSetup.votingMachine.params
    );

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.genesisProtocol.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    tx = await testSetup.constraintRegistrar.proposeToRemoveConstraint(
      constraintMock.address
    );
    proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    var rep = await testSetup.org.reputation.balanceOf(accounts[2]);

    await testSetup.votingMachine.genesisProtocol.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    await helpers.checkVoteInfo(
      testSetup.votingMachine.genesisProtocol,
      proposalId,
      accounts[2],
      [1, rep.toNumber()]
    );
  });
});
