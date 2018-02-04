import * as helpers from './helpers';
const constants = require('./constants');
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const VoteInOrganizationScheme = artifacts.require('./VoteInOrganizationScheme.sol');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

export class VoteInOrganizationParams {
  constructor() {
  }
}

const setupVoteInOrganizationParams = async function(
                                            voteInOrganization,
                                            reputationAccount=0,
                                            ) {
  var voteInOrganizationParams = new VoteInOrganizationParams();
  voteInOrganizationParams.votingMachine = await helpers.setupAbsoluteVote(true,50,reputationAccount);
  await voteInOrganization.setParameters(voteInOrganizationParams.votingMachine.params,voteInOrganizationParams.votingMachine.absoluteVote.address);
  voteInOrganizationParams.paramsHash = await voteInOrganization.getParametersHash(voteInOrganizationParams.votingMachine.params,voteInOrganizationParams.votingMachine.absoluteVote.address);
  return voteInOrganizationParams;
};

const setup = async function (accounts,reputationAccount=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.voteInOrganization = await VoteInOrganizationScheme.new();
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.voteInOrganizationParams= await setupVoteInOrganizationParams(testSetup.voteInOrganization,reputationAccount);
   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.voteInOrganization.address],[testSetup.voteInOrganizationParams.paramsHash],[permissions]);

   return testSetup;
};

contract('VoteInOrganizationScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });
   it("setParameters", async function() {
     var standardTokenMock = await StandardTokenMock.new(accounts[0],100);
     var voteInOrganization = await VoteInOrganizationScheme.new(standardTokenMock.address,10,accounts[1]);
     var absoluteVote = await AbsoluteVote.new();
     await voteInOrganization.setParameters("0x1234",absoluteVote.address);
     var paramHash = await voteInOrganization.getParametersHash("0x1234",absoluteVote.address);
     var parameters = await voteInOrganization.parameters(paramHash);
     assert.equal(parameters[0],absoluteVote.address);
     });


     it("proposeVote log", async function() {
       var testSetup = await setup(accounts);

       var anotherTestSetup =  await setup(accounts);
       var executable = await ExecutableTest.new();
       var tx = await anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.propose(5,
                                                                          anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                          anotherTestSetup.org.avatar.address,
                                                                          executable.address,accounts[0]);
       const proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                           proposalId);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewVoteProposal");
      });

           it("execute proposeVote -no decision - proposal data delete", async function() {
             var testSetup = await setup(accounts);

             var anotherTestSetup =  await setup(accounts);
             var executable = await ExecutableTest.new();
             var tx = await anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.propose(2,
                                                                                anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                                anotherTestSetup.org.avatar.address,
                                                                                executable.address,accounts[0]);
             var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
             tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                                 anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                                 originalProposalId);
             var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
             await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
             //check organizationsData after execution
             var organizationsData = await testSetup.voteInOrganization.organizationsData(testSetup.org.avatar.address,proposalId);
             assert.equal(organizationsData[0],0x0000000000000000000000000000000000000000);//new contract address
            });

            it("execute proposeVote -positive decision - proposal data delete", async function() {
              var testSetup = await setup(accounts);

              var anotherTestSetup =  await setup(accounts);
              var executable = await ExecutableTest.new();
              var tx = await anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.propose(2,
                                                                                 anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                                 anotherTestSetup.org.avatar.address,
                                                                                 executable.address,accounts[0]);
              var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
              tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                                  anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                                  originalProposalId);
              var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
              var organizationsData = await testSetup.voteInOrganization.organizationsData(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsData[0],anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);//new contract address
              await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
              //check organizationsData after execution
              organizationsData = await testSetup.voteInOrganization.organizationsData(testSetup.org.avatar.address,proposalId);
              assert.equal(organizationsData[0],0x0000000000000000000000000000000000000000);//new contract address
             });

             it("execute proposeVote -positive decision - check action", async function() {
               var testSetup = await setup(accounts);

               var anotherTestSetup =  await setup(accounts,testSetup.org.avatar.address);
               var executable = await ExecutableTest.new();
               var tx = await anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.propose(2,
                                                                                  anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                                  anotherTestSetup.org.avatar.address,
                                                                                  executable.address,accounts[0]);
               var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
               tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                                   anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                                   originalProposalId);
               var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
               await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
               await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote,originalProposalId, testSetup.org.avatar.address, [1, anotherTestSetup.voteInOrganizationParams.votingMachine.reputationArray[2]]);
             });
});
