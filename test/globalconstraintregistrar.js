import * as helpers from './helpers';
const constants = require('./constants');
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const Controller = artifacts.require("./Controller.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');



export class GlobalConstraintRegistrarParams {
  constructor() {
  }
}

const setupGlobalConstraintRegistrarParams = async function(

                                            globalConstraintRegistrar,
                                            accounts,
                                            genesisProtocol,
                                            token
                                            ) {
  var globalConstraintRegistrarParams = new GlobalConstraintRegistrarParams();
  if (genesisProtocol === true) {
    globalConstraintRegistrarParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token);
    await globalConstraintRegistrar.setParameters(globalConstraintRegistrarParams.votingMachine.params,
                                                  globalConstraintRegistrarParams.votingMachine.genesisProtocol.address);
    globalConstraintRegistrarParams.paramsHash = await globalConstraintRegistrar.getParametersHash(globalConstraintRegistrarParams.votingMachine.params,
                                                                                                   globalConstraintRegistrarParams.votingMachine.genesisProtocol.address);
    } else {
  globalConstraintRegistrarParams.votingMachine = await helpers.setupAbsoluteVote();
  await globalConstraintRegistrar.setParameters(globalConstraintRegistrarParams.votingMachine.params,
                                                globalConstraintRegistrarParams.votingMachine.absoluteVote.address);
  globalConstraintRegistrarParams.paramsHash = await globalConstraintRegistrar.getParametersHash(globalConstraintRegistrarParams.votingMachine.params,
                                                                                                 globalConstraintRegistrarParams.votingMachine.absoluteVote.address);
  }
  return globalConstraintRegistrarParams;
};

const setup = async function (accounts,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.globalConstraintRegistrar = await GlobalConstraintRegistrar.new();
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],[20,10,70]);
   testSetup.globalConstraintRegistrarParams= await setupGlobalConstraintRegistrarParams(testSetup.globalConstraintRegistrar,accounts,genesisProtocol,tokenAddress);
   var permissions = "0x00000004";
   //await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.globalConstraintRegistrar.address],[testSetup.globalConstraintRegistrarParams.paramsHash],[permissions]);
   if (genesisProtocol) {
     await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                          [testSetup.globalConstraintRegistrar.address,testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol.address],
                                          [testSetup.globalConstraintRegistrarParams.paramsHash,testSetup.globalConstraintRegistrarParams.votingMachine.params],[permissions,permissions]);
   } else
   {
     await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.globalConstraintRegistrar.address],[testSetup.globalConstraintRegistrarParams.paramsHash],[permissions]);
    }

   return testSetup;
};
contract('GlobalConstraintRegistrar', function(accounts) {

   it("setParameters", async function() {
     var globalConstraintRegistrar = await GlobalConstraintRegistrar.new();
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
         await globalConstraintMock.setConstraint("method",false,false);



         var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                        globalConstraintMock.address,
                                                                        0,
                                                                        testSetup.globalConstraintRegistrarParams.votingMachine.params);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "NewGlobalConstraintsProposal");
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         let gcCount =  await controller.globalConstraintsCount(testSetup.org.avatar.address);
         assert.equal(gcCount[0],0);
         assert.equal(gcCount[1],0);
         tx = await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
         gcCount =  await controller.globalConstraintsCount(testSetup.org.avatar.address);
         assert.equal(gcCount[0],1);
        });

       it("proposeToRemoveGC log", async function() {
         var testSetup = await setup(accounts);
         var globalConstraintMock =await GlobalConstraintMock.new();
         await globalConstraintMock.setConstraint("method",false,false);

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
           await globalConstraintMock.setConstraint("method",false,false);

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
            await globalConstraintMock.setConstraint("method",false,false);

            var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                           globalConstraintMock.address,
                                                                           0,
                                                                           testSetup.globalConstraintRegistrarParams.votingMachine.params);
            var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
            assert.equal(await controller.isGlobalConstraintRegistered(globalConstraintMock.address,testSetup.org.avatar.address),true);
            tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                           globalConstraintMock.address);
            assert.equal(tx.logs.length, 1);
            assert.equal(tx.logs[0].event, "RemoveGlobalConstraintsProposal");
            proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            let count = await controller.globalConstraintsCount(testSetup.org.avatar.address);
            assert.equal(count[0],1);
            await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
            count = await controller.globalConstraintsCount(testSetup.org.avatar.address);
            assert.equal(count[0],0);
           });

           it("execute proposeToRemoveGC (same as proposeGlobalConstraint) vote=NO ", async function() {
             var testSetup = await setup(accounts);
             var controller = await Controller.at(await testSetup.org.avatar.owner());
             var globalConstraintMock =await GlobalConstraintMock.new();
             await globalConstraintMock.setConstraint("method",false,false);

             var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                            globalConstraintMock.address,
                                                                            0,
                                                                            testSetup.globalConstraintRegistrarParams.votingMachine.params);
             var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
             await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
             let count = await controller.globalConstraintsCount(testSetup.org.avatar.address);
             assert.equal(count[0],0);
        });




        it("proposeToRemoveGC  with genesis protocol", async function() {
          var standardTokenMock = await StandardTokenMock.new(accounts[0],1000);
          var testSetup = await setup(accounts,true,standardTokenMock.address);
          var globalConstraintMock =await GlobalConstraintMock.new();
          await globalConstraintMock.setConstraint("mintReputation",true,true);

          var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(testSetup.org.avatar.address,
                                                                         globalConstraintMock.address,
                                                                         0,
                                                                         testSetup.globalConstraintRegistrarParams.votingMachine.params);


          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          await testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,{from:accounts[2]});

          tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(testSetup.org.avatar.address,
                                                                          globalConstraintMock.address,
                                                                          );
          proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          var rep = await testSetup.org.reputation.reputationOf(accounts[2]);

          await testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,{from:accounts[2]});
          await helpers.checkVoteInfo(testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol,proposalId,accounts[2],[1,rep.toNumber()]);
         });

});
