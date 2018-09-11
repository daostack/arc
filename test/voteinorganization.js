import * as helpers from './helpers';
const constants = require('./constants');
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const VoteInOrganizationScheme = artifacts.require('./VoteInOrganizationScheme.sol');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const AbsoluteVoteExecuteMock = artifacts.require("./AbsoluteVoteExecuteMock.sol");
const GenesisProtocolCallbacksMock = artifacts.require("./GenesisProtocolCallbacksMock.sol");
const Reputation = artifacts.require("./Reputation.sol");

export class VoteInOrganizationParams {
  constructor() {
  }
}

const setupVoteInOrganizationParams = async function(
                                            voteInOrganization,
                                            accounts,
                                            reputationAccount=0,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar
                                            ) {
  var voteInOrganizationParams = new VoteInOrganizationParams();
  if (genesisProtocol === true){
    voteInOrganizationParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,avatar);

    await voteInOrganization.setParameters(
                                           voteInOrganizationParams.votingMachine.params,
                                           voteInOrganizationParams.votingMachine.genesisProtocol.address);
    voteInOrganizationParams.paramsHash = await voteInOrganization.getParametersHash(
                                                                                     voteInOrganizationParams.votingMachine.params,
                                                                                     voteInOrganizationParams.votingMachine.genesisProtocol.address
                                                                                     );
    }
  else {
      voteInOrganizationParams.votingMachine = await helpers.setupAbsoluteVote(true,50,reputationAccount);
      await voteInOrganization.setParameters(voteInOrganizationParams.votingMachine.params,
                                             voteInOrganizationParams.votingMachine.absoluteVote.address);
      voteInOrganizationParams.paramsHash = await voteInOrganization.getParametersHash(voteInOrganizationParams.votingMachine.params,
                                                                                       voteInOrganizationParams.votingMachine.absoluteVote.address);
  }

  return voteInOrganizationParams;
};

const setup = async function (accounts,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.voteInOrganization = await VoteInOrganizationScheme.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,10,70];
   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }

   testSetup.voteInOrganizationParams= await setupVoteInOrganizationParams(testSetup.voteInOrganization,
                                                                           accounts,
                                                                           reputationAccount,
                                                                           genesisProtocol,
                                                                           tokenAddress,
                                                                           testSetup.org.avatar);
   var permissions = "0x00000010";

   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.voteInOrganization.address],
                                        [testSetup.voteInOrganizationParams.paramsHash],[permissions]);

   return testSetup;
};

contract('VoteInOrganizationScheme', accounts => {
  before(function() {
     helpers.etherForEveryone(accounts);
  });
   it("setParameters", async() => {
     var voteInOrganization = await VoteInOrganizationScheme.new();
     var absoluteVote = await AbsoluteVote.new();
     await voteInOrganization.setParameters("0x1234",absoluteVote.address);
     var paramHash = await voteInOrganization.getParametersHash("0x1234",absoluteVote.address);
     var parameters = await voteInOrganization.parameters(paramHash);
     assert.equal(parameters[0],absoluteVote.address);
     });


     it("proposeVote log", async function() {
       var testSetup = await setup(accounts);

       var anotherTestSetup =  await setup(accounts);
       var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(testSetup.org.reputation.address,
                                                                       anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);

       var tx = await absoluteVoteExecuteMock.propose(5,
                                                      anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                      anotherTestSetup.org.avatar.address,
                                                      accounts[0]);
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
     var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(testSetup.org.reputation.address,
                                                                     anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
     var tx = await absoluteVoteExecuteMock.propose(2,
                                                                        anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                        anotherTestSetup.org.avatar.address,
                                                                        accounts[0]);
     var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
     tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                         anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                         originalProposalId);
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
     await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,0,0,{from:accounts[2]});
     //check organizationsProposals after execution
     var organizationProposal = await testSetup.voteInOrganization.organizationsProposals(testSetup.org.avatar.address,proposalId);
     assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
      var testSetup = await setup(accounts);

      var anotherTestSetup =  await setup(accounts);
      var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(testSetup.org.reputation.address,
                                                                      anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
      var tx = await absoluteVoteExecuteMock.propose(2,
                                                                         anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                         anotherTestSetup.org.avatar.address,
                                                                         accounts[0]);
      var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                          anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                          originalProposalId);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var organizationProposal = await testSetup.voteInOrganization.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);//new contract address
      await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,0,{from:accounts[2]});
      //check organizationsProposals after execution
      organizationProposal = await testSetup.voteInOrganization.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
     });

     it("execute proposeVote -positive decision - check action", async function() {
       var testSetup = await setup(accounts);

       var anotherTestSetup =  await setup(accounts,testSetup.org.avatar.address);
       var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(anotherTestSetup.org.reputation.address,
                                                                       anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
        var tx = await absoluteVoteExecuteMock.propose(2,
                                                                          anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                          anotherTestSetup.org.avatar.address,
                                                                          accounts[0]);

       var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                           originalProposalId);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,0,{from:accounts[2]});
       await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote,originalProposalId, testSetup.org.avatar.address, [1, anotherTestSetup.reputationArray[2]]);
     });

     it("execute proposeVote -positive decision vote orignalNumberOfChoices + 1 - check action", async function() {
       var testSetup = await setup(accounts);

       var anotherTestSetup =  await setup(accounts,testSetup.org.avatar.address);
       var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(anotherTestSetup.org.reputation.address,
                                                                       anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
       var tx = await absoluteVoteExecuteMock.propose(2,
                                                                          anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                          anotherTestSetup.org.avatar.address,
                                                                          accounts[0]);
       var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                           originalProposalId);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,3,0,{from:accounts[2]});
       await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote,originalProposalId, testSetup.org.avatar.address, [0, anotherTestSetup.reputationArray[2]]);
     });


     it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
        var standardTokenMock = await StandardTokenMock.new(accounts[0],1000);
        var testSetup = await setup(accounts,0,true,standardTokenMock.address);

        var anotherTestSetup =  await setup(accounts,0,true,standardTokenMock.address);
        var reputation = await Reputation.new();
        await reputation.mint(testSetup.org.avatar.address,100);

        var genesisProtocolCallbacksMock = await GenesisProtocolCallbacksMock.new(reputation.address,
                                                                             standardTokenMock.address,
                                                                             anotherTestSetup.voteInOrganizationParams.votingMachine.genesisProtocol.address);
        await reputation.transferOwnership(genesisProtocolCallbacksMock.address);
        var tx = await genesisProtocolCallbacksMock.propose(2,
                                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                           anotherTestSetup.org.avatar.address,
                                                                           accounts[0]);
        var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                            anotherTestSetup.voteInOrganizationParams.votingMachine.genesisProtocol.address,
                                                            originalProposalId);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        await testSetup.voteInOrganizationParams.votingMachine.genesisProtocol.vote(proposalId,1,0,{from:accounts[2]});
        await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.genesisProtocol,originalProposalId, testSetup.org.avatar.address, [1, 100]);
     });
});
