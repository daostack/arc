const helpers = require("./helpers");
const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
const DxDaoSchemeConstraints = artifacts.require("./DxDaoSchemeConstraints.sol");

class GenericSchemeParams {
  constructor() {
  }
}

const setupGenericSchemeMultiCallParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token,
                                              schemeConstraints
                                            ) {
  var genericSchemeParams = new GenericSchemeParams();

  if (genesisProtocol === true) {
    genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    genericSchemeParams.initdata = await new web3.eth.Contract(registration.genericScheme.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            genericSchemeParams.votingMachine.genesisProtocol.address,
                            genericSchemeParams.votingMachine.uintArray,
                            genericSchemeParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH,
                            schemeConstraints)
                          .encodeABI();
    } else {
  genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  genericSchemeParams.initdata = await new web3.eth.Contract(registration.genericScheme.abi)
                        .methods
                        .initialize(helpers.NULL_ADDRESS,
                          genericSchemeParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          genericSchemeParams.votingMachine.params,
                          schemeConstraints)
                        .encodeABI();
  }
  return genericSchemeParams;
};


const setup = async function (accounts,contractsWhitelist,reputationAccount=0,genesisProtocol = false,tokenAddress=helpers.NULL_ADDRESS,schemeConstraints=true) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [20,10,70];
  var account2;
  if (reputationAccount === 0) {
     account2 = accounts[2];
  } else {
     account2 = reputationAccount;
  }
  testSetup.proxyAdmin = accounts[5];
  var schemeConstraintsAddress;
  if (schemeConstraints) {
    testSetup.schemeConstraints = await DxDaoSchemeConstraints.new();
    await testSetup.schemeConstraints.initialize(100000,100000,[tokenAddress],[1000],contractsWhitelist);
    schemeConstraintsAddress = testSetup.schemeConstraints.address;
  } else {
     schemeConstraintsAddress = helpers.NULL_ADDRESS;
  }
  testSetup.genericSchemeParams= await setupGenericSchemeMultiCallParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     schemeConstraintsAddress
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
                                                                      [web3.utils.fromAscii("GenericSchemeMultiCall")],
                                                                      testSetup.genericSchemeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.genericSchemeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData"
                                                                    );

  testSetup.genericSchemeMultiCall = await GenericSchemeMultiCall.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
  return testSetup;
};


const createCallToActionMock = async function(_avatar,_actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods.test2(_avatar).encodeABI();
};

const createCallToTokenApproval = async function(_token,_spender,_amount) {
  return await new web3.eth.Contract(_token.abi).methods.approve(_spender,_amount).encodeABI();
};

