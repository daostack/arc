import * as helpers from './helpers';
const Controller = artifacts.require("./Controller.sol");
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");


class VotingMachine {
  constructor() {
  }
}

class UpgradeSchemeParams {
  constructor() {
  }
}

class TestSetup {
  constructor() {
  }
}

const checkVoteInfo = async function(absoluteVote,proposalId, voterAddress, _voteInfo) {
  let voteInfo;
  voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
  // voteInfo has the following structure
  // int vote;
  assert.equal(voteInfo[0], _voteInfo[0]);
  // uint reputation;
  assert.equal(voteInfo[1], _voteInfo[1]);
};

const setupUpgradeSchemeParams = async function(
                                            upgradeScheme,
                                            ) {
  var upgradeSchemeParams = new UpgradeSchemeParams();
  upgradeSchemeParams.votingMachine = await setupAbsoluteVote();
  await upgradeScheme.setParameters(upgradeSchemeParams.votingMachine.params,upgradeSchemeParams.votingMachine.absoluteVote.address);
  upgradeSchemeParams.paramsHash = await upgradeScheme.getParametersHash(upgradeSchemeParams.votingMachine.params,upgradeSchemeParams.votingMachine.absoluteVote.address);
  return upgradeSchemeParams;
};

const setupOrganization = async function (genesisScheme,genesisSchemeOwner,founderToken,founderReputation) {
  var org = new helpers.Organization();

  var tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",[genesisSchemeOwner],[founderToken],[founderReputation]);
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};

const setupNewController = async function (permission='0xffffffff') {
  var accounts = web3.eth.accounts;
  var token  = await DAOToken.new("TEST","TST");
  // set up a reputaiton system
  var reputation = await Reputation.new();
  var avatar = await Avatar.new('name', token.address, reputation.address);
  var schemesArray = [accounts[0]];
  var paramsArray = [100];
  var permissionArray = [permission];
  var controller = await Controller.new(avatar.address,schemesArray,paramsArray,permissionArray);
  return controller;
};


const setupAbsoluteVote = async function (isOwnedVote=true, precReq=50) {
  var votingMachine = new VotingMachine();
  var accounts = web3.eth.accounts;
  votingMachine.absoluteVote = await AbsoluteVote.new();

  // set up a reputaiton system
  var reputation = await Reputation.new();
  //var avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
  votingMachine.reputationArray = [20, 40 ,70];
  await reputation.mint(accounts[0], votingMachine.reputationArray[0]);
  await reputation.mint(accounts[1], votingMachine.reputationArray[1]);
  await reputation.mint(accounts[2], votingMachine.reputationArray[2]);
  // register some parameters
  await votingMachine.absoluteVote.setParameters(reputation.address, precReq, isOwnedVote);
  votingMachine.params = await votingMachine.absoluteVote.getParametersHash(reputation.address, precReq, isOwnedVote);
  return votingMachine;
};

const setup = async function (accounts) {
   var testSetup = new TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.upgradeScheme = await UpgradeScheme.new(testSetup.standardTokenMock.address,testSetup.fee,accounts[0]);
   testSetup.genesisScheme = await GenesisScheme.deployed();
   testSetup.org = await setupOrganization(testSetup.genesisScheme,accounts[0],1000,1000);
   testSetup.upgradeSchemeParams= await setupUpgradeSchemeParams(testSetup.upgradeScheme);
   await testSetup.genesisScheme.setSchemes(testSetup.org.avatar.address,[testSetup.upgradeScheme.address],[testSetup.upgradeSchemeParams.paramsHash],[testSetup.standardTokenMock.address],[100],["0x0000000F"]);
   //give some tokens to organization avatar so it could register the univeral scheme.
   await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   return testSetup;
};

