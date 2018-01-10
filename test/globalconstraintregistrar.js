import * as helpers from './helpers';
const constants = require('./constants');
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const Controller = artifacts.require("./Controller.sol");



export class GlobalConstraintRegistrarParams {
  constructor() {
  }
}

const setupGlobalConstraintRegistrarParams = async function(
                                            globalConstraintRegistrar
                                            ) {
  var globalConstraintRegistrarParams = new GlobalConstraintRegistrarParams();
  globalConstraintRegistrarParams.votingMachine = await helpers.setupAbsoluteVote();
  await globalConstraintRegistrar.setParameters(globalConstraintRegistrarParams.votingMachine.params,
                                                globalConstraintRegistrarParams.votingMachine.absoluteVote.address);
  globalConstraintRegistrarParams.paramsHash = await globalConstraintRegistrar.getParametersHash(globalConstraintRegistrarParams.votingMachine.params,
                                                                                                 globalConstraintRegistrarParams.votingMachine.absoluteVote.address);
  return globalConstraintRegistrarParams;
};

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.globalConstraintRegistrar = await GlobalConstraintRegistrar.new(testSetup.standardTokenMock.address,testSetup.fee,accounts[0]);
   testSetup.genesisScheme = await GenesisScheme.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.genesisScheme,accounts[0],1000,1000);
   testSetup.globalConstraintRegistrarParams= await setupGlobalConstraintRegistrarParams(testSetup.globalConstraintRegistrar);
   //give some tokens to organization avatar so it could register the universal scheme.
   await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   var permissions = "0x0000000F";
   await testSetup.genesisScheme.setSchemes(testSetup.org.avatar.address,[testSetup.globalConstraintRegistrar.address],[testSetup.globalConstraintRegistrarParams.paramsHash],[permissions]);

   return testSetup;
};
contract('GlobalConstraintRegistrar', function(accounts) {

   it("setParameters", async function() {
     var standardTokenMock = await StandardTokenMock.new(accounts[0],100);
     var globalConstraintRegistrar = await GlobalConstraintRegistrar.new(standardTokenMock.address,10,accounts[1]);
     var params = await setupGlobalConstraintRegistrarParams(globalConstraintRegistrar);
     var parameters = await globalConstraintRegistrar.parameters(params.paramsHash);
     assert.equal(parameters[1],params.votingMachine.absoluteVote.address);
     });

    it("proposeGlobalConstraint log", async function() {
      var testSetup = await setup(accounts);
      var globalConstraintMock = await GlobalConstraintMock.new();

      var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                     globalConstraintMock.address,
                                                                     "0x1234",
                                                                     "0x1234");
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewGlobalConstraintsProposal");
     });

      it("proposeGlobalConstraint check owner vote", async function() {
        var testSetup = await setup(accounts);
        var globalConstraintMock =await GlobalConstraintMock.new();

        var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                       globalConstraintMock.address,
                                                                       0,
                                                                       0);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await helpers.checkVoteInfo(testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.globalConstraintRegistrarParams.votingMachine.reputationArray[0]]);
       });

       it("execute proposeGlobalConstraint ", async function() {
         var testSetup = await setup(accounts);
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         var globalConstraintMock = await GlobalConstraintMock.new();

         var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                        globalConstraintMock.address,
                                                                        0,
                                                                        testSetup.globalConstraintRegistrarParams.votingMachine.params);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "NewGlobalConstraintsProposal");
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         assert.equal(await controller.globalConstraintsCount(0),0);
         tx = await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
         assert.equal(await controller.globalConstraintsCount(0),1);
        });

       it("proposeToRemoveGC log", async function() {
         var testSetup = await setup(accounts);
         var globalConstraintMock =await GlobalConstraintMock.new();

         var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                        globalConstraintMock.address,
                                                                        0,
                                                                        testSetup.globalConstraintRegistrarParams.votingMachine.params);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
         tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                        globalConstraintMock.address);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveGlobalConstraintsProposal");
        });


        it("proposeToRemoveGC without registration -should fail", async function() {
          var testSetup = await setup(accounts,false);
          var globalConstraintMock =await GlobalConstraintMock.new();
          try{
            await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                           globalConstraintMock.address,
                                                                           );
           assert(false,"proposeGlobalConstraint should  fail - due to no registration !");
          }catch(ex){
            helpers.assertVMException(ex);
          }
         });

         it("proposeToRemoveGC check owner vote", async function() {
           var testSetup = await setup(accounts);
           var globalConstraintMock =await GlobalConstraintMock.new();

           var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                          globalConstraintMock.address,
                                                                          0,
                                                                          testSetup.globalConstraintRegistrarParams.votingMachine.params);
           var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
           await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                          globalConstraintMock.address,
                                                                           );
           proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           await helpers.checkVoteInfo(testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.globalConstraintRegistrarParams.votingMachine.reputationArray[0]]);
          });

          it("execute proposeToRemoveGC ", async function() {
            var testSetup = await setup(accounts);
            var controller = await Controller.at(await testSetup.org.avatar.owner());
            var globalConstraintMock =await GlobalConstraintMock.new();

            var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                           globalConstraintMock.address,
                                                                           0,
                                                                           testSetup.globalConstraintRegistrarParams.votingMachine.params);
            var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
            assert.equal(await controller.isGlobalConstraintRegister(globalConstraintMock.address,0),true);
            tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                           globalConstraintMock.address);
            assert.equal(tx.logs.length, 1);
            assert.equal(tx.logs[0].event, "RemoveGlobalConstraintsProposal");
            proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            assert.equal(await controller.globalConstraintsCount(0),1);
            await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
            assert.equal(await controller.globalConstraintsCount(0),0);
           });

           it("execute proposeToRemoveGC (same as proposeGlobalConstraint) vote=NO ", async function() {
             var testSetup = await setup(accounts);
             var controller = await Controller.at(await testSetup.org.avatar.owner());
             var globalConstraintMock =await GlobalConstraintMock.new();

             var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                            globalConstraintMock.address,
                                                                            0,
                                                                            testSetup.globalConstraintRegistrarParams.votingMachine.params);
             var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
             await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
             assert.equal(await controller.globalConstraintsCount(0),0);
        });
});
