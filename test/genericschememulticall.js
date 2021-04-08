const helpers = require('./helpers');

const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
const DxDaoSchemeConstraints = artifacts.require("./DxDaoSchemeConstraints.sol");
const SimpleSchemeConstraints = artifacts.require("./SimpleSchemeConstraints.sol");
const Redeemer = artifacts.require("./Redeemer.sol");

class GenericSchemeParams {
  constructor() {
  }
}

const DXDAO_SCHEME_CONSTRAINT = 1;
const SIMPLE_SCHEME_CONSTRAINT = 2;


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
                              useSchemeConstraint = DXDAO_SCHEME_CONSTRAINT,
                              enableSendEth = true) {
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
   if (useSchemeConstraint === DXDAO_SCHEME_CONSTRAINT) {
      testSetup.schemeConstraints = await DxDaoSchemeConstraints.new();
      schemeConstraintsAddress = testSetup.schemeConstraints.address;
      //use accounts[4] as the avatar.
      await testSetup.schemeConstraints.initialize(accounts[4],
                                                   100000,
                                                   100000,
                                                   [tokenAddress],
                                                   [1000],
                                                   contractsWhiteList,
                                                   testSetup.genericSchemeMultiCall.address);
    } else if (useSchemeConstraint === SIMPLE_SCHEME_CONSTRAINT) {
      testSetup.schemeConstraints = await SimpleSchemeConstraints.new();
      schemeConstraintsAddress = testSetup.schemeConstraints.address;
      //use accounts[4] as the avatar.
      await testSetup.schemeConstraints.initialize(contractsWhiteList,"descriptionHash",enableSendEth);
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

    it("propose call - not whitelisted contract", async function() {
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

    it("propose call siplmeConstraint -positive decision - not whitelisted contract", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[],0,false,helpers.NULL_ADDRESS,SIMPLE_SCHEME_CONSTRAINT, false);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       try {
         await testSetup.genericSchemeMultiCall.proposeCalls(
        [accounts[1]],[callData],[1],helpers.NULL_HASH);
         assert(false, "contractToCall is not whitelisted");
       } catch(error) {
         helpers.assertVMException(error);
       }
        await testSetup.genericSchemeMultiCall.proposeCalls(
        [accounts[1]],[callData],[0],helpers.NULL_HASH);

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

    it("execute proposeVote -positive decision - check action - with GenesisProtocol - with simpleSchemeConstraints", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,SIMPLE_SCHEME_CONSTRAINT);
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
    });

    it("execute proposeVote -positive decision - check action - with simpleSchemeConstraints disableSendEth", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,SIMPLE_SCHEME_CONSTRAINT,false);
       var value = 50000;
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       try {
         await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[value,value],helpers.NULL_HASH);
         assert(false, "sendEth is not allowed");
       } catch(error) {
         helpers.assertVMException(error);
       }
       var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[0,0],helpers.NULL_HASH);
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
        assert.equal(await web3.eth.getBalance(actionMock.address),0);
    });

    it("execute proposeVote -positive decision - check action - with simpleSchemeConstraints disableSendEth and no whitelist", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address,SIMPLE_SCHEME_CONSTRAINT,false);
      var value = 50000;
      var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
        await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[value,value],helpers.NULL_HASH);
        assert(false, "sendEth is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,actionMock.address],[callData,callData],[0,0],helpers.NULL_HASH);
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
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
   });

    it("redeemer should fail if not executed from votingMachine", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
      const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var redeemer = await Redeemer.new();
      var redeemRewards = await redeemer.redeemGenericSchemeMultiCall.call(
        testSetup.genericSchemeMultiCall.address,
        testSetup.genericSchemeParams.votingMachine.genesisProtocol.address,
        proposalId,
        accounts[0]);
      assert.equal(redeemRewards[0][1],0); //redeemRewards[0] gpRewards
      assert.equal(redeemRewards[0][2],0);
      assert.equal(redeemRewards.executed,false);
      assert.equal(redeemRewards.winningVote,0); // Cannot redeem, so will not get the winning vote
      tx = await redeemer.redeemGenericSchemeMultiCall(
        testSetup.genericSchemeMultiCall.address,
        testSetup.genericSchemeParams.votingMachine.genesisProtocol.address,
        proposalId,
        accounts[0]);
      await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecuted', {
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events.length,0);
     });
   });

    it("execute proposeVote -positive decision - execute with redeemer", async function() {
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
      var redeemer = await Redeemer.new();
      var redeemRewards = await redeemer.redeemGenericSchemeMultiCall.call(
        testSetup.genericSchemeMultiCall.address,
        testSetup.genericSchemeParams.votingMachine.genesisProtocol.address,
        proposalId,
        accounts[0]);
      assert.equal(redeemRewards[0][1],0); //redeemRewards[0] gpRewards
      assert.equal(redeemRewards[0][2],60);
      assert.equal(redeemRewards.executed,false); // GP already executed by vote
      assert.equal(redeemRewards.winningVote,1);
      tx = await redeemer.redeemGenericSchemeMultiCall(
        testSetup.genericSchemeMultiCall.address,
        testSetup.genericSchemeParams.votingMachine.genesisProtocol.address,
        proposalId,
        accounts[0]);
      await testSetup.genericSchemeMultiCall.getPastEvents('ProposalExecuted', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"ProposalExecuted");
            assert.equal(events[0].args._proposalId,proposalId);
       });
       assert.equal(await web3.eth.getBalance(actionMock.address),value*2);
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
      var testSetup = await setup(accounts,[standardTokenMock.address,accounts[3]],0,true,standardTokenMock.address);
      var encodedTokenApproval = await createCallToTokenApproval(standardTokenMock,accounts[3], 10001);
      var tx = await testSetup.genericSchemeMultiCall.proposeCalls([standardTokenMock.address],[encodedTokenApproval],[0],helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      try {
         await testSetup.genericSchemeMultiCall.execute(proposalId);
         assert(false, "periodSpendingTokensExceeded");
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
      var testSetup = await setup(accounts,[actionMock.address,accounts[3],standardTokenMock.address],0,true,standardTokenMock.address);
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

    it("cannot init with invalid avatar address", async function() {
      var genericSchemeMultiCallInitAvatar = await GenericSchemeMultiCall.new();
      try {
        await genericSchemeMultiCallInitAvatar.initialize(
          helpers.NULL_ADDRESS,
          accounts[0],
          helpers.SOME_HASH,
          accounts[0]
        );
        assert(false, "avatar cannot be zero");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });


    it("can init with multiple contracts on whitelist", async function() {
        var actionMock =await ActionMock.new();
        var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
        var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
        var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
        try {
        await dxDaoSchemeConstraints.initialize(
              testSetup.org.avatar.address,
              1,
              0,
              [],
              [],
              [accounts[0],accounts[1],accounts[2],accounts[3]],
              helpers.NULL_ADDRESS
        );
        assert(false, "cannot init with zero genericSchemeMultiCall");
      } catch(error) {
        helpers.assertVMException(error);
      }

        await dxDaoSchemeConstraints.initialize(
              testSetup.org.avatar.address,
              1,
              0,
              [],
              [],
              [accounts[0],accounts[1],accounts[2],accounts[3]],
              testSetup.genericSchemeMultiCall.address
        );
        var contractsWhiteList = await dxDaoSchemeConstraints.getContractsWhiteList();
        assert.equal(contractsWhiteList[0],accounts[0]);
        assert.equal(contractsWhiteList[1],accounts[1]);
        assert.equal(contractsWhiteList[2],accounts[2]);
        assert.equal(contractsWhiteList[3],accounts[3]);

    });

    it("init SIMPLE_SCHEME_CONSTRAINT", async function() {
        var simpleSchemeConstraints =await SimpleSchemeConstraints.new();
        await simpleSchemeConstraints.initialize(
              [accounts[0],accounts[1],accounts[2],accounts[3]],
              "descriptionHash",
              true
        );
        var contractsWhiteList = await simpleSchemeConstraints.getContractsWhiteList();
        assert.equal(contractsWhiteList[0],accounts[0]);
        assert.equal(contractsWhiteList[1],accounts[1]);
        assert.equal(contractsWhiteList[2],accounts[2]);
        assert.equal(contractsWhiteList[3],accounts[3]);

        assert.equal(await simpleSchemeConstraints.descriptionHash(),"descriptionHash");

        try {
          await simpleSchemeConstraints.isAllowedToPropose(
              [accounts[4]],[],[],helpers.NULL_ADDRESS
          );
          assert(false, "cannot propose to call to non white list contract");
        } catch(error) {
          helpers.assertVMException(error);
        }
        await simpleSchemeConstraints.isAllowedToPropose(
            [accounts[3]],[],[],helpers.NULL_ADDRESS
        );

        try {
          await simpleSchemeConstraints.isAllowedToCall(
              [accounts[4]],[],[],helpers.NULL_ADDRESS
          );
          assert(false, "cannot propose to call to non white list contract");
        } catch(error) {
          helpers.assertVMException(error);
        }
        await simpleSchemeConstraints.isAllowedToCall(
            [accounts[3]],[],[],helpers.NULL_ADDRESS
        );


    });


    it("cannot initialize contraints with zero period", async function() {
      var dxDaoSchemeConstraintsInit =await DxDaoSchemeConstraints.new();
      try {
        await dxDaoSchemeConstraintsInit.initialize(
          accounts[0],
          0,
          0,
          [],
          [],
          [accounts[0]],
          accounts[0]

        );
        assert(false, "preriod size should be greater than 0");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot initialize contraints with invalid array length", async function() {
      var dxDaoSchemeConstraintsArray = await DxDaoSchemeConstraints.new();
      try {
        await dxDaoSchemeConstraintsArray.initialize(
          accounts[0],
          1,
          0,
          [accounts[0]],
          [100,100],
          [accounts[0]],
          accounts[0]
        );
        assert(false, "invalid length _periodLimitTokensAddresses");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("cannot initialize contraints twice", async function() {
      var dxDaoSchemeConstraintsDouble=await DxDaoSchemeConstraints.new();
      await dxDaoSchemeConstraintsDouble.initialize(
        accounts[0],
        3,
        0,
        [],
        [],
        [accounts[0]],
        accounts[0]
      );
      try {
        await dxDaoSchemeConstraintsDouble.initialize(
          accounts[0],
          3,
          0,
          [],
          [],
          [accounts[0]],
          accounts[0]
        );
        assert(false, "cannot initialize twice");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });


    it("cannot initialize SIMPLE_SCHEME_CONSTRAINT twice", async function() {
      var simpleSchemeConstraints=await SimpleSchemeConstraints.new();
      await simpleSchemeConstraints.initialize(
        [accounts[0]],
        "descriptionHash",
        true
      );
      try {
        await simpleSchemeConstraints.initialize(
          [accounts[1]],
          "descriptionHash",
          true
        );
        assert(false, "cannot initialize twice");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("execute proposeVote with multiple calls with votingMachine without whitelisted token", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[],0,true,standardTokenMock.address);
      var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
         await testSetup.genericSchemeMultiCall.proposeCalls(
           [actionMock.address],
           [callData1,encodedTokenApproval],
           [0,0],
           helpers.NULL_HASH);
         assert(false, "contract not whitelisted");
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
           [actionMock.address,actionMock.address],
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

    it("can only update contraint whitelist & limits from avatar", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
      var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
      await dxDaoSchemeConstraints.initialize(
            testSetup.org.avatar.address,
            1,
            0,
            [],
            [],
            [accounts[0]],
            testSetup.genericSchemeMultiCall.address
      );
      try {
        await dxDaoSchemeConstraints.updateContractsWhitelist([actionMock.address],[true]);
        assert(false, "caller must be avatar");
      } catch(error) {
        helpers.assertVMException(error);
      }

      try {
        await dxDaoSchemeConstraints.updatePeriodLimitsTokens([actionMock.address, standardTokenMock.address],[5000,6000]);
        assert(false, "caller must be avatar");
      } catch(error) {
        helpers.assertVMException(error);
      }

      try {
        await dxDaoSchemeConstraints.updatePeriodLimitWei(5000);
        assert(false, "caller must be avatar");
      } catch(error) {
        helpers.assertVMException(error);
      }

      dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
      await dxDaoSchemeConstraints.initialize(
            accounts[3],
            1,
            0,
            [],
            [],
            [accounts[0]],
            testSetup.genericSchemeMultiCall.address
      );
      await dxDaoSchemeConstraints.updatePeriodLimitWei(10000,{from:accounts[3]});
      await dxDaoSchemeConstraints.getPastEvents('UpdatedPeriodLimitWei', {
        fromBlock: 0,
        toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"UpdatedPeriodLimitWei");
            assert.equal(events[0].args._periodLimitWei,10000);
      });

      await dxDaoSchemeConstraints.updatePeriodLimitsTokens([standardTokenMock.address],[10000],{from:accounts[3]});
      await dxDaoSchemeConstraints.getPastEvents('UpdatedPeriodLimitsTokens', {
        fromBlock: 0,
        toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"UpdatedPeriodLimitsTokens");
            assert.equal(events[0].args._tokensAddresses[0],standardTokenMock.address);
            assert.equal(events[0].args._tokensPeriodLimits[0],10000);
      });

      await dxDaoSchemeConstraints.updateContractsWhitelist([standardTokenMock.address],[true],{from:accounts[3]});
      await dxDaoSchemeConstraints.getPastEvents('UpdatedContractsWhitelist', {
        fromBlock: 0,
        toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"UpdatedContractsWhitelist");
            assert.equal(events[0].args._contractsAddresses[0],standardTokenMock.address);
            assert.equal(events[0].args._contractsWhitelisted[0],true);
      });

      try {
        await dxDaoSchemeConstraints.updateContractsWhitelist([standardTokenMock.address],[true, false],{from:accounts[3]});
        assert(false, "invalid length _periodLimitTokensAddresses");
      } catch(error) {
        helpers.assertVMException(error);
      }

      try {
        await dxDaoSchemeConstraints.updatePeriodLimitsTokens([standardTokenMock.address],[10000, 500],{from:accounts[3]});
        assert(false, "invalid length _tokensPeriodLimits");
      } catch(error) {
        helpers.assertVMException(error);
      }

  });

  it("update contraints whitelist after proposal call and before execute and check spender", async function() {
    var actionMock =await ActionMock.new();
    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
    var testSetup = await setup(accounts,[actionMock.address,accounts[3],standardTokenMock.address],0,true,standardTokenMock.address);
    var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
    var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);

    var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,standardTokenMock.address],
                                                                  [callData1,encodedTokenApproval],
                                                                  [0,0],
                                                                  helpers.NULL_HASH);

    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    await testSetup.schemeConstraints.updateContractsWhitelist([accounts[3]],[false],{from:accounts[4]});

    await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

    try {
      await testSetup.genericSchemeMultiCall.execute(proposalId);
      assert(false, "contract was blacklisted");
    } catch(error) {
      helpers.assertVMException(error);
    }
    await testSetup.schemeConstraints.updateContractsWhitelist([accounts[3]],[true],{from:accounts[4]});
    await testSetup.genericSchemeMultiCall.execute(proposalId);
  });

  it("update contraints whitelist after proposal call and before execute", async function() {
    var actionMock =await ActionMock.new();
    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
    var testSetup = await setup(accounts,[actionMock.address,accounts[3],standardTokenMock.address],0,true,standardTokenMock.address);
    var encodedTokenApproval= await createCallToTokenApproval(standardTokenMock, accounts[3], 1000);
    var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);

    var tx = await testSetup.genericSchemeMultiCall.proposeCalls([actionMock.address,standardTokenMock.address],
                                                                  [callData1,encodedTokenApproval],
                                                                  [0,0],
                                                                  helpers.NULL_HASH);

    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

    await testSetup.schemeConstraints.updateContractsWhitelist([actionMock.address],[false],{from:accounts[4]});
    await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

    try {
      await testSetup.genericSchemeMultiCall.execute(proposalId);
      assert(false, "contract was blacklisted");
    } catch(error) {
      helpers.assertVMException(error);
    }
    await testSetup.schemeConstraints.updateContractsWhitelist([actionMock.address],[true],{from:accounts[4]});
    await testSetup.genericSchemeMultiCall.execute(proposalId);
  });


  it("can only update contraint whitelist & limits from avatar with correct array length", async function() {
    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
    var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();
    try {
      await dxDaoSchemeConstraints.updateContractsWhitelist([standardTokenMock.address],[true, false],{from:accounts[3]});
      assert(false, "invalid length _periodLimitTokensAddresses");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await dxDaoSchemeConstraints.updatePeriodLimitsTokens([standardTokenMock.address],[10000, 500],{from:accounts[3]});
      assert(false, "invalid length _tokensPeriodLimits");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("calculates the observationIndex correctly", async function() {
    var actionMock =await ActionMock.new();
    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
    var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
    var dxDaoSchemeConstraints =await DxDaoSchemeConstraints.new();

    // 10 seconds period
    await dxDaoSchemeConstraints.initialize(
          testSetup.org.avatar.address,
          10,
          0,
          [],
          [],
          [accounts[0]],
          testSetup.genericSchemeMultiCall.address
    );
    assert.equal((await dxDaoSchemeConstraints.observationIndex()).toString(),0);
    await helpers.increaseTime(10);
    assert.equal((await dxDaoSchemeConstraints.observationIndex()).toString(),1);
    await helpers.increaseTime(3600); // adding 1 hour
    assert.equal((await dxDaoSchemeConstraints.observationIndex()).toString(),361);
    await helpers.increaseTime(86400); // adding 1 day
    assert.equal((await dxDaoSchemeConstraints.observationIndex()).toString(),9001);
    await helpers.increaseTime(315360000);// adding 10 year
    assert.equal((await dxDaoSchemeConstraints.observationIndex()).toString(),31545001);
    var dxDaoSchemeConstraints2 =await DxDaoSchemeConstraints.new();

    // 7 days period
    await dxDaoSchemeConstraints2.initialize(
          testSetup.org.avatar.address,
          604800,
          0,
          [],
          [],
          [accounts[0]],
          testSetup.genericSchemeMultiCall.address
    );
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),0);
    await helpers.increaseTime(50);
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),0);
    await helpers.increaseTime(604750);
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),1);
    await helpers.increaseTime(604800); // adding 7 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),2);
    await helpers.increaseTime(604800); // adding 7 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),3);
    await helpers.increaseTime(604800); // adding 7 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),4);
    await helpers.increaseTime(604800); // adding 7 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),5);
    await helpers.increaseTime(9072000); // adding 15 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),20);
    await helpers.increaseTime(6048000); // adding 10 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),30);
    await helpers.increaseTime(42336000); // adding 70 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),100);
    await helpers.increaseTime(604800000); // adding 1000 days
    assert.equal((await dxDaoSchemeConstraints2.observationIndex()).toString(),1100);
  });

  it("only genericSchemeMultiCall allow to call isAllowedToCall", async function() {
    var actionMock =await ActionMock.new();
    var testSetup = await setup(accounts,[actionMock.address]);
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();

    try {
      await testSetup.schemeConstraints.isAllowedToCall(
        [actionMock.address],
        [encodeABI],
        [1],
        accounts[4]);
        assert(false, "only genericSchemeMultiCall allow to call isAllowedToCall");
    } catch(error) {
     helpers.assertVMException(error);
    }
  });

});