contract('GenericSchemeMultiCall', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("proposeCall log", async function() {
      var actionMock =await ActionMock.new();
      var testSetup = await setup(accounts,[actionMock.address]);
      var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
            [actionMock.address],[callData],[10],"description");
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewMultiCallProposal");
      assert.equal(tx.logs[0].args._callsData[0],callData);
      assert.equal(tx.logs[0].args._contractsToCall[0],actionMock.address);
      assert.equal(tx.logs[0].args._values[0],10);
      assert.equal(tx.logs[0].args._descriptionHash,"description");
    });

    it("proposeCall log - with invalid array - reverts", async function() {
      var actionMock =await ActionMock.new();
      var testSetup = await setup(accounts,[actionMock.address]);
      var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
        await testSetup.genericSchemeMultiCall.proposeCalls(
            [actionMock.address,actionMock.address],[callData],[0],helpers.NULL_HASH);
         assert(false, "Wrong length of _contractsToCall, _callsDataLens or _value arrays");
       } catch(error) {
         helpers.assertVMException(error);
       }
       try {
        await testSetup.genericSchemeMultiCall.proposeCalls(
            [actionMock.address,actionMock.address],[callData],[0],helpers.NULL_HASH);
         assert(false, "Wrong length of _contractsToCall, _callsDataLens or _value arrays");
       } catch(error) {
         helpers.assertVMException(error);
       }
       try {
        await testSetup.genericSchemeMultiCall.proposeCalls(
            [actionMock.address,actionMock.address],[callData],[0,0],helpers.NULL_HASH);
         assert(false, "Wrong length of _contractsToCall, _callsDataLens or _value arrays");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeCall -no decision - proposal data delete", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var proposal = await testSetup.genericSchemeMultiCall.proposals(proposalId);
       assert.equal(proposal.passed,false);
       assert.equal(proposal.callData,null);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
        var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
          [actionMock.address],[callData],[0],helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var proposal = await testSetup.genericSchemeMultiCall.proposals(proposalId);
        await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        proposal = await testSetup.genericSchemeMultiCall.proposals(proposalId);
        assert.equal(proposal.callData,null);//new contract address
     });

    it("execute proposeVote -positive decision - destination reverts", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //actionMock revert because msg.sender is not the _addr param at actionMock though the whole proposal execution will fail.
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       try {
         await testSetup.genericSchemeMultiCall.execute(proposalId);
         assert(false, "Proposal call failed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote -positive decision - not whitelisted contract", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[accounts[1]]);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       try {
         await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address],[callData],[0],helpers.NULL_HASH);
         assert(false, "contractToCall is not whitelisted");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote without return value-positive decision - check action", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    });

    it("execute should fail if not executed from votingMachine", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       try {
         await testSetup.genericSchemeMultiCall.execute( proposalId);
         assert(false, "execute should fail if not executed from votingMachine");
       } catch(error) {
         helpers.assertVMException(error);
       }

    });

    it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
       var value = 50000;
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[value,value],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //transfer some eth to avatar
       await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value: web3.utils.toWei('1', "ether")});
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       tx = await testSetup.genericSchemeMultiCall.execute(proposalId);
       await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecuted', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecuted");
             assert.equal(events[0].args._proposalId,proposalId);
        });
        assert.equal(await web3.eth.getBalance(actionMock.address),value*2);
       //try to execute another one within the same period should fail
       tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[value,value],helpers.NULL_HASH);
       proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       try {
          await testSetup.genericSchemeMultiCall.execute(proposalId);
          assert(false, "cannot send more within the same period");
        } catch(error) {
          helpers.assertVMException(error);
        }
       await helpers.increaseTime(100000);
       tx = await testSetup.genericSchemeMultiCall.execute(proposalId);
       await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecuted', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecuted");
             assert.equal(events[0].args._proposalId,proposalId);
        });
    });

    it("schemeconstrains eth value exceed limit", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
       var value = 100001;
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[callData],[value],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //transfer some eth to avatar
       await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value: web3.utils.toWei('1', "ether")});
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       try {
          await testSetup.genericSchemeMultiCall.execute(proposalId);
          assert(false, "cannot transfer eth amount");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("schemeconstrains token value exceed limit", async function() {
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[accounts[3]],0,true,standardTokenMock.address);
       var encodedTokenApproval = await createCallToTokenApproval(standardTokenMock,accounts[3], 10001);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([standardTokenMock.address],[encodedTokenApproval],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       try {
          await testSetup.genericSchemeMultiCall.execute(proposalId);
          assert(false, "cannot approve token amount: periodSpendingTokensExceeded");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("no schemeconstrains test execute", async function() {
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[accounts[3]],0,true,standardTokenMock.address,false);
       var encodedTokenApproval = await createCallToTokenApproval(standardTokenMock,accounts[3], 10001);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([standardTokenMock.address],[encodedTokenApproval],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.genericSchemeMultiCall.execute(proposalId);
    });

    it("execute none exist proposal", async function() {
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[accounts[3]],0,true,standardTokenMock.address,false);
       try {
          await testSetup.genericSchemeMultiCall.execute(helpers.SOME_HASH);
          assert(false, "cannot execute none exist proposal");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("execute proposeVote -negative decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);

       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx  = await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecutedByVotingMachine', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
             assert.equal(events[0].args._param,2);
        });
      });

    it("execute proposeVote with multiple calls -positive decision - check action - with GenesisProtocol", async function() {
      var actionMock =await ActionMock.new();
      var actionMock2 =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address,actionMock2.address],0,true,standardTokenMock.address);

      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var callData2 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address,actionMock2.address],
        [callData1,callData2],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      tx  = await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecutedByVotingMachine', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
            assert.equal(events[0].args._param,1);
      });
    });

    it("execute proposeVote with multiple calls -positive decision - one failed transaction", async function() {
      var actionMock =await ActionMock.new();
      var actionMock2 =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address,actionMock2.address],0,true,standardTokenMock.address);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var callData2 = await createCallToActionMock(accounts[0],actionMock);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address,actionMock2.address],
        [callData1,callData2],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var proposal = await testSetup.genericSchemeMultiCall.proposals(proposalId);
      assert.equal(proposal.exist,true);
      assert.equal(proposal.passed,false);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      try {
         await testSetup.genericSchemeMultiCall.execute(proposalId);
         assert(false, "Proposal call failed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });


    it("execute proposeVote with multiple calls with votingMachine -positive decision", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address,accounts[3]],0,true,standardTokenMock.address);
      var encodedTokenApproval = await createCallToTokenApproval(standardTokenMock,accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address,standardTokenMock.address],
        [callData1,encodedTokenApproval],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var proposal = await testSetup.genericSchemeMultiCall.proposals(proposalId);
      assert.equal(proposal.exist,true);
      assert.equal(proposal.passed,false);
      assert.equal(await standardTokenMock.allowance(testSetup.org.avatar.address,accounts[3]),0);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.genericSchemeMultiCall.execute(proposalId);
      await testSetup.genericSchemeMultiCall.getPastEvents('ProposalCallExecuted', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"ProposalCallExecuted");
            assert.equal(events[0].args._proposalId,proposalId);
            assert.equal(events[1].event,"ProposalCallExecuted");
            assert.equal(events[1].args._proposalId,proposalId);
      });
      assert.equal(await standardTokenMock.allowance(testSetup.org.avatar.address,accounts[3]),1000);
    });

    it("cannot init twice", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);

        try {
          await testSetup.genericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            testSetup.genericSchemeParams.votingMachine.absoluteVote.address,
            [0,0,0,0,0,0,0,0,0,0,0],
            helpers.NULL_ADDRESS,
            testSetup.genericSchemeParams.votingMachine.params,
            helpers.NULL_ADDRESS
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("execute proposeVote with multiple calls with votingMachine without whitelisted spender", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
      var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
         await testSetup.genericSchemeMultiCall.proposeCalls(
           [actionMock.address,standardTokenMock.address],
           [callData1,encodedTokenApproval],
           [0,0],
           helpers.NULL_HASH);
         assert(false, "spender contract not whitelisted");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("no schemeConstraints test proposeCall ", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,false);
      var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address,standardTokenMock.address],
        [callData1,encodedTokenApproval],
        [0,0],
        helpers.NULL_HASH);
    });

    it("can init with multiple contracts on whitelist", async function() {
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        var tx = await dxDaoSchemeConstraints.initialize(
              1,
              0,
              [],
              [],
              [accounts[0],accounts[1],accounts[2],accounts[3]]
        );
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"WhiteListedContracts");
        assert.equal(tx.logs[0].args._contractsWhitelist[0],accounts[0]);
        assert.equal(tx.logs[0].args._contractsWhitelist[1],accounts[1]);
        assert.equal(tx.logs[0].args._contractsWhitelist[2],accounts[2]);
        assert.equal(tx.logs[0].args._contractsWhitelist[3],accounts[3]);

    });

    it("DxDaoSchemeConstraints: cannot init twice", async function() {
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        await dxDaoSchemeConstraints.initialize(
              1,
              0,
              [],
              [],
              [accounts[0],accounts[1],accounts[2],accounts[3]]
        );
        try {
          await dxDaoSchemeConstraints.initialize(
                1,
                0,
                [],
                [],
                [accounts[0]]);
           assert(false, "cannot init twice");
         } catch(error) {
           helpers.assertVMException(error);
         }

    });

    it("DxDaoSchemeConstraints: period size > 0", async function() {
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        try {
          await dxDaoSchemeConstraints.initialize(
                0,
                0,
                [],
                [],
                [accounts[0]]);
           assert(false, "period size should be  > 0");
         } catch(error) {
           helpers.assertVMException(error);
         }

    });

    it("DxDaoSchemeConstraints: wrong token address array length", async function() {
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        try {
          await dxDaoSchemeConstraints.initialize(
                1,
                0,
                [helpers.SOME_ADDRESS],
                [],
                [accounts[0]]);
           assert(false, "periodlimit token address array length");
         } catch(error) {
           helpers.assertVMException(error);
         }

    });

});
