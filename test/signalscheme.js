import * as helpers from './helpers';
const SignalScheme = artifacts.require("./SignalScheme.sol");


export class SignalSchemeParams {
  constructor() {
  }
}

var registration;

const setupSignalSchemeParam = async function(
                                            accounts,
                                            genesisProtocol,
                                            avatar
                                            ) {
  var signalSchemeParams = new SignalSchemeParams();
  if (genesisProtocol === true) {
    signalSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,avatar,helpers.NULL_ADDRESS);
    signalSchemeParams.initdata = await new web3.eth.Contract(registration.signalScheme.abi)
    .methods
    .initialize(   avatar.address,
     1234,
     setupSignalSchemeParam.votingMachine.params,
     setupSignalSchemeParam.votingMachine.genesisProtocol.address)
    .encodeABI();
    } else {
      signalSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      signalSchemeParams.initdata = await new web3.eth.Contract(registration.signalScheme.abi)
                                                .methods
                                                .initialize(   avatar.address,
                                                  1234,
                                                  signalSchemeParams.votingMachine.params,
                                                  signalSchemeParams.votingMachine.absoluteVote.address)
                                                .encodeABI();
  }
  return signalSchemeParams;
};

const setup = async function (accounts,genesisProtocol = false) {
   var testSetup = new helpers.TestSetup();
   testSetup.signalScheme = await SignalScheme.new();
   registration = await helpers.registerImplementation();

   if (genesisProtocol) {
      testSetup.reputationArray = [1000,100,0];
   } else {
      testSetup.reputationArray = [2000,4000,7000];
   }
   testSetup.proxyAdmin = accounts[5];
   testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                       accounts,
                                                                       registration,
                                                                       [accounts[0],
                                                                       accounts[1],
                                                                       accounts[2]],
                                                                       [1000,0,0],
                                                                       testSetup.reputationArray);

  testSetup.signalSchemeParams= await setupSignalSchemeParam(
                      accounts,
                      genesisProtocol,
                      testSetup.org.avatar);
   var permissions = "0x00000000";
   var tx = await registration.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [web3.utils.fromAscii("SignalScheme")],
    testSetup.signalSchemeParams.initdata,
    [helpers.getBytesLength(testSetup.signalSchemeParams.initdata)],
    [permissions],
    "metaData",{from:testSetup.proxyAdmin});

    testSetup.signalScheme = await SignalScheme.at(tx.logs[1].args._scheme);
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
