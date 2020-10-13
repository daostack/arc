import * as helpers from './helpers';

const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");

export class GenericSchemeParams {
  constructor() {
  }
}

const setupGenericSchemeParams = async function(
                                            genericScheme,
                                            accounts,
                                            contractWhitelist,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar
                                            ) {
  var genericSchemeParams = new GenericSchemeParams();
  if (genesisProtocol === true){
      genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,0,helpers.NULL_ADDRESS);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.genesisProtocol.address,
            genericSchemeParams.votingMachine.params,
            contractWhitelist);
    }
  else {
      genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,genericScheme.address);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.absoluteVote.address,
            genericSchemeParams.votingMachine.params,
            contractWhitelist);
  }
  return genericSchemeParams;
};

const setup = async function (accounts,contractsWhitelist,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.GenericSchemeMultiCall = await GenericSchemeMultiCall.new();
   var controllerCreator = await ControllerCreator.new();
   var daoTracker = await DAOTracker.new();
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address);
   testSetup.reputationArray = [20,10,70];
   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }
   testSetup.genericSchemeParams= await setupGenericSchemeParams(testSetup.GenericSchemeMultiCall,accounts,contractsWhitelist,genesisProtocol,tokenAddress,testSetup.org.avatar);
   var permissions = "0x00000010";


   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.GenericSchemeMultiCall.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");

   return testSetup;
};

const createCallToActionMock = async function(_avatar,_actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods.test2(_avatar).encodeABI();
};

contract('GenericSchemeMultiCall', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("proposeCall log", async function() {
      var actionMock =await ActionMock.new();
      var testSetup = await setup(accounts,[actionMock.address]);
      var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
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
        await testSetup.GenericSchemeMultiCall.proposeCalls(
            [actionMock.address,actionMock.address],[callData],[0],helpers.NULL_HASH);
         assert(false, "Wrong length of _contractsToCall, _callsDataLens or _value arrays");
       } catch(error) {
         helpers.assertVMException(error);
       }
       try {
        await testSetup.GenericSchemeMultiCall.proposeCalls(
            [actionMock.address,actionMock.address],[callData],[0],helpers.NULL_HASH);
         assert(false, "Wrong length of _contractsToCall, _callsDataLens or _value arrays");
       } catch(error) {
         helpers.assertVMException(error);
       }
       try {
        await testSetup.GenericSchemeMultiCall.proposeCalls(
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
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
       assert.equal(proposal.passed,false);
       assert.equal(proposal.callData,null);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
        var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
          [actionMock.address],[callData],[0],helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
        await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
        assert.equal(proposal.callData,null);//new contract address
     });

    it("execute proposeVote -positive decision - destination reverts", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //actionMock revert because msg.sender is not the _addr param at actionMock though the whole proposal execution will fail.
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       try {
         await testSetup.GenericSchemeMultiCall.execute(proposalId);
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
         await testSetup.GenericSchemeMultiCall.proposeCalls(
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
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    });

    it("execute should fail if not executed from votingMachine", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,[actionMock.address]);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       try {
         await testSetup.GenericSchemeMultiCall.execute( proposalId);
         assert(false, "execute should fail if not executed from votingMachine");
       } catch(error) {
         helpers.assertVMException(error);
       }

    });

    it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
       var value = 123;
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls([actionMock.address],[callData],[value],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //transfer some eth to avatar
       await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value: web3.utils.toWei('1', "ether")});
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
       await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       tx = await testSetup.GenericSchemeMultiCall.execute(proposalId);
       await testSetup.GenericSchemeMultiCall.getPastEvents('ProposalExecuted', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecuted");
             assert.equal(events[0].args._proposalId,proposalId);
        });
        assert.equal(await web3.eth.getBalance(actionMock.address),value);
    });

    it("execute proposeVote -negative decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);

       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.GenericSchemeMultiCall.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx  = await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.GenericSchemeMultiCall.getPastEvents('ProposalExecutedByVotingMachine', {
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
      var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address,actionMock2.address],
        [callData1,callData2],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      tx  = await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.GenericSchemeMultiCall.getPastEvents('ProposalExecutedByVotingMachine', {
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
      var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address,actionMock2.address],
        [callData1,callData2],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
      assert.equal(proposal.exist,true);
      assert.equal(proposal.passed,false);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      try {
         await testSetup.GenericSchemeMultiCall.execute(proposalId);
         assert(false, "Proposal call failed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote with multiple calls with votingMachine without whitelisted spender -negative decision", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address],0,true,standardTokenMock.address);
      var avatarInst = await new web3.eth.Contract(testSetup.org.avatar.abi,testSetup.org.avatar.address);
      var controllerAddr = await avatarInst.methods.owner().call();
      var encodedTokenApproval= await web3.eth.abi.encodeParameters(['address','address', 'uint256'], [standardTokenMock.address, accounts[3], 1000]);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      try {
         await testSetup.GenericSchemeMultiCall.proposeCalls(
           [actionMock.address,controllerAddr],
           [callData1,encodedTokenApproval],
           [0,0],
           helpers.NULL_HASH);
         assert(false, "spender contract not whitelisted");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote with multiple calls with votingMachine -positive decision", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address,accounts[3]],0,true,standardTokenMock.address);
      var avatarInst = await new web3.eth.Contract(testSetup.org.avatar.abi,testSetup.org.avatar.address);
      var controllerAddr = await avatarInst.methods.owner().call();
      var encodedTokenApproval= await web3.eth.abi.encodeParameters(['address','address', 'uint256'], [standardTokenMock.address, accounts[3], 1000]);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address,controllerAddr],
        [callData1,encodedTokenApproval],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
      assert.equal(proposal.exist,true);
      assert.equal(proposal.passed,false);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.GenericSchemeMultiCall.execute(proposalId);
      await testSetup.GenericSchemeMultiCall.getPastEvents('ProposalCallExecuted', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"ProposalCallExecuted");
            assert.equal(events[0].args._proposalId,proposalId);
            assert.equal(events[1].event,"ProposalCallExecuted");
            assert.equal(events[1].args._proposalId,proposalId);
      });
    });

    it("cannot init without contract whitelist", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var genericSchemeMultiCall =await GenericSchemeMultiCall.new();

        try {
          await genericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            accounts[0],
            helpers.SOME_HASH,
            []
          );
          assert(false, "contractWhitelist cannot be empty");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("cannot init twice", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        try {
          await testSetup.GenericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            accounts[0],
            helpers.SOME_HASH,
            [accounts[0]]
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("can init with multiple contracts on whitelist", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var genericSchemeMultiCall =await GenericSchemeMultiCall.new();
        await genericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            accounts[0],
            helpers.SOME_HASH,
            [accounts[0],accounts[1],accounts[2],accounts[3]]
        );
        assert.equal(await genericSchemeMultiCall.whitelistedContracts(1),accounts[0]);
        assert.equal(await genericSchemeMultiCall.whitelistedContracts(2),accounts[1]);
        assert.equal(await genericSchemeMultiCall.whitelistedContracts(3),accounts[2]);
        assert.equal(await genericSchemeMultiCall.whitelistedContracts(4),accounts[3]);
    });

});
