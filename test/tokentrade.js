const helpers = require("./helpers");
const { NULL_ADDRESS } = require("./helpers");
const TokenTrade = artifacts.require('./TokenTrade.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");


class TokenTradeParams {
  constructor() {
  }
}

var registration;
const setupTokenTradeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token
                                            ) {
  var tokenTradeParams = new TokenTradeParams();

  if (genesisProtocol === true) {
    tokenTradeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    tokenTradeParams.initdata = await new web3.eth.Contract(registration.tokenTrade.abi)
                          .methods
                          .initialize(
                            helpers.NULL_ADDRESS,
                            tokenTradeParams.votingMachine.genesisProtocol.address,
                            tokenTradeParams.votingMachine.uintArray,
                            tokenTradeParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH
                          ).encodeABI();
    } else {
      tokenTradeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      tokenTradeParams.initdata = await new web3.eth.Contract(registration.tokenTrade.abi)
                        .methods
                        .initialize(
                          helpers.NULL_ADDRESS,
                          tokenTradeParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          tokenTradeParams.votingMachine.params
                        ).encodeABI();
  }
  return tokenTradeParams;
};

const setup = async function (accounts,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
  var testSetup = new helpers.TestSetup();
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [20,10,70];
  var account2;
  if (reputationAccount === 0) {
     account2 = accounts[2];
  } else {
     account2 = reputationAccount;
  }
  testSetup.proxyAdmin = accounts[5];
  testSetup.tokenTradeParams= await setupTokenTradeParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress
                     );

  var permissions = "0x0000001f";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      account2],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("TokenTrade")],
                                                                      testSetup.tokenTradeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.tokenTradeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData"
                                                                    );

  testSetup.tokenTrade = await TokenTrade.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[0],10000);
  return testSetup;
};

