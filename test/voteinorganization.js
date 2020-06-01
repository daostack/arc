import * as helpers from './helpers';
const constants = require('./constants');
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const VoteInOrganizationScheme = artifacts.require('./VoteInOrganizationScheme.sol');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const AbsoluteVoteExecuteMock = artifacts.require("./AbsoluteVoteExecuteMock.sol");
const GenesisProtocolCallbacksMock = artifacts.require("./GenesisProtocolCallbacksMock.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Controller = artifacts.require("./Controller.sol");

export class VoteInOrganizationParams {
  constructor() {
  }
}

const setupVoteInOrganizationParams = async function(
                                            voteInOrganization,
                                            accounts,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar
                                            ) {
  var voteInOrganizationParams = new VoteInOrganizationParams();
  if (genesisProtocol === true){
    voteInOrganizationParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,avatar,helpers.NULL_ADDRESS);

    await voteInOrganization.setParameters(
                                           voteInOrganizationParams.votingMachine.params,
                                           voteInOrganizationParams.votingMachine.genesisProtocol.address);
    voteInOrganizationParams.paramsHash = await voteInOrganization.getParametersHash(
                                                                                     voteInOrganizationParams.votingMachine.params,
                                                                                     voteInOrganizationParams.votingMachine.genesisProtocol.address
                                                                                     );
    }
  else {
      voteInOrganizationParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
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
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.voteInOrganization = await VoteInOrganizationScheme.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [200,100,700];
   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }

   testSetup.voteInOrganizationParams= await setupVoteInOrganizationParams(testSetup.voteInOrganization,
                                                                           accounts,
                                                                           genesisProtocol,
                                                                           tokenAddress,
                                                                           testSetup.org.avatar);
   var permissions = "0x00000010";

   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.voteInOrganization.address,accounts[3]],
                                        [testSetup.voteInOrganizationParams.paramsHash,helpers.NULL_HASH],[permissions,permissions],"metaData");

   return testSetup;
};

contract('VoteInOrganizationScheme', accounts => {
  
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

       var tx = await absoluteVoteExecuteMock.propose(2,
                                                      anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                      anotherTestSetup.org.avatar.address,
                                                      accounts[0],helpers.NULL_ADDRESS);

       const proposalId = await helpers.getProposalId(tx,anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote, 'NewProposal');
       tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                           proposalId,1,helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewVoteProposal");
       assert.equal(tx.logs[0].args._vote, 1);
      });

   it("execute proposeVote -no decision - proposal data delete", async function() {
     var testSetup = await setup(accounts);

     var anotherTestSetup =  await setup(accounts);
     var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(testSetup.org.reputation.address,
                                                                     anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
     var tx = await absoluteVoteExecuteMock.propose(2,
                                                                        anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                        anotherTestSetup.org.avatar.address,
                                                                        accounts[0],
                                                                        helpers.NULL_ADDRESS);
     const originalProposalId = await helpers.getProposalId(tx,anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote, 'NewProposal');

     tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                         anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                         originalProposalId,1,helpers.NULL_HASH);
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
     await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     //check organizationsProposals after execution
     var organizationProposal = await testSetup.voteInOrganization.organizationsProposals(testSetup.org.avatar.address,proposalId);
     assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
      var testSetup = await setup(accounts);

      var anotherTestSetup =  await setup(accounts);
      var anotherController = await Controller.at(await anotherTestSetup.org.reputation.owner());
      //mint reputation to avatar in the other dao.
      await anotherController.mintReputation(10000,testSetup.org.avatar.address,anotherTestSetup.org.avatar.address,{from:accounts[3]});
      var absoluteVoteExecuteMock = await AbsoluteVoteExecuteMock.new(anotherTestSetup.org.reputation.address,
                                                                      anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);
      var tx = await absoluteVoteExecuteMock.propose(2,
                                                                         anotherTestSetup.voteInOrganizationParams.votingMachine.params,
                                                                         anotherTestSetup.org.avatar.address,
                                                                         accounts[0],
                                                                         helpers.NULL_ADDRESS);
      const originalProposalId = await helpers.getProposalId(tx,anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote, 'NewProposal');

      tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                          anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                          originalProposalId,1,helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var organizationProposal = await testSetup.voteInOrganization.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address);//new contract address
      await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
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
                                                                          accounts[0],
                                                                          helpers.NULL_ADDRESS);

       const originalProposalId = await helpers.getProposalId(tx,anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote, 'NewProposal');
       tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                           anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote.address,
                                                           originalProposalId,1,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.voteInOrganizationParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.absoluteVote,originalProposalId, testSetup.org.avatar.address, [1, anotherTestSetup.reputationArray[2]]);
     });

     it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
        var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
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
                                                                           accounts[0],
                                                                           helpers.NULL_ADDRESS);
        var  originalProposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        tx = await testSetup.voteInOrganization.proposeVote(testSetup.org.avatar.address,
                                                            anotherTestSetup.voteInOrganizationParams.votingMachine.genesisProtocol.address,
                                                            originalProposalId,1,helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        await testSetup.voteInOrganizationParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        await helpers.checkVoteInfo(anotherTestSetup.voteInOrganizationParams.votingMachine.genesisProtocol,originalProposalId, testSetup.org.avatar.address, [1, 100]);
     });
});
