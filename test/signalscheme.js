import * as helpers from './helpers';

const SignalScheme = artifacts.require("./SignalScheme.sol");
const DaoCreator = artifacts.require("./DaoCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");

export class SignalSchemeParams {
  constructor() {
  }
}


const setupSignalSchemeParam = async function(
                                            signalScheme,
                                            accounts,
                                            genesisProtocol,
                                            avatar
                                            ) {
  var signalSchemeParams = new SignalSchemeParams();
  if (genesisProtocol === true) {
    signalSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,avatar,helpers.NULL_ADDRESS);
    await signalScheme.initialize(   avatar.address,
                                           1234,
                                           setupSignalSchemeParam.votingMachine.params,
                                           setupSignalSchemeParam.votingMachine.genesisProtocol.address);
    } else {
    signalSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,signalScheme.address);
    await signalScheme.initialize(   avatar.address,
                                           1234,
                                           signalSchemeParams.votingMachine.params,
                                           signalSchemeParams.votingMachine.absoluteVote.address);
  }
  return signalSchemeParams;
};

const setup = async function (accounts,genesisProtocol = false) {
   var testSetup = new helpers.TestSetup();
   testSetup.signalScheme = await SignalScheme.new();
   var controllerCreator = await ControllerCreator.new();
   var daoTracker = await DAOTracker.new();
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address);
   if (genesisProtocol) {
      testSetup.reputationArray = [1000,100,0];
   } else {
      testSetup.reputationArray = [2000,4000,7000];
   }
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,0,0],testSetup.reputationArray);
   testSetup.signalSchemeParams= await setupSignalSchemeParam(
                      testSetup.signalScheme,
                      accounts,
                      genesisProtocol,
                      testSetup.org.avatar);
   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.signalScheme.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");
   return testSetup;
};
contract('SignalScheme', accounts => {

    it("proposeSignal log", async function() {
      var testSetup = await setup(accounts);
      var parameters = await testSetup.signalScheme.params();
      assert.equal(parameters.avatar,testSetup.org.avatar.address);
      assert.equal(parameters.signalType,1234);
      assert.equal(parameters.voteApproveParams,testSetup.signalSchemeParams.votingMachine.params);
      assert.equal(parameters.intVote,testSetup.signalSchemeParams.votingMachine.absoluteVote.address);
      var tx = await testSetup.signalScheme.proposeSignal("description-hash");
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewSignalProposal");
      assert.equal(await helpers.getValueFromLogs(tx, '_avatar',0), testSetup.org.avatar.address, "Wrong log: _avatar");
      assert.equal(await helpers.getValueFromLogs(tx, '_descriptionHash',15), "description-hash", "Wrong log: _contributionDescription");
      assert.equal(await helpers.getValueFromLogs(tx, '_signalType',0), 1234, "Wrong log: _signalType");
     });


    it("execute signalScheme  yes ", async function() {
      var testSetup = await setup(accounts);
      var tx = await testSetup.signalScheme.proposeSignal(web3.utils.asciiToHex("description"));
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.signalSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.signalScheme.getPastEvents('Signal', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"Signal");
            assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
            assert.equal(events[0].args._proposalId, proposalId);
            assert.equal(events[0].args._signalType, 1234);
            assert.equal(events[0].args._descriptionHash, web3.utils.asciiToHex("description"));
       });
      var proposal = await testSetup.signalScheme.proposals(proposalId);
      assert.equal(proposal.executed,true);
     });

     it("execute signalScheme no ", async function() {
       var testSetup = await setup(accounts);
       var tx = await testSetup.signalScheme.proposeSignal(web3.utils.asciiToHex("description"));
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       tx = await testSetup.signalSchemeParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.signalScheme.getPastEvents('Signal', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events.length , 0);
        });
       var proposal = await testSetup.signalScheme.proposals(proposalId);
       assert.equal(proposal.executed,true);
      });

     it("cannot initialize twice", async () => {
         let testSetup = await setup(accounts);
         try {
              await testSetup.signalScheme.initialize(testSetup.org.avatar.address,
                                                     1234,
                                                     testSetup.signalSchemeParams.votingMachine.params,
                                                     testSetup.signalSchemeParams.votingMachine.absoluteVote.address);
              assert(false, "cannot initialize twice");
            } catch(error) {
              helpers.assertVMException(error);
            }
     });
});
