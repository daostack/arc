import * as helpers from './helpers';
const constants = require('./constants');
const Controller = artifacts.require("./Controller.sol");
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");



export class UpgradeSchemeParams {
  constructor() {
  }
}

const setupUpgradeSchemeParams = async function(
                                            upgradeScheme,
                                            ) {
  var upgradeSchemeParams = new UpgradeSchemeParams();
  upgradeSchemeParams.votingMachine = await helpers.setupAbsoluteVote();
  await upgradeScheme.setParameters(upgradeSchemeParams.votingMachine.params,upgradeSchemeParams.votingMachine.absoluteVote.address);
  upgradeSchemeParams.paramsHash = await upgradeScheme.getParametersHash(upgradeSchemeParams.votingMachine.params,upgradeSchemeParams.votingMachine.absoluteVote.address);
  return upgradeSchemeParams;
};


const setupNewController = async function (permission='0x00000000') {
  var accounts = web3.eth.accounts;
  var token  = await DAOToken.new("TEST","TST");
  // set up a reputation system
  var reputation = await Reputation.new();
  var avatar = await Avatar.new('name', token.address, reputation.address);
  var _controller;
  if (permission !== '0'){
    _controller = await Controller.new(avatar.address,{from:accounts[1]});
    await _controller.registerScheme(accounts[0],0,permission,avatar.address,{from:accounts[1]});
    await _controller.unregisterSelf(avatar.address,{from:accounts[1]});
  }
  else {
    _controller = await Controller.new(avatar.address);
  }
  return _controller;
};


const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.upgradeScheme = await UpgradeScheme.new();
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.upgradeSchemeParams= await setupUpgradeSchemeParams(testSetup.upgradeScheme);

   var permissions = "0x0000000a";

   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.upgradeScheme.address],[testSetup.upgradeSchemeParams.paramsHash],[permissions]);

   return testSetup;
};

contract('UpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });

   it("setParameters", async function() {
     var upgradeScheme = await UpgradeScheme.new();
     var absoluteVote = await AbsoluteVote.new();
     await upgradeScheme.setParameters("0x1234",absoluteVote.address);
     var paramHash = await upgradeScheme.getParametersHash("0x1234",absoluteVote.address);
     var parameters = await upgradeScheme.parameters(paramHash);
     assert.equal(parameters[1],absoluteVote.address);
     });


     it("proposeUpgrade log", async function() {
       var testSetup = await setup(accounts);

       var newController = await setupNewController();
       var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewUpgradeProposal");
       var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
       assert.equal(votingMachine,testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address);
      });

       it("proposeUpgrade check owner vote", async function() {
         var testSetup = await setup(accounts);

         var newController = await setupNewController();
         var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await helpers.checkVoteInfo(testSetup.upgradeSchemeParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.upgradeSchemeParams.votingMachine.reputationArray[0]]);
        });

        it("proposeChangeUpgradingScheme log", async function() {
          var testSetup = await setup(accounts);

          var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0");
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ChangeUpgradeSchemeProposal");
          var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
          assert.equal(votingMachine,testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address);
         });


          it("proposeChangeUpgradingScheme check owner vote", async function() {
            var testSetup = await setup(accounts);

            var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2");
            var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            await helpers.checkVoteInfo(testSetup.upgradeSchemeParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.upgradeSchemeParams.votingMachine.reputationArray[0]]);
           });

           it("execute proposal upgrade controller -yes - proposal data delete", async function() {
             var testSetup = await setup(accounts);

             var newController = await setupNewController();
             assert.notEqual(newController.address,await testSetup.org.avatar.owner());
             var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
             //Vote with reputation to trigger execution
             var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
             //check organizationsProposals before execution
             var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
             assert.equal(organizationsProposals[0],newController.address);//new contract address
             assert.equal(organizationsProposals[2].toNumber(),1);//proposalType
             await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
             assert.equal(newController.address,await testSetup.org.avatar.owner());
             //check organizationsProposals after execution
             organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
             assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
             assert.equal(organizationsProposals[2],0);//proposalType
            });

            it("execute proposal upgrade controller - no decision (same for update scheme) - proposal data delete", async function() {
              var testSetup = await setup(accounts);

              var newController = await setupNewController();
              var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
              var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
              //check organizationsProposals before execution
              var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsProposals[0],newController.address);//new contract address
              assert.equal(organizationsProposals[2].toNumber(),1);//proposalType

              //Vote with reputation to trigger execution
              await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
              //should not upgrade because the decision is "no"
              assert.notEqual(newController.address,await testSetup.org.avatar.owner());
              //check organizationsProposals after execution
              organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
              assert.equal(organizationsProposals[2],0);//proposalType
             });

             it("execute proposal ChangeUpgradingScheme - yes decision - proposal data delete", async function() {
               var testSetup = await setup(accounts);


               var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2");
               //Vote with reputation to trigger execution
               var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

               //check organizationsProposals before execution
               var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationsProposals[0],accounts[0]);//new contract address
               assert.equal(organizationsProposals[2].toNumber(),2);//proposalType

               //check schemes registration before execution
               var controller = await Controller.at(await testSetup.org.avatar.owner());
               assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),false);
               assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),true);

               await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

               //check organizationsProposals after execution
               organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
               assert.equal(organizationsProposals[2],0);//proposalType

               //check if scheme upgraded
               assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
               assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),false);
              });

              it("execute proposal ChangeUpgradingScheme - yes decision - check approve increase fee ", async function() {
                var testSetup = await setup(accounts);


                var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2");
                //Vote with reputation to trigger execution
                var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

                //check organizationsProposals before execution
                var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                assert.equal(organizationsProposals[0],accounts[0]);//new contract address
                assert.equal(organizationsProposals[2].toNumber(),2);//proposalType

                //check schemes registration before execution
                var controller = await Controller.at(await testSetup.org.avatar.owner());
                assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),false);
                assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),true);

                await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

                //check organizationsProposals after execution
                organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
                assert.equal(organizationsProposals[2],0);//proposalType

                //check if scheme upgraded
                assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
                assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),false);
               });

               it("execute proposal ChangeUpgradingScheme - yes decision - check upgrade it self. ", async function() {
                 var testSetup = await setup(accounts);


                 var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,testSetup.upgradeScheme.address,"0x2");
                 //Vote with reputation to trigger execution
                 var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

                 //check schemes registration before execution
                 var controller = await Controller.at(await testSetup.org.avatar.owner());
                 assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),true);

                 await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

                 //check organizationsProposals after execution
                 var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                 assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
                 assert.equal(organizationsProposals[2],0);//proposalType

                 //schemes should still be registered
                 assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address,testSetup.org.avatar.address),true);
                });
});