contract('UpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });

  it("constructor", async function() {
    var standardTokenMock = await new StandardTokenMock(accounts[0],100);
    var upgradeScheme = await UpgradeScheme.new(standardTokenMock.address,10,accounts[1]);
    var token = await upgradeScheme.nativeToken();
    assert.equal(token,standardTokenMock.address);
    var fee = await upgradeScheme.fee();
    assert.equal(fee,10);
    var beneficiary = await upgradeScheme.beneficiary();
    assert.equal(beneficiary,accounts[1]);
   });

   it("setParameters", async function() {
     var standardTokenMock = await new StandardTokenMock(accounts[0],100);
     var upgradeScheme = await UpgradeScheme.new(standardTokenMock.address,10,accounts[1]);
     var absoluteVote = await AbsoluteVote.new();
     await upgradeScheme.setParameters("0x1234",absoluteVote.address);
     var paramHash = await upgradeScheme.getParametersHash("0x1234",absoluteVote.address);
     var parameters = await upgradeScheme.parameters(paramHash);
     assert.equal(parameters[1],absoluteVote.address);
     });

    it("registerOrganization - check fee payment ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
      var balanceOfBeneficiary  = await testSetup.standardTokenMock.balanceOf(accounts[0]);
      assert.equal(balanceOfBeneficiary.toNumber(),testSetup.fee);
     });

     it("proposeUpgrade log", async function() {
       var testSetup = await setup(accounts);
       await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
       var newController = await setupNewController();
       var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "LogNewUpgradeProposal");
       var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
       assert.equal(votingMachine,testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address);
      });

      it("proposeUpgrade without regisration -should fail", async function() {
        var testSetup = await setup(accounts);
        var newController = await setupNewController();
        try{
        await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
        assert(false,"proposeUpgrade should  fail - due to no registration !");
        }catch(ex){
          helpers.assertVMException(ex);
        }
       });

       it("proposeUpgrade check owner vote", async function() {
         var testSetup = await setup(accounts);
         await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
         var newController = await setupNewController();
         var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await checkVoteInfo(testSetup.upgradeSchemeParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.upgradeSchemeParams.votingMachine.reputationArray[0]]);
        });

        it("proposeChangeUpgradingScheme log", async function() {
          var testSetup = await setup(accounts);
          await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
          var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0",testSetup.standardTokenMock.address,1);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "LogChangeUpgradeSchemeProposal");
          var votingMachine = await helpers.getValueFromLogs(tx, '_intVoteInterface',1);
          assert.equal(votingMachine,testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address);
         });

         it("proposeChangeUpgradingScheme without regisration -should fail", async function() {
           var testSetup = await setup(accounts);
           try{
           await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],0,testSetup.standardTokenMock.address,1);
           assert(false,"proposeUpgrade should  fail - due to no registration !");
           }catch(ex){
             helpers.assertVMException(ex);
           }
          });

          it("proposeChangeUpgradingScheme check owner vote", async function() {
            var testSetup = await setup(accounts);
            await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
            var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2",testSetup.standardTokenMock.address,1);
            var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            await checkVoteInfo(testSetup.upgradeSchemeParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.upgradeSchemeParams.votingMachine.reputationArray[0]]);
           });

           it("execute proposal upgrade controller -yes - proposal data delete", async function() {
             var testSetup = await setup(accounts);
             await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
             var newController = await setupNewController();
             assert.notEqual(newController.address,await testSetup.org.avatar.owner());
             var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
             //Vote with reputation to trigger execution
             var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
             //check organizationsProposals before excution
             var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
             assert.equal(organizationsProposals[0],newController.address);//new contract address
             assert.equal(organizationsProposals[2].toNumber(),1);//proposalType
             await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
             assert.equal(newController.address,await testSetup.org.avatar.owner());
             //check organizationsProposals after excution
             organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
             assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
             assert.equal(organizationsProposals[2],0);//proposalType
            });

            it("execute proposal upgrade controller - no decision (same for update scheme) - proposal data delete", async function() {
              var testSetup = await setup(accounts);
              await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);
              var newController = await setupNewController();
              var tx = await testSetup.upgradeScheme.proposeUpgrade(testSetup.org.avatar.address,newController.address);
              var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
              //check organizationsProposals before excution
              var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsProposals[0],newController.address);//new contract address
              assert.equal(organizationsProposals[2].toNumber(),1);//proposalType

              //Vote with reputation to trigger execution
              await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
              //should not upgrade because the decision is "no"
              assert.notEqual(newController.address,await testSetup.org.avatar.owner());
              //check organizationsProposals after excution
              organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
              assert.equal(organizationsProposals[2],0);//proposalType
             });

             it("execute proposal ChangeUpgradingScheme - yes decision - proposal data delete", async function() {
               var testSetup = await setup(accounts);
               await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);

               var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2",testSetup.standardTokenMock.address,1);
               //Vote with reputation to trigger execution
               var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

               //check organizationsProposals before excution
               var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationsProposals[0],accounts[0]);//new contract address
               assert.equal(organizationsProposals[2].toNumber(),2);//proposalType

               //check schemes registration before execution
               var controller = await Controller.at(await testSetup.org.avatar.owner());
               assert.equal(await controller.isSchemeRegistered(accounts[0]),false);
               assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),true);

               await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

               //check organizationsProposals after excution
               organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
               assert.equal(organizationsProposals[2],0);//proposalType

               //check if scheme upgraded
               assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
               assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),false);
              });

              it("execute proposal ChangeUpgradingScheme - yes decision - check approve increase fee ", async function() {
                var testSetup = await setup(accounts);
                await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);

                var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,accounts[0],"0x2",testSetup.standardTokenMock.address,10);
                //Vote with reputation to trigger execution
                var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

                //check organizationsProposals before excution
                var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                assert.equal(organizationsProposals[0],accounts[0]);//new contract address
                assert.equal(organizationsProposals[2].toNumber(),2);//proposalType

                //check schemes registration before execution
                var controller = await Controller.at(await testSetup.org.avatar.owner());
                assert.equal(await controller.isSchemeRegistered(accounts[0]),false);
                assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),true);

                await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

                //check organizationsProposals after excution
                organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
                assert.equal(organizationsProposals[2],0);//proposalType

                //check if scheme upgraded
                assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
                assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),false);
                //check allowance of new scheme.
                assert.equal(await testSetup.standardTokenMock.allowance(testSetup.org.avatar.address,accounts[0]),10);
               });

               it("execute proposal ChangeUpgradingScheme - yes decision - check upgrade it self. ", async function() {
                 var testSetup = await setup(accounts);
                 await testSetup.upgradeScheme.registerOrganization(testSetup.org.avatar.address);

                 var tx = await testSetup.upgradeScheme.proposeChangeUpgradingScheme(testSetup.org.avatar.address,testSetup.upgradeScheme.address,"0x2",testSetup.standardTokenMock.address,10);
                 //Vote with reputation to trigger execution
                 var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

                 //check schemes registration before execution
                 var controller = await Controller.at(await testSetup.org.avatar.owner());
                 assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),true);

                 await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});

                 //check organizationsProposals after excution
                 var organizationsProposals = await testSetup.upgradeScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
                 assert.equal(organizationsProposals[0],0x0000000000000000000000000000000000000000);//new contract address
                 assert.equal(organizationsProposals[2],0);//proposalType

                 //schemes should still be registered
                 assert.equal(await controller.isSchemeRegistered(testSetup.upgradeScheme.address),true);
                });





  // it("proposeController javascript wrapper should change controller", async function() {
  //   const organization = await setupOrganization();
  //
  //   let upgradeScheme = await organization.scheme('UpgradeScheme');
  //   const newController = await Controller.new(null, null, null, [], [], []);
  //
  //   assert.equal(await organization.controller.newController(), helpers.NULL_ADDRESS, "there is already a new contoller");
  //
  //   let tx = await testSetup.upgradeScheme.proposeController({
  //     avatar: organization.avatar.address,
  //     controller: newController.address
  //   });
  //
  //   // newUpgradeScheme.registerOrganization(organization.avatar.address);
  //
  //   const proposalId = getValueFromLogs(tx, '_proposalId');
  //
  //   organization.vote(proposalId, 1, {from: accounts[2]});
  //
  //   // now the ugprade should have been executed
  //   assert.equal(await organization.controller.newController(), newController.address);
  //
  //   // avatar, token and reputation ownership shold have been transferred to the new controller
  //   assert.equal(await organization.token.owner(), newController.address);
  //   assert.equal(await organization.reputation.owner(), newController.address);
  //   assert.equal(await organization.avatar.owner(), newController.address);
  // });
  //
  // it('controller upgrade should work as expected', async function() {
  //   const founders = [
  //     {
  //       address: accounts[0],
  //       reputation: 30,
  //       tokens: 30,
  //     },
  //     {
  //       address: accounts[1],
  //       reputation: 70,
  //       tokens: 70,
  //     }
  //   ];
  //   const organization = await Organization.new({
  //     orgName: 'Skynet',
  //     tokenName: 'Tokens of skynet',
  //     tokenSymbol: 'SNT',
  //     founders,
  //   });
  //
  //   const upgradeScheme = await organization.scheme('UpgradeScheme');
  //   const settings = await settingsForTest();
  //   const votingMachine = await AbsoluteVote.at(settings.votingMachine);
  //
  //   // the organization has not bene upgraded yet, so newController is the NULL address
  //   assert.equal(await organization.controller.newController(), helpers.NULL_ADDRESS);
  //
  //   // we create a new controller to upgrade to
  //   const newController = await Controller.new(null, null, null, [], [], []);
  //   let tx = await testSetup.upgradeScheme.proposeUpgrade(organization.avatar.address, newController.address);
  //
  //   const proposalId = getValueFromLogs(tx, '_proposalId');
  //   // now vote with the majority for the proposal
  //   tx = await votingMachine.vote(proposalId, 1, {from: accounts[1]});
  //
  //   // now the ugprade should have been executed
  //   assert.equal(await organization.controller.newController(), newController.address);
  //
  //   // avatar, token and reputation ownership shold have been transferred to the new controller
  //   assert.equal(await organization.token.owner(), newController.address);
  //   assert.equal(await organization.reputation.owner(), newController.address);
  //   assert.equal(await organization.avatar.owner(), newController.address);
  //
  //   // TODO: we also want to reflect this upgrade in our Controller object!
  // });
  //
  // it("proposeUpgradingScheme javascript wrapper should change upgrade scheme", async function() {
  //   const organization = await forgeOrganization();
  //
  //   let upgradeScheme = await organization.scheme('UpgradeScheme');
  //
  //   const newUpgradeScheme = await UpgradeScheme.new(organization.token.address, 0, accounts[0]);
  //
  //   assert.isFalse(await organization.controller.isSchemeRegistered(newUpgradeScheme.address), "new scheme is already registered into the controller");
  //   assert.isTrue(await organization.controller.isSchemeRegistered(testSetup.upgradeScheme.address), "original scheme is not registered into the controller");
  //
  //   let tx = await testSetup.upgradeScheme.proposeUpgradingScheme({
  //     avatar: organization.avatar.address,
  //     scheme: newUpgradeScheme.address,
  //     schemeParametersHash: await organization.controller.getSchemeParameters(testSetup.upgradeScheme.address)
  //   });
  //
  //   // newUpgradeScheme.registerOrganization(organization.avatar.address);
  //
  //   const proposalId = getValueFromLogs(tx, '_proposalId');
  //
  //   organization.vote(proposalId, 1, {from: accounts[2]});
  //
  //   assert.isTrue(await organization.controller.isSchemeRegistered(newUpgradeScheme.address), "new scheme is not registered into the controller");
  //
  //   assert.isFalse(await organization.controller.isSchemeRegistered(testSetup.upgradeScheme.address), "original scheme is still registered into the controller");
  // });

});