contract('TokenTrade', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

  it("proposeTokenTrade log", async function() {
      var testSetup = await setup(accounts);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 10000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);
      await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);

      var tx = await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        testSetup.standardTokenMock.address,
        101,
        helpers.NULL_HASH
      );
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "TokenTradeProposed");
      assert.equal(tx.logs[0].args._beneficiary, accounts[0]);
      assert.equal(tx.logs[0].args._descriptionHash, helpers.NULL_HASH);
      assert.equal(tx.logs[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(tx.logs[0].args._sendTokenAmount, 100);
      assert.equal(tx.logs[0].args._receiveToken, testSetup.standardTokenMock.address);
      assert.equal(tx.logs[0].args._receiveTokenAmount, 101);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 9900);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
  });

  it("proposeTokenTrade should fail if tokens aren't transferred", async function() {
    var testSetup = await setup(accounts);

    try {
      await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        testSetup.standardTokenMock.address,
        101,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if token transfer fails");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("proposeTokenTrade should fail if token not specified or amount is 0", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);

    try {
      await testSetup.tokenTrade.proposeTokenTrade(
        NULL_ADDRESS,
        100,
        testSetup.standardTokenMock.address,
        101,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if send token is null");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        NULL_ADDRESS,
        101,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if receive token is null");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        0,
        testSetup.standardTokenMock.address,
        101,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if send token amount is 0");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        testSetup.standardTokenMock.address,
        0,
        helpers.NULL_HASH
      );
      assert(false, "proposing should fail if send token amount is 0");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("execute proposal - fail - proposal should be deleted and funds returned", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
      await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);

      var tx = await testSetup.tokenTrade.proposeTokenTrade(
        testSetup.standardTokenMock.address,
        100,
        testSetup.standardTokenMock.address,
        101,
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
      var proposal = await testSetup.tokenTrade.proposals(proposalId);
      assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

      await testSetup.tokenTradeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.tokenTrade.execute(proposalId);
      proposal = await testSetup.tokenTrade.proposals(proposalId);
      assert.equal(proposal.sendToken, NULL_ADDRESS);
      assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);
      await testSetup.tokenTrade.getPastEvents("TokenTradeProposalExecuted", {
        fromBlock: tx.blockNumber,
        toBlock: 'latest'
      }).then(function(events){
        assert.equal(events.length, 0);
      });
  });

  it("execute proposeVote - pass - proposal executed and deleted", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
    await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);

    var tx = await testSetup.tokenTrade.proposeTokenTrade(
      testSetup.standardTokenMock.address,
      100,
      testSetup.standardTokenMock.address,
      101,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
    var proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

    await testSetup.tokenTradeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, {from:accounts[2]});
    tx = await testSetup.tokenTrade.execute(proposalId);
    proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, NULL_ADDRESS);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 4999);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5001);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);
    await testSetup.tokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events[0].event, "TokenTradeProposalExecuted");
      assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(events[0].args._proposalId, proposalId);
      assert.equal(events[0].args._beneficiary, accounts[0]);
      assert.equal(events[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._sendTokenAmount, 100);
      assert.equal(events[0].args._receiveToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._receiveTokenAmount, 101);
    });
  });

  it("execute proposal - pass - proposal should pass without execution if DAO doesn't have enough tokens", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(accounts[1], 5000);
    await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 0);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);

    var tx = await testSetup.tokenTrade.proposeTokenTrade(
      testSetup.standardTokenMock.address,
      100,
      testSetup.standardTokenMock.address,
      101,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
    var proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

    tx = await testSetup.tokenTradeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, {from:accounts[2]});

    proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.passed, true);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
    await testSetup.tokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events.length, 0);
    });

    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000, {from: accounts[1]});
    tx = await testSetup.tokenTrade.execute(proposalId);

    proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, NULL_ADDRESS);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 4999);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5001);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);
    await testSetup.tokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events[0].event, "TokenTradeProposalExecuted");
      assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(events[0].args._proposalId, proposalId);
      assert.equal(events[0].args._beneficiary, accounts[0]);
      assert.equal(events[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._sendTokenAmount, 100);
      assert.equal(events[0].args._receiveToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._receiveTokenAmount, 101);
    });
  });

  it("execute proposal - pass - proposal cannot execute before passed/ twice", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address, 5000);
    await testSetup.standardTokenMock.approve(testSetup.tokenTrade.address, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);

    var tx = await testSetup.tokenTrade.proposeTokenTrade(
      testSetup.standardTokenMock.address,
      100,
      testSetup.standardTokenMock.address,
      101,
      helpers.NULL_HASH
    );
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 5000);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 4900);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 100);
    var proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, testSetup.standardTokenMock.address);

    try {
      await testSetup.tokenTrade.execute(proposalId);
      assert(false, "cannot execute before passed");
    } catch(error) {
      helpers.assertVMException(error);
    }

    await testSetup.tokenTradeParams.votingMachine.absoluteVote.vote(proposalId, 1, 0, helpers.NULL_ADDRESS, {from:accounts[2]});
    tx = await testSetup.tokenTrade.execute(proposalId);

    proposal = await testSetup.tokenTrade.proposals(proposalId);
    assert.equal(proposal.sendToken, NULL_ADDRESS);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address), 4999);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]), 5001);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.tokenTrade.address), 0);
    await testSetup.tokenTrade.getPastEvents("TokenTradeProposalExecuted", {
      fromBlock: tx.blockNumber,
      toBlock: 'latest'
    }).then(function(events){
      assert.equal(events[0].event, "TokenTradeProposalExecuted");
      assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(events[0].args._proposalId, proposalId);
      assert.equal(events[0].args._beneficiary, accounts[0]);
      assert.equal(events[0].args._sendToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._sendTokenAmount, 100);
      assert.equal(events[0].args._receiveToken, testSetup.standardTokenMock.address);
      assert.equal(events[0].args._receiveTokenAmount, 101);
    });

    try {
      await testSetup.tokenTrade.execute(proposalId);
      assert(false, "cannot execute twice");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("cannot init twice", async function() {
      var testSetup = await setup(accounts);

      try {
        await testSetup.tokenTrade.initialize(
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
