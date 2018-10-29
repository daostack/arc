import * as helpers from "./helpers";
const constants = require("./constants");
const VoteInOrganizationScheme = artifacts.require(
  "./VoteInOrganizationScheme.sol"
);
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Controller = artifacts.require("./Controller.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const AbsoluteVoteExecuteMock = artifacts.require(
  "./AbsoluteVoteExecuteMock.sol"
);
const GenesisProtocolCallbacksMock = artifacts.require(
  "./GenesisProtocolCallbacksMock.sol"
);
const Reputation = artifacts.require("./Reputation.sol");
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

  var voteInOrganizationSchemeLibrary = await VoteInOrganizationScheme.new({
    gas: constants.ARC_GAS_LIMIT
  });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setVoteInOrganizationSchemeLibraryAddress(
    voteInOrganizationSchemeLibrary.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );
};

const setup = async function(
  accounts,
  reputationAccount = 0,
  genesisProtocol = false,
  tokenAddress = 0
) {
  var testSetup = new helpers.TestSetup();
  testSetup.fee = 10;
  testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1], 100);

  testSetup.reputationArray = [20, 10, 70];
  if (reputationAccount === 0) {
    testSetup.org = await helpers.setupOrganizationWithArrays(
      daoFactory,
      [accounts[0], accounts[1], accounts[2]],
      [1000, 1000, 1000],
      testSetup.reputationArray
    );
  } else {
    testSetup.org = await helpers.setupOrganizationWithArrays(
      daoFactory,
      [accounts[0], accounts[1], reputationAccount],
      [1000, 1000, 1000],
      testSetup.reputationArray
    );
  }

  if (genesisProtocol === true) {
    testSetup.votingMachine = await helpers.setupGenesisProtocol(
      accounts,
      tokenAddress,
      testSetup.org.avatar
    );

    testSetup.voteInOrganizationScheme = await VoteInOrganizationScheme.at(
      (await schemesFactory.createVoteInOrganizationScheme(
        testSetup.org.avatar.address,
        testSetup.votingMachine.genesisProtocol.address,
        testSetup.votingMachine.params
      )).logs[0].args._newSchemeAddress
    );
  } else {
    testSetup.votingMachine = await helpers.setupAbsoluteVote(
      true,
      50,
      reputationAccount
    );

    testSetup.voteInOrganizationScheme = await VoteInOrganizationScheme.at(
      (await schemesFactory.createVoteInOrganizationScheme(
        testSetup.org.avatar.address,
        testSetup.votingMachine.absoluteVote.address,
        testSetup.votingMachine.params
      )).logs[0].args._newSchemeAddress
    );
  }

  var permissions = "0x00000010";

  await daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.voteInOrganizationScheme.address],
    [permissions]
  );

  return testSetup;
};

