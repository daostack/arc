import * as helpers from "./helpers";
const constants = require("./constants");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const SchemeMock = artifacts.require("./SchemeMock.sol");
const Controller = artifacts.require("./Controller.sol");
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

  var schemeRegistrarLibrary = await SchemeRegistrar.new({
    gas: constants.ARC_GAS_LIMIT
  });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setSchemeRegistrarLibraryAddress(
    schemeRegistrarLibrary.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
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

  testSetup.schemeRegistrar = await SchemeRegistrar.at(
    (await schemesFactory.createSchemeRegistrar(
      testSetup.org.avatar.address,
      testSetup.votingMachine.absoluteVote.address,
      testSetup.votingMachine.params,
      testSetup.votingMachine.params
    )).logs[0].args._newSchemeAddress
  );

  var permissions = "0x0000001F";
  await daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.schemeRegistrar.address],
    [permissions]
  );

  return testSetup;
};
contract("SchemeRegistrar", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("proposeScheme log", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      testSetup.schemeRegistrar.address,
      "0x00000000"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewSchemeProposal");
  });

  it("proposeScheme check owner vote", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      testSetup.schemeRegistrar.address,
      "0x00000000"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("proposeToRemoveScheme log", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(
      testSetup.schemeRegistrar.address
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RemoveSchemeProposal");
  });

  it("proposeToRemoveScheme check owner vote", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(
      testSetup.schemeRegistrar.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await helpers.checkVoteInfo(
      testSetup.votingMachine.absoluteVote,
      proposalId,
      accounts[0],
      [1, testSetup.reputationArray[0]]
    );
  });

  it("execute proposeScheme  and execute -yes - fee > 0 ", async function() {
    var testSetup = await setup(accounts);
    var schemeMock = await SchemeMock.new();
    var tx = await testSetup.schemeRegistrar.proposeScheme(
      schemeMock.address,
      "0x00000000"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(schemeMock.address), true);
  });

  it("execute proposeScheme  and execute -yes - permissions== 0x00000001", async function() {
    var testSetup = await setup(accounts);
    var permissions = "0x00000001";

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      permissions
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000001"
    );
  });

  it("execute proposeScheme  and execute -yes - permissions== 0x00000002", async function() {
    var testSetup = await setup(accounts);
    var permissions = "0x00000002";

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      permissions
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000003"
    );
  });

  it("execute proposeScheme  and execute -yes - permissions== 0x00000003", async function() {
    var testSetup = await setup(accounts);
    var permissions = "0x00000003";

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      permissions
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000003"
    );
  });

  it("execute proposeScheme  and execute -yes - permissions== 0x00000008", async function() {
    var testSetup = await setup(accounts);
    var permissions = "0x00000008";

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      permissions
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000009"
    );
  });

  it("execute proposeScheme  and execute -yes - permissions== 0x00000010", async function() {
    var testSetup = await setup(accounts);
    var permissions = "0x00000010";

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      permissions
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000011"
    );
  });

  it("execute proposeScheme  and execute -yes - isRegistering==FALSE ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      "0x00000000"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(await controller.isSchemeRegistered(accounts[0]), true);
    assert.equal(
      await controller.getSchemePermissions(accounts[0]),
      "0x00000001"
    );
  });

  it("execute proposeScheme - no decision (same for remove scheme) - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeScheme(
      accounts[0],
      "0x00000000"
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    //check organizationProposals before execution
    var organizationProposal = await testSetup.schemeRegistrar.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[1].toNumber(), 1); //proposalType

    //Vote with reputation to trigger execution
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 2, 0, {
      from: accounts[2]
    });
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    //should not register because the decision is "no"
    assert.equal(await controller.isSchemeRegistered(accounts[0]), false);
    //check organizationProposals after execution
    organizationProposal = await testSetup.schemeRegistrar.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[1], 0); //proposalType
  });

  it("execute proposeToRemoveScheme ", async function() {
    var testSetup = await setup(accounts);

    var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(
      testSetup.schemeRegistrar.address
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    var controller = await Controller.at(await testSetup.org.avatar.owner());
    assert.equal(
      await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),
      true
    );
    //Vote with reputation to trigger execution
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    assert.equal(
      await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),
      false
    );
    //check organizationProposals after execution
    var organizationProposal = await testSetup.schemeRegistrar.organizationProposals(
      proposalId
    );
    assert.equal(organizationProposal[1], 0); //proposalType
  });
  it("execute proposeScheme  and execute -yes - autoRegisterOrganization==TRUE arc scheme", async function() {
    var testSetup = await setup(accounts);

    var schemeMock = await SchemeMock.new();
    var tx = await testSetup.schemeRegistrar.proposeScheme(
      schemeMock.address,
      "0x00000000"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
  });

  it("execute proposeScheme  and execute -yes - autoRegisterOrganization==FALSE arc scheme", async function() {
    var testSetup = await setup(accounts);

    var schemeMock = await SchemeMock.new();
    var tx = await testSetup.schemeRegistrar.proposeScheme(
      schemeMock.address,
      "0x00000000"
    );
    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId", 1);
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
  });
});
