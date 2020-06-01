import * as helpers from './helpers';
const constants = require('./constants');
const WalletScheme = artifacts.require('./WalletScheme.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
const Wallet = artifacts.require("./Wallet.sol");

export class WalletSchemeParams {
  constructor() {
  }
}

const setupWalletSchemeParams = async function(
                                            walletScheme,
                                            accounts,
                                            contractToCall,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar,
                                            controller
                                            ) {
  var walletSchemeParams = new WalletSchemeParams();
  if (genesisProtocol === true){
      walletSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,0,helpers.NULL_ADDRESS);
      await walletScheme.initialize(
            avatar.address,
            controller.address,
            walletSchemeParams.votingMachine.genesisProtocol.address,
            walletSchemeParams.votingMachine.params,
      );
    }
  else {
      walletSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,walletScheme.address);
      await walletScheme.initialize(
            avatar.address,
            controller.address,
            walletSchemeParams.votingMachine.absoluteVote.address,
            walletSchemeParams.votingMachine.params,
      );
  }
  return walletSchemeParams;
};

const setup = async function (accounts,contractToCall = 0,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.walletScheme = await WalletScheme.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,10,70];

   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }
   testSetup.walletSchemeParams= await setupWalletSchemeParams(
     testSetup.walletScheme,accounts,contractToCall,genesisProtocol,tokenAddress,testSetup.org.avatar,controllerCreator
   );
   var permissions = "0x00000010";

   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.walletScheme.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");

   return testSetup;
};

const createCallToActionMock = async function(_sender,_actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods.test2(_sender).encodeABI();
};

contract('WalletScheme', function(accounts) {

    it("proposeCalls log", async function() {

       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var callData = await createCallToActionMock(testSetup.walletScheme.address,actionMock);

       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewCallProposal");
    });

    it("execute proposeCalls -no decision - proposal data delete", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var callData = await createCallToActionMock(testSetup.walletScheme.address,actionMock);
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.walletSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
       assert.equal(organizationProposal.passed,false);
       assert.equal(organizationProposal.callData[0],null);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,actionMock.address);
        var callData = await createCallToActionMock(testSetup.walletScheme.address,actionMock);
        var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
        assert.equal(organizationProposal[1][0],callData,helpers.NULL_HASH);
        await testSetup.walletSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
        assert.equal(organizationProposal.callData[0],null);//new contract address
     });

    it("execute proposeVote -positive decision - destination reverts", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.walletSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //actionMock revert because msg.sender is not the _addr param at actionMock thpugh the generic scheme not .
       var organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
       assert.equal(organizationProposal.exist,true);//new contract address
       assert.equal(organizationProposal.passed,true);//new contract address
       //can call execute
       await testSetup.walletScheme.execute( proposalId);
    });


    it("execute proposeVote -positive decision - destination reverts and then active", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var activationTime = (await web3.eth.getBlock("latest")).timestamp + 1000;
       await actionMock.setActivationTime(activationTime);
       var callData = await new web3.eth.Contract(actionMock.abi).methods.test3().encodeABI();
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.walletSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //actionMock revert because msg.sender is not the _addr param at actionMock thpugh the generic scheme not .
       var organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
       assert.equal(organizationProposal.exist,true);//new contract address
       assert.equal(organizationProposal.passed,true);//new contract address
       //can call execute
       await testSetup.walletScheme.execute( proposalId);
       await helpers.increaseTime(1001);
       await testSetup.walletScheme.execute( proposalId);

       organizationProposal = await testSetup.walletScheme.getOrganizationProposal(proposalId);
       assert.equal(organizationProposal.exist,false);//new contract address
       assert.equal(organizationProposal.passed,false);//new contract address
       try {
         await testSetup.walletScheme.execute( proposalId);
         assert(false, "cannot call execute after it been executed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote without return value-positive decision - check action", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.walletSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

    });

    it("execute should fail if not executed from votingMachine", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[encodeABI],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       try {
         await testSetup.walletScheme.execute( proposalId);
         assert(false, "execute should fail if not executed from votingMachine");
       } catch(error) {
         helpers.assertVMException(error);
       }

    });

    it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,actionMock.address,0,true,standardTokenMock.address);
       var value = 123;
       var callData = await createCallToActionMock(testSetup.walletScheme.address,actionMock);
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[value],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //transfer some eth to avatar
       await web3.eth.sendTransaction({from:accounts[0],to:testSetup.walletScheme.address, value: web3.utils.toWei('1', "ether")});
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
       tx  = await testSetup.walletSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.walletScheme.getPastEvents('ProposalExecutedByVotingMachine', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
             assert.equal(events[0].args._param,1);
        });
        assert.equal(await web3.eth.getBalance(actionMock.address),value);
    });

    it("execute proposeVote -negative decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,actionMock.address,0,true,standardTokenMock.address);

       var callData = await createCallToActionMock(testSetup.walletScheme.address,actionMock);
       var tx = await testSetup.walletScheme.proposeCalls([actionMock.address],[callData],[0],helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx  = await testSetup.walletSchemeParams.votingMachine.genesisProtocol.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.walletScheme.getPastEvents('ProposalExecutedByVotingMachine', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
             assert.equal(events[0].args._param,2);
        });
      });

      it("Wallet - execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
         var wallet =await Wallet.new();
         await web3.eth.sendTransaction({from:accounts[0],to:wallet.address, value: web3.utils.toWei('1', "ether")});
         var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
         var testSetup = await setup(accounts,wallet.address,0,true,standardTokenMock.address);
         var callData = await new web3.eth.Contract(wallet.abi).methods.pay(accounts[1]).encodeABI();
         var tx = await testSetup.walletScheme.proposeCalls([wallet.address],[callData],[0],helpers.NULL_HASH);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
         assert.equal(await web3.eth.getBalance(wallet.address),web3.utils.toWei('1', "ether"));
         await testSetup.walletSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         assert.equal(await web3.eth.getBalance(wallet.address),web3.utils.toWei('1', "ether"));
         await wallet.transferOwnership(testSetup.walletScheme.address);
         await testSetup.walletScheme.execute(proposalId);
         assert.equal(await web3.eth.getBalance(wallet.address),0);
      });

      it("cannot init twice", async function() {
         var actionMock =await ActionMock.new();
         var testSetup = await setup(accounts,actionMock.address);

         try {
           await testSetup.walletScheme.initialize(
             testSetup.org.avatar.address,
             testSetup.daoCreator.address,
             accounts[0],
             accounts[0]
           );
           assert(false, "cannot init twice");
         } catch(error) {
           helpers.assertVMException(error);
         }

      });

});
