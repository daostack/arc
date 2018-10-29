import * as helpers from "./helpers";
const constants = require("./constants");
const GenericScheme = artifacts.require("./GenericScheme.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Controller = artifacts.require("./Controller.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const StandardTokenMock = artifacts.require("./StandardTokenMock.sol");
const SchemesFactory = artifacts.require("./SchemesFactory.sol");

const ActionMock = artifacts.require("./ActionMock.sol");

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

  var genericSchemeLibrary = await GenericScheme.new({
    gas: constants.ARC_GAS_LIMIT
  });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setGenericSchemeLibraryAddress(
    genericSchemeLibrary.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
};

const setup = async function(
  accounts,
  contractToCall = 0,
  reputationAccount = 0,
  genesisProtocol = false,
  tokenAddress = 0
) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1], 100);

  testSetup.daoFactory = daoFactory;

  testSetup.reputationArray = [20, 10, 70];

  if (reputationAccount === 0) {
    testSetup.org = await helpers.setupOrganizationWithArrays(
      testSetup.daoFactory,
      [accounts[0], accounts[1], accounts[2]],
      [1000, 1000, 1000],
      testSetup.reputationArray
    );
  } else {
    testSetup.org = await helpers.setupOrganizationWithArrays(
      testSetup.daoFactory,
      [accounts[0], accounts[1], reputationAccount],
      [1000, 1000, 1000],
      testSetup.reputationArray
    );
  }

  if (genesisProtocol === true) {
    testSetup.votingMachine = await helpers.setupGenesisProtocol(
      accounts,
      tokenAddress
    );

    testSetup.genericScheme = await GenericScheme.at(
      (await schemesFactory.createGenericScheme(
        testSetup.org.avatar.address,
        testSetup.votingMachine.genesisProtocol.address,
        testSetup.votingMachine.params,
        contractToCall
      )).logs[0].args._newSchemeAddress
    );
  } else {
    testSetup.votingMachine = await helpers.setupAbsoluteVote();

    testSetup.genericScheme = await GenericScheme.at(
      (await schemesFactory.createGenericScheme(
        testSetup.org.avatar.address,
        testSetup.votingMachine.absoluteVote.address,
        testSetup.votingMachine.params,
        contractToCall
      )).logs[0].args._newSchemeAddress
    );
  }

  var permissions = "0x00000010";

  await testSetup.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.genericScheme.address],
    [permissions]
  );

  return testSetup;
};

const createCallToActionMock = async function(_avatar, _actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods
    .test2(_avatar)
    .encodeABI();
};

contract("GenericScheme", function(accounts) {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("proposeCall log", async function() {
    var actionMock = await ActionMock.new();
    var testSetup = await setup(accounts, actionMock.address);
    var callData = await createCallToActionMock(
      testSetup.org.avatar.address,
      actionMock
    );

    var tx = await testSetup.genericScheme.proposeCall(callData);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewCallProposal");
  });

  it("execute proposeCall -no decision - proposal data delete", async function() {
    var actionMock = await ActionMock.new();
    var testSetup = await setup(accounts, actionMock.address);
    var callData = await createCallToActionMock(
      testSetup.org.avatar.address,
      actionMock
    );
    var tx = await testSetup.genericScheme.proposeCall(callData);
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 0, 0, {
      from: accounts[2]
    });

    //check organizationsProposals after execution
    callData = await testSetup.genericScheme.proposals(proposalId);
    assert.equal(callData, null);
  });

  it("execute proposeVote -positive decision - proposal data delete", async function() {
    var actionMock = await ActionMock.new();
    var testSetup = await setup(accounts, actionMock.address);
    var callData = await createCallToActionMock(
      testSetup.org.avatar.address,
      actionMock
    );
    var tx = await testSetup.genericScheme.proposeCall(callData);

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    var proposal = await testSetup.genericScheme.proposals(proposalId);

    assert.equal(proposal, callData);

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    //check organizationsProposals after execution
    proposal = await testSetup.genericScheme.proposals(proposalId);
    assert.equal(proposal, null); //new contract address
  });

  it("execute proposeVote -positive decision - check action", async function() {
    var actionMock = await ActionMock.new();
    var testSetup = await setup(accounts, actionMock.address);
    var callData = await createCallToActionMock(0, actionMock);
    var tx = await testSetup.genericScheme.proposeCall(callData);
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    try {
      await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
        from: accounts[2]
      });
      assert(
        false,
        "should revert in actionMock because msg.sender is not the _addr param at actionMock"
      );
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("execute proposeVote without return value-positive decision - check action", async function() {
    var actionMock = await ActionMock.new();
    var testSetup = await setup(accounts, actionMock.address);
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods
      .withoutReturnValue(testSetup.org.avatar.address)
      .encodeABI();
    var tx = await testSetup.genericScheme.proposeCall(encodeABI);
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
  });

  it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
    var actionMock = await ActionMock.new();
    var standardTokenMock = await StandardTokenMock.new(accounts[0], 1000);
    var testSetup = await setup(
      accounts,
      actionMock.address,
      0,
      true,
      standardTokenMock.address
    );

    var callData = await createCallToActionMock(
      testSetup.org.avatar.address,
      actionMock
    );
    var tx = await testSetup.genericScheme.proposeCall(callData);
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.votingMachine.genesisProtocol.vote(proposalId, 1, 0, {
      from: accounts[2]
    });
    assert.equal(tx.logs.length, 3);
    assert.equal(tx.logs[1].event, "ExecuteProposal");
  });
});