contract("VoteInOrganizationScheme", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("proposeVote log", async function() {
    var testSetup = await setup(accounts);

    var anotherTestSetup = await setup(accounts);
    var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(
      testSetup.org.reputation.address,
      anotherTestSetup.votingMachine.absoluteVote.address
    );

    var tx = await absoluteVoteExecuteMock.propose(
      5,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );

    const proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.absoluteVote.address,
      proposalId
    );

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewVoteProposal");
  });

  it("execute proposeVote -no decision - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var anotherTestSetup = await setup(accounts);
    var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(
      testSetup.org.reputation.address,
      anotherTestSetup.votingMachine.absoluteVote.address
    );
    var tx = await absoluteVoteExecuteMock.propose(
      2,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );
    var originalProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.absoluteVote.address,
      originalProposalId
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 0, 0, {
      from: accounts[2]
    });

    // check organizationProposals after execution
    var organizationProposal = await testSetup.voteInOrganizationScheme.organizationProposals(
      proposalId
    );

    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
  });

  it("execute proposeVote -positive decision - proposal data delete", async function() {
    var testSetup = await setup(accounts);

    var anotherTestSetup = await setup(accounts);
    var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(
      testSetup.org.reputation.address,
      anotherTestSetup.votingMachine.absoluteVote.address
    );

    var tx = await absoluteVoteExecuteMock.propose(
      2,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );

    var originalProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.absoluteVote.address,
      originalProposalId
    );

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    var organizationProposal = await testSetup.voteInOrganizationScheme.organizationProposals(
      proposalId
    );

    assert.equal(
      organizationProposal[0],
      anotherTestSetup.votingMachine.absoluteVote.address
    ); // new contract address

    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    // check organizationProposals after execution
    organizationProposal = await testSetup.voteInOrganizationScheme.organizationProposals(
      proposalId
    );

    assert.equal(
      organizationProposal[0],
      0x0000000000000000000000000000000000000000
    ); //new contract address
  });

  it("execute proposeVote -positive decision - check action", async function() {
    var testSetup = await setup(accounts);

    var anotherTestSetup = await setup(accounts, testSetup.org.avatar.address);
    var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(
      anotherTestSetup.org.reputation.address,
      anotherTestSetup.votingMachine.absoluteVote.address
    );

    var tx = await absoluteVoteExecuteMock.propose(
      2,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );

    var originalProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.absoluteVote.address,
      originalProposalId
    );

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    await helpers.checkVoteInfo(
      anotherTestSetup.votingMachine.absoluteVote,
      originalProposalId,
      testSetup.org.avatar.address,
      [1, anotherTestSetup.reputationArray[2]]
    );
  });

  it("execute proposeVote -positive decision vote orignalNumberOfChoices + 1 - check action", async function() {
    var testSetup = await setup(accounts);

    var anotherTestSetup = await setup(accounts, testSetup.org.avatar.address);
    var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(
      anotherTestSetup.org.reputation.address,
      anotherTestSetup.votingMachine.absoluteVote.address
    );
    var tx = await absoluteVoteExecuteMock.propose(
      2,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );
    var originalProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.absoluteVote.address,
      originalProposalId
    );
    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    await testSetup.votingMachine.absoluteVote.vote(proposalId, 3, 0, {
      from: accounts[2]
    });
    await helpers.checkVoteInfo(
      anotherTestSetup.votingMachine.absoluteVote,
      originalProposalId,
      testSetup.org.avatar.address,
      [0, anotherTestSetup.reputationArray[2]]
    );
  });

  it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
    var standardTokenMock = await StandardTokenMock.new(accounts[0], 1000);
    var testSetup = await setup(accounts, 0, true, standardTokenMock.address);

    var anotherTestSetup = await setup(
      accounts,
      0,
      true,
      standardTokenMock.address
    );

    var reputation = await Reputation.new();
    await reputation.mint(testSetup.org.avatar.address, 100);

    var genesisProtocolCallbacksMock = await GenesisProtocolCallbacksMock.new(
      reputation.address,
      standardTokenMock.address,
      anotherTestSetup.votingMachine.genesisProtocol.address
    );

    await reputation.transferOwnership(genesisProtocolCallbacksMock.address);
    var tx = await genesisProtocolCallbacksMock.propose(
      2,
      anotherTestSetup.votingMachine.params,
      anotherTestSetup.org.avatar.address,
      accounts[0]
    );

    var originalProposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    tx = await testSetup.voteInOrganizationScheme.proposeVote(
      anotherTestSetup.votingMachine.genesisProtocol.address,
      originalProposalId
    );

    var proposalId = await helpers.getValueFromLogs(tx, "_proposalId");
    await testSetup.votingMachine.genesisProtocol.vote(proposalId, 1, 0, {
      from: accounts[2]
    });

    await helpers.checkVoteInfo(
      anotherTestSetup.votingMachine.genesisProtocol,
      originalProposalId,
      testSetup.org.avatar.address,
      [1, 100]
    );
  });
});
