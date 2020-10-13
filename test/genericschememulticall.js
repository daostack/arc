import * as helpers from './helpers';

const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
const DxDaoSchemeConstraints = artifacts.require("./DxDaoSchemeConstraints.sol");

export class GenericSchemeParams {
  constructor() {
  }
}

const setupGenericSchemeParams = async function(
                                            genericScheme,
                                            accounts,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar,
                                            schemeConstraintsAddress
                                            ) {
  var genericSchemeParams = new GenericSchemeParams();
  if (genesisProtocol === true){
      genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,0,helpers.NULL_ADDRESS);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.genesisProtocol.address,
            genericSchemeParams.votingMachine.params,
            schemeConstraintsAddress);
    }
  else {
      genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,genericScheme.address);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.absoluteVote.address,
            genericSchemeParams.votingMachine.params,
            schemeConstraintsAddress);
  }
  return genericSchemeParams;
};

const setup = async function (accounts,
                              contractsWhiteList,
                              reputationAccount=0,
                              genesisProtocol = false,
                              tokenAddress=helpers.NULL_ADDRESS,
                              useSchemeConstraint = true) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.genericSchemeMultiCall = await GenericSchemeMultiCall.new();
   var controllerCreator = await ControllerCreator.new();
   var daoTracker = await DAOTracker.new();
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address);
   testSetup.reputationArray = [20,10,70];
   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }
   var schemeConstraintsAddress;
   if (useSchemeConstraint) {
      testSetup.schemeConstraints = await DxDaoSchemeConstraints.new();
      schemeConstraintsAddress = testSetup.schemeConstraints.address;
      await testSetup.schemeConstraints.initialize(100000,100000,[tokenAddress],[1000],contractsWhiteList);
    } else {
      schemeConstraintsAddress = helpers.NULL_ADDRESS;
   }
   testSetup.genericSchemeParams= await setupGenericSchemeParams(testSetup.genericSchemeMultiCall,accounts,genesisProtocol,tokenAddress,testSetup.org.avatar,schemeConstraintsAddress);
   var permissions = "0x00000010";


   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.genericSchemeMultiCall.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");

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
            accounts[0],
            helpers.SOME_HASH,
            testSetup.schemeConstraints.address
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("can init with multiple contracts on whitelist", async function() {
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        await dxDaoSchemeConstraints.initialize(
              1,
              0,
              [],
              [],
              [accounts[0],accounts[1],accounts[2],accounts[3]]
        );
        var contractsWhiteList = await dxDaoSchemeConstraints.getContractsWhiteList();
        assert.equal(contractsWhiteList[0],accounts[0]);
        assert.equal(contractsWhiteList[1],accounts[1]);
        assert.equal(contractsWhiteList[2],accounts[2]);
        assert.equal(contractsWhiteList[3],accounts[3]);

    });

    it("execute proposeVote with multiple calls with votingMachine without whitelisted spender", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
      var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
         await testSetup.genericSchemeMultiCall.proposeCalls(
           [actionMock.address],
           [callData1,encodedTokenApproval],
           [0,0],
           helpers.NULL_HASH);
         assert(false, "spender contract not whitelisted");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });


    it("none exist schemeConstraints for proposeCall", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,false);
      var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      await testSetup.genericSchemeMultiCall.proposeCalls(
        [actionMock.address,actionMock.address],
        [callData1,encodedTokenApproval],
        [0,0],
        helpers.NULL_HASH);
    });

    it("none exist schemeConstraints for executeCall", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,false);
      var value = 100001;
      var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[callData],[value],helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      //transfer some eth to avatar
      await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value: web3.utils.toWei('1', "ether")});
      assert.equal(await web3.eth.getBalance(actionMock.address),0);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.genericSchemeMultiCall.execute(proposalId);
    });

    it("execute none exist proposal", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        try {
          await testSetup.genericSchemeMultiCall.execute(helpers.SOME_HASH);
          assert(false, "cannot execute none exist proposal");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

});
