const helpers = require("./helpers");
const { NULL_ADDRESS } = require("./helpers");
const ReputationTokenTrade = artifacts.require('./ReputationTokenTrade.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");


class ReputationTokenTradeParams {
  constructor() {
  }
}

var registration;
const setupReputationTokenTradeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token
                                            ) {
  var reputationTokenTradeParams = new ReputationTokenTradeParams();

  if (genesisProtocol === true) {
    reputationTokenTradeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    reputationTokenTradeParams.initdata = await new web3.eth.Contract(registration.reputationTokenTrade.abi)
                          .methods
                          .initialize(
                            helpers.NULL_ADDRESS,
                            reputationTokenTradeParams.votingMachine.genesisProtocol.address,
                            reputationTokenTradeParams.votingMachine.uintArray,
                            reputationTokenTradeParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH
                          ).encodeABI();
    } else {
      reputationTokenTradeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      reputationTokenTradeParams.initdata = await new web3.eth.Contract(registration.reputationTokenTrade.abi)
                        .methods
                        .initialize(
                          helpers.NULL_ADDRESS,
                          reputationTokenTradeParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          reputationTokenTradeParams.votingMachine.params
                        ).encodeABI();
  }
  return reputationTokenTradeParams;
};

const setup = async function (accounts,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
  var testSetup = new helpers.TestSetup();
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [10,70];
  var account2;
  if (reputationAccount === 0) {
     account2 = accounts[2];
  } else {
     account2 = reputationAccount;
  }
  testSetup.proxyAdmin = accounts[5];
  testSetup.reputationTokenTradeParams= await setupReputationTokenTradeParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress
                     );

  var permissions = "0x0000001f";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[1],
                                                                      account2],
                                                                      [1000,0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("ReputationTokenTrade")],
                                                                      testSetup.reputationTokenTradeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.reputationTokenTradeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData"
                                                                    );

  testSetup.reputationTokenTrade = await ReputationTokenTrade.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[0],10000);
  return testSetup;
};

contract('ReputationTokenTrade', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it("proposeTokenTrade log", async function() {
      var testSetup = await setup(accounts);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 10000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 0);
      await testSetup.standardTokenMock.approve(testSetup.reputationTokenTrade.address, 100);

      var tx = await testSetup.reputationTokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        100,
        helpers.NULL_HASH
      );
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "TokenTradeProposed");
      assert.equal(tx.logs[0].args._beneficiary, accounts[0]);
      assert.equal(tx.logs[0].args._descriptionHash, helpers.NULL_HASH);
      assert.equal(tx.logs[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(tx.logs[0].args._sendTokenAmount, 100);
      assert.equal(tx.logs[0].args._reputationAmount, 100);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 9900);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 100);
  });

  it("proposeTokenTrade should fail if tokens aren't transferred", async function() {
    var testSetup = await setup(accounts);

    try {
      await testSetup.reputationTokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        100,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if token transfer fails");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("proposeTokenTrade should fail if token not specified or amount is 0", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.approve(testSetup.reputationTokenTrade.address, 100);

    try {
      await testSetup.reputationTokenTrade.proposeTokenTrade(
        NULL_ADDRESS,
        100,
        100,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if send token is null");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await testSetup.reputationTokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        0,
        100,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if send token amount is 0");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await testSetup.reputationTokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        0,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if reputation amount is 0");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("execute proposal - fail - proposal should be deleted and funds returned", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
      await testSetup.standardTokenMock.approve(testSetup.reputationTokenTrade.address, 100);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 0);

      var tx = await testSetup.reputationTokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        100,
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 100);
      var proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
      assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

      await testSetup.reputationTokenTradeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.reputationTokenTrade.execute(proposalId);
      proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
      assert.equal(proposal.sendToken, NULL_ADDRESS);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 0);
      await testSetup.reputationTokenTrade.getPastEvents("TokenTradeProposalExecuted", {
        fromBlock: tx.blockNumber,
        toBlock: 'latest'
      }).then(function(events){
        assert.equal(events.length, 0);
      });
  });

  it("execute proposeVote - pass - proposal executed and deleted", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
    await testSetup.standardTokenMock.approve(testSetup.reputationTokenTrade.address, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 0);

    var tx = await testSetup.reputationTokenTrade.proposeTokenTrade(
      testSetup.standardTokenMock.address,
      100,
      100,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 100);
    var proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

    await testSetup.reputationTokenTradeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, {from:accounts[2]});
    tx = await testSetup.reputationTokenTrade.execute(proposalId);
    proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, NULL_ADDRESS);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 100);

    await testSetup.reputationTokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events[0].event, "TokenTradeProposalExecuted");
      assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(events[0].args._proposalId, proposalId);
      assert.equal(events[0].args._beneficiary, accounts[0]);
      assert.equal(events[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._sendTokenAmount, 100);
      assert.equal(events[0].args._reputationAmount, 100);
    });
  });

  it("execute proposal - pass - proposal cannot execute before passed/ twice", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
    await testSetup.standardTokenMock.approve(testSetup.reputationTokenTrade.address, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);

    var tx = await testSetup.reputationTokenTrade.proposeTokenTrade(
      testSetup.standardTokenMock.address,
      100,
      100,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 100);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 0);
    var proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

    try {
      await testSetup.reputationTokenTrade.execute(proposalId);
      assert(false, "cannot execute before passed");
    } catch(error) {
      helpers.assertVMException(error);
    }

    await testSetup.reputationTokenTradeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, {from:accounts[2]});
    tx = await testSetup.reputationTokenTrade.execute(proposalId);

    proposal = await testSetup.reputationTokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, NULL_ADDRESS);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.reputationTokenTrade.address), 0);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]), 100);
    await testSetup.reputationTokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events[0].event, "TokenTradeProposalExecuted");
      assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(events[0].args._proposalId, proposalId);
      assert.equal(events[0].args._beneficiary, accounts[0]);
      assert.equal(events[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._sendTokenAmount, 100);
      assert.equal(events[0].args._reputationAmount, 100);
    });

    try {
      await testSetup.reputationTokenTrade.execute(proposalId);
      assert(false, "cannot execute twice");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("cannot init twice", async function() {
      var testSetup = await setup(accounts);

      try {
        await testSetup.reputationTokenTrade.initialize(
          testSetup.org.avatar.address,
          accounts[0],
          [0,0,0,0,0,0,0,0,0,0,0],
          helpers.NULL_ADDRESS,
          helpers.SOME_HASH
        );
        assert(false, "cannot init twice");
      } catch(error) {
        helpers.assertVMException(error);
      }

  });

});
