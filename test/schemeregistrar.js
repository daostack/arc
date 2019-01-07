import * as helpers from './helpers';
const constants = require('./constants');
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const UniversalScheme = artifacts.require('./UniversalScheme.sol');
const Controller = artifacts.require('./Controller.sol');
const ControllerCreator = artifacts.require("./ControllerCreator.sol");



export class SchemeRegistrarParams {
  constructor() {
  }
}

const setupSchemeRegistrarParams = async function(
                                            schemeRegistrar,
                                            ) {
  var schemeRegistrarParams = new SchemeRegistrarParams();
  schemeRegistrarParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,schemeRegistrar.address);
  await schemeRegistrar.setParameters(schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.absoluteVote.address);
  schemeRegistrarParams.paramsHash = await schemeRegistrar.getParametersHash(schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.params,schemeRegistrarParams.votingMachine.absoluteVote.address);
  return schemeRegistrarParams;
};

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.schemeRegistrar = await SchemeRegistrar.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,40,70];
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,0,0],testSetup.reputationArray);
   testSetup.schemeRegistrarParams= await setupSchemeRegistrarParams(testSetup.schemeRegistrar);
   var permissions = "0x0000001F";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.schemeRegistrar.address],[testSetup.schemeRegistrarParams.paramsHash],[permissions]);

   return testSetup;
};
contract('SchemeRegistrar', accounts => {

   it("setParameters", async() => {
     var schemeRegistrar = await SchemeRegistrar.new();
     var params = await setupSchemeRegistrarParams(schemeRegistrar);
     var parameters = await schemeRegistrar.parameters(params.paramsHash);
     assert.equal(parameters[2],params.votingMachine.absoluteVote.address);
     });

    it("proposeScheme log", async function() {
      var testSetup = await setup(accounts);

      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,
                                                             testSetup.schemeRegistrar.address,
                                                             helpers.NULL_HASH,
                                                             "0x00000000",
                                                             helpers.NULL_HASH);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewSchemeProposal");
     });

       it("proposeToRemoveScheme log", async function() {
         var testSetup = await setup(accounts);

         var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.org.avatar.address,
                                                                        testSetup.schemeRegistrar.address,
                                                                        helpers.NULL_HASH);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveSchemeProposal");
        });


    it("execute proposeScheme  and execute -yes - fee > 0 ", async function() {
      var testSetup = await setup(accounts);
      var universalScheme = await UniversalScheme.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,helpers.NULL_HASH,"0x00000000",helpers.NULL_HASH);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(universalScheme.address,testSetup.org.avatar.address),true);
     });

     it("execute proposeScheme  and execute -yes - permissions== 0x00000001", async function() {
       var testSetup = await setup(accounts);
       var permissions = "0x00000001";

       var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,permissions,helpers.NULL_HASH);
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var controller = await Controller.at(await testSetup.org.avatar.owner());
       assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
       assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000001");
      });

      it("execute proposeScheme  and execute -yes - permissions== 0x00000002", async function() {
        var testSetup = await setup(accounts);
        var permissions = "0x00000002";

        var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,permissions,helpers.NULL_HASH);
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
        assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000003");
       });

       it("execute proposeScheme  and execute -yes - permissions== 0x00000003", async function() {
         var testSetup = await setup(accounts);
         var permissions = "0x00000003";

         var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,permissions,helpers.NULL_HASH);
         //Vote with reputation to trigger execution
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
         assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000003");
        });

        it("execute proposeScheme  and execute -yes - permissions== 0x00000008", async function() {
          var testSetup = await setup(accounts);
          var permissions = "0x00000008";

          var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,permissions,helpers.NULL_HASH);
          //Vote with reputation to trigger execution
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
          var controller = await Controller.at(await testSetup.org.avatar.owner());
          assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
          assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000009");
         });

         it("execute proposeScheme  and execute -yes - permissions== 0x00000010", async function() {
           var testSetup = await setup(accounts);
           var permissions = "0x00000010";

           var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,permissions,helpers.NULL_HASH);
           //Vote with reputation to trigger execution
           var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
           var controller = await Controller.at(await testSetup.org.avatar.owner());
           assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
           assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000011");
          });

      it("execute proposeScheme  and execute -yes - isRegistering==FALSE ", async function() {
        var testSetup = await setup(accounts);

        var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,"0x00000000",helpers.NULL_HASH);
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),true);
        assert.equal(await controller.getSchemePermissions(accounts[0],testSetup.org.avatar.address),"0x00000001");
       });



       it("execute proposeScheme - no decision (same for remove scheme) - proposal data delete", async function() {
         var testSetup = await setup(accounts);

         var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,accounts[0],helpers.NULL_HASH,"0x00000000",helpers.NULL_HASH);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         //check organizationsProposals before execution
         var organizationProposal = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
         assert.equal(organizationProposal[1],true);//proposalType

         //Vote with reputation to trigger execution
         await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         //should not register because the decision is "no"
         assert.equal(await controller.isSchemeRegistered(accounts[0],testSetup.org.avatar.address),false);
         //check organizationsProposals after execution
         organizationProposal = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
         assert.equal(organizationProposal[2],0);//proposalType
        });

        it("execute proposeToRemoveScheme ", async function() {
          var testSetup = await setup(accounts);

          var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.org.avatar.address,testSetup.schemeRegistrar.address,helpers.NULL_HASH);
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          var controller = await Controller.at(await testSetup.org.avatar.owner());
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address,testSetup.org.avatar.address),true);
          //Vote with reputation to trigger execution
          await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address,testSetup.org.avatar.address),false);
          //check organizationsProposals after execution
          var organizationProposal = await testSetup.schemeRegistrar.organizationsProposals(testSetup.org.avatar.address,proposalId);
          assert.equal(organizationProposal[2],0);//proposalType
         });
   it("execute proposeScheme  and execute -yes - autoRegisterOrganization==TRUE arc scheme", async function() {
     var testSetup = await setup(accounts);

     var universalScheme = await UniversalScheme.new();
     var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,helpers.NULL_HASH,"0x00000000",helpers.NULL_HASH);
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    });

    it("execute proposeScheme  and execute -yes - autoRegisterOrganization==FALSE arc scheme", async function() {
      var testSetup = await setup(accounts);

      var universalScheme = await UniversalScheme.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(testSetup.org.avatar.address,universalScheme.address,helpers.NULL_HASH,"0x00000000",helpers.NULL_HASH);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     });
});
