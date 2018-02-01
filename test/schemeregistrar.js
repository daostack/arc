import * as helpers from './helpers';
const constants = require('./constants');
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const UniversalScheme = artifacts.require('./UniversalScheme.sol');
const Controller = artifacts.require('./Controller.sol');


export class SchemeRegistrarParams {
  constructor() {
  }
}

const setupSchemeRegistrarParams = async function(
                                            schemeRegistrar,
                                            ) {
  var schemeRegistrarParams = new SchemeRegistrarParams();
  schemeRegistrarParams.votingMachine = await helpers.setupAbsoluteVote();
  await schemeRegistrar.setParameters(schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.absoluteVote.address);
  schemeRegistrarParams.paramsHash = await schemeRegistrar.getParametersHash(schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.absoluteVote.address);
  return schemeRegistrarParams;
};

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.schemeRegistrar = await SchemeRegistrar.new();
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.schemeRegistrarParams= await setupSchemeRegistrarParams(testSetup.schemeRegistrar);
   //give some tokens to organization avatar so it could register the universal scheme.
   await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   var permissions = "0x0000000F";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.schemeRegistrar.address],[testSetup.schemeRegistrarParams.paramsHash],[permissions]);

   return testSetup;
};
contract('SchemeRegistrar', function(accounts) {

   it("setParameters", async function() {
     var standardTokenMock = await StandardTokenMock.new(accounts[0],100);
     var schemeRegistrar = await SchemeRegistrar.new(standardTokenMock.address,10,accounts[1]);
     var params = await setupSchemeRegistrarParams(schemeRegistrar);
     var parameters = await schemeRegistrar.parameters(params.paramsHash);
     assert.equal(parameters[2],params.votingMachine.absoluteVote.address);
     });

    it("proposeScheme log", async function() {
      var testSetup = await setup(accounts);

      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address,0,false);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewSchemeProposal");
     });

      it("proposeScheme check owner vote", async function() {
        var testSetup = await setup(accounts);

        var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address,0,false);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await helpers.checkVoteInfo(testSetup.schemeRegistrarParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.schemeRegistrarParams.votingMachine.reputationArray[0]]);
       });

       it("proposeToRemoveScheme log", async function() {
         var testSetup = await setup(accounts);

         var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveSchemeProposal");
        });

   it("proposeToRemoveScheme check owner vote", async function() {
      var testSetup = await setup(accounts);

      var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await helpers.checkVoteInfo(testSetup.schemeRegistrarParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.schemeRegistrarParams.votingMachine.reputationArray[0]]);
    });

    it("execute proposeScheme  and execute -yes - fee > 0 ", async function() {
      var testSetup = await setup(accounts);
      var universalScheme = await UniversalScheme.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,0,false);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(universalScheme.address,0),true);
     });

     it("execute proposeScheme  and execute -yes - isRegistering==TRUE ", async function() {
       var testSetup = await setup(accounts);
       var isRegistering = true;

       var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],0,isRegistering);
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
       var controller = await Controller.at(await testSetup.org.avatar.owner());
       assert.equal(await controller.isSchemeRegistered(accounts[0],0),true);
       assert.equal(await controller.getSchemePermissions(accounts[0],0),"0x00000003");
      });

      it("execute proposeScheme  and execute -yes - isRegistering==FALSE ", async function() {
        var testSetup = await setup(accounts);
        var isRegistering = false;

        var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],0,isRegistering);
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        assert.equal(await controller.isSchemeRegistered(accounts[0],0),true);
        assert.equal(await controller.getSchemePermissions(accounts[0],0),"0x00000001");
       });



       it("execute proposeScheme - no decision (same for remove scheme) - proposal data delete", async function() {
         var testSetup = await setup(accounts);
         var isRegistering = false;

         var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],0,isRegistering);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         //check organizationsProposals before execution
         var organizationsProposals = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
         assert.equal(organizationsProposals[2].toNumber(),1);//proposalType

         //Vote with reputation to trigger execution
         await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,2,{from:accounts[2]});
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         //should not register because the decision is "no"
         assert.equal(await controller.isSchemeRegistered(accounts[0],0),false);
         //check organizationsProposals after execution
         organizationsProposals = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
         assert.equal(organizationsProposals[2],0);//proposalType
        });

        it("execute proposeToRemoveScheme ", async function() {
          var testSetup = await setup(accounts);

          var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address);
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          var controller = await Controller.at(await testSetup.org.avatar.owner());
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address,0),true);
          //Vote with reputation to trigger execution
          await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address,0),false);
          //check organizationsProposals after execution
          var organizationsProposals = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
          assert.equal(organizationsProposals[2],0);//proposalType
         });
   it("execute proposeScheme  and execute -yes - autoRegisterOrganization==TRUE arc scheme", async function() {
     var testSetup = await setup(accounts);

     var universalScheme = await UniversalScheme.new();
     var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,0,false);
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
    });

    it("execute proposeScheme  and execute -yes - autoRegisterOrganization==FALSE arc scheme", async function() {
      var testSetup = await setup(accounts);

      var universalScheme = await UniversalScheme.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,0,false);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
     });
});
