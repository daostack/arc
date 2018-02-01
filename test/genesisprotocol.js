const helpers = require('./helpers');
import { getValueFromLogs } from './helpers';
const GenesisProtocol = artifacts.require("./GenesisProtocol.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");
const constants = require("./constants");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const GenesisProtocolFormulasMock = artifacts.require("./test/GenesisProtocolFormulasMock.sol");

export class GenesisProtocolParams {
  constructor() {
  }
}

const setupGenesisProtocolParams = async function(
                                            testSetup,
                                            precReq=50,
                                            noneBoostedVotePeriodLimit=60,
                                            boostedVotePeriodLimit=60,
                                            scoreThreshold=1,
                                            voteFormulasInterface=0,
                                            minimumStaketingFee=0
                                            ) {
  var genesisProtocolParams = new GenesisProtocolParams();
  await testSetup.genesisProtocol.setParameters(testSetup.org.reputation.address, precReq,noneBoostedVotePeriodLimit,boostedVotePeriodLimit,scoreThreshold,voteFormulasInterface,minimumStaketingFee);
  genesisProtocolParams.paramsHash = await testSetup.genesisProtocol.getParametersHash(testSetup.org.reputation.address, precReq,noneBoostedVotePeriodLimit,boostedVotePeriodLimit,scoreThreshold,voteFormulasInterface,minimumStaketingFee);
  return genesisProtocolParams;
};


const setupOrganization = async function (daoCreator,daoCreatorOwner,founderToken,founderReputation,controller=0) {
  var org = new helpers.Organization();
  var tx = await daoCreator.forgeOrg("testOrg","TEST","TST",daoCreatorOwner,founderToken,founderReputation,controller);
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



const setup = async function (accounts,precReq=50,noneBoostedVotePeriodLimit=60,boostedVotePeriodLimit=60,scoreThreshold=1,voteFormulasInterface=0,minimumStaketingFee=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[0],1000);
   testSetup.genesisProtocol = await GenesisProtocol.new(testSetup.standardTokenMock.address);
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.reputationArray = [20, 10, 70 ];
   testSetup.org = await setupOrganization(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   testSetup.genesisProtocolParams= await setupGenesisProtocolParams(testSetup,precReq ,noneBoostedVotePeriodLimit,boostedVotePeriodLimit,scoreThreshold,voteFormulasInterface,minimumStaketingFee);
   var permissions = "0x0000000F";
   testSetup.executable = await ExecutableTest.new();

   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.genesisProtocol.address],[testSetup.genesisProtocolParams.paramsHash],[permissions]);

   return testSetup;
};

const checkProposalInfo = async function(proposalId, _proposalInfo,genesisProtocol) {
  let proposalInfo;
  proposalInfo = await genesisProtocol.proposals(proposalId);

  // proposalInfo has the following structure
  // address avatar;
  assert.equal(proposalInfo[0], _proposalInfo[0]);
  // uint numOfChoices;
  assert.equal(proposalInfo[1], _proposalInfo[1]);
    // ExecutableInterface executable;
  assert.equal(proposalInfo[2], _proposalInfo[2]);
  // totalVotes
  assert.equal(proposalInfo[3], _proposalInfo[3]);
  // totalStakes
  assert.equal(proposalInfo[4], _proposalInfo[4]);
  // submittedTime
  assert.equal(proposalInfo[5], _proposalInfo[5]);
  //boostedPhaseTime
  assert.equal(proposalInfo[6], _proposalInfo[6]);
    //uint state;
  assert.equal(proposalInfo[7], _proposalInfo[7]);
  //uint winningVote;
  assert.equal(proposalInfo[8], _proposalInfo[8]);
  // - the mapping is simply not returned at all in the array
};

const checkVotesStatus = async function(proposalId, _votesStatus,genesisProtocol){
  let votesStatus;
  votesStatus = await genesisProtocol.votesStatus(proposalId);
  // uint Option 1
  assert.equal(votesStatus[0], _votesStatus[0]);
  // uint Option 2
  assert.equal(votesStatus[1], _votesStatus[1]);
  // uint Option 3
  assert.equal(votesStatus[2], _votesStatus[2]);
  // uint Option 4
  assert.equal(votesStatus[3], _votesStatus[3]);
  // uint Option 5
  assert.equal(votesStatus[4], _votesStatus[4]);
  // uint Option 6
  assert.equal(votesStatus[5], _votesStatus[5]);
  // uint Option 7
  assert.equal(votesStatus[6], _votesStatus[6]);
  // uint Option 8
  assert.equal(votesStatus[7], _votesStatus[7]);
  // uint Option 9
  assert.equal(votesStatus[8], _votesStatus[8]);
  // uint Option 10
  assert.equal(votesStatus[9], _votesStatus[9]);
};

const checkIsVotable = async function(proposalId, _votable,genesisProtocol){
  let votable;

  votable = await genesisProtocol.isVotable(proposalId);
  assert.equal(votable, _votable);
};

const checkVoteInfo = async function(proposalId, voterAddress, _voteInfo, genesisProtocol) {
  let voteInfo;
  voteInfo = await genesisProtocol.voteInfo(proposalId, voterAddress);
  // voteInfo has the following structure
  // int vote;
  assert.equal(voteInfo[0], _voteInfo[0]);
  // uint reputation;
  assert.equal(voteInfo[1], _voteInfo[1]);
};

contract('GenesisProtocol', function (accounts) {

  it("Sanity checks", async function () {
      var testSetup = await setup(accounts);

      //propose a vote
      let tx = await testSetup.genesisProtocol.propose(5, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      var submittedTime = await  web3.eth.getBlock("latest").timestamp;
      await checkProposalInfo(proposalId, [testSetup.org.avatar.address, 5, testSetup.executable.address, 0, 0, submittedTime,0,2,0],testSetup.genesisProtocol);
      await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
      await checkIsVotable(proposalId, true,testSetup.genesisProtocol);
      // now lets vote Option 1 with a minority reputation
      await testSetup.genesisProtocol.vote(proposalId, 1);
      await checkProposalInfo(proposalId, [testSetup.org.avatar.address, 5, testSetup.executable.address, testSetup.reputationArray[0], 0, submittedTime,0,2,1],testSetup.genesisProtocol);
      await checkVoteInfo(proposalId, accounts[0], [1, testSetup.reputationArray[0]],testSetup.genesisProtocol);
      await checkVotesStatus(proposalId, [0, testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
      await checkIsVotable(proposalId, true,testSetup.genesisProtocol);
      // another minority reputation (Option 0):
      await testSetup.genesisProtocol.vote(proposalId, 0, { from: accounts[1] });
      await checkVoteInfo(proposalId, accounts[1], [0, testSetup.reputationArray[1]],testSetup.genesisProtocol);
      await checkProposalInfo(proposalId, [testSetup.org.avatar.address, 5, testSetup.executable.address, (testSetup.reputationArray[0] + testSetup.reputationArray[1]),0, submittedTime,0,2,1],testSetup.genesisProtocol);
      await checkVotesStatus(proposalId, [testSetup.reputationArray[1], testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
      await checkIsVotable(proposalId, true,testSetup.genesisProtocol);
  });

  it("log the NewProposal event on proposing new proposal", async function() {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(6, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewProposal");
    assert.equal(tx.logs[0].args._proposalId, proposalId);
    assert.equal(tx.logs[0].args._proposer, accounts[0]);
    assert.equal(tx.logs[0].args._paramsHash, testSetup.genesisProtocolParams.paramsHash);
  });

  it("log the VoteProposal event on voting ", async function() {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(6, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    let voteTX = await testSetup.genesisProtocol.vote(proposalId, 1);

    assert.equal(voteTX.logs.length, 1);
    assert.equal(voteTX.logs[0].event, "VoteProposal");
    assert.equal(voteTX.logs[0].args._proposalId, proposalId);
    assert.equal(voteTX.logs[0].args._voter, accounts[0]);
    assert.equal(voteTX.logs[0].args._vote, 1);
    assert.equal(voteTX.logs[0].args._reputation, testSetup.reputationArray[0]);
  });

  it("should log the ExecuteProposal event", async function() {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(6, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // now lets vote with a minority reputation
    await testSetup.genesisProtocol.vote(proposalId, 1);

    // the decisive vote is cast now and the proposal will be executed
    tx = await testSetup.genesisProtocol.vote(proposalId, 4, { from: accounts[2] });

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[1].event, "ExecuteProposal");
    assert.equal(tx.logs[1].args._proposalId, proposalId);
    assert.equal(tx.logs[1].args._decision, 4);
  });

  it("should log the ExecuteProposal event after time pass for noneBoostedVotePeriodLimit (decision == 0 )", async function() {
    var testSetup = await setup(accounts,50,2);
    let tx = await testSetup.genesisProtocol.propose(6, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // now lets vote with a minority reputation
    await testSetup.genesisProtocol.vote(proposalId, 1);
    await helpers.increaseTime(3);
    // the decisive vote is cast now and the proposal will be executed
    tx = await testSetup.genesisProtocol.vote(proposalId, 4, { from: accounts[2] });
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ExecuteProposal");
    assert.equal(tx.logs[0].args._proposalId, proposalId);
    assert.equal(tx.logs[0].args._decision, 0);
  });

  it("All options can be voted (0-9)", async function() {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 1
    await testSetup.genesisProtocol.vote(proposalId, 0);
    await checkVoteInfo(proposalId, accounts[0], [0, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);


    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 2
    await testSetup.genesisProtocol.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [1, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 3
    await testSetup.genesisProtocol.vote(proposalId, 2);
    await checkVoteInfo(proposalId, accounts[0], [2, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 4
    await testSetup.genesisProtocol.vote(proposalId, 3);
    await checkVoteInfo(proposalId, accounts[0], [3, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 5
    await testSetup.genesisProtocol.vote(proposalId, 4);
    await checkVoteInfo(proposalId, accounts[0], [4, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, testSetup.reputationArray[0], 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 6
    await testSetup.genesisProtocol.vote(proposalId, 5);
    await checkVoteInfo(proposalId, accounts[0], [5, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, testSetup.reputationArray[0], 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 7
    await testSetup.genesisProtocol.vote(proposalId, 6);
    await checkVoteInfo(proposalId, accounts[0], [6, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, testSetup.reputationArray[0], 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 8
    await testSetup.genesisProtocol.vote(proposalId, 7);
    await checkVoteInfo(proposalId, accounts[0], [7, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, testSetup.reputationArray[0], 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 9
    await testSetup.genesisProtocol.vote(proposalId, 8);
    await checkVoteInfo(proposalId, accounts[0], [8, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, testSetup.reputationArray[0], 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    testSetup = await setup(accounts);
    tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    // Option 10
    await testSetup.genesisProtocol.vote(proposalId, 9);
    await checkVoteInfo(proposalId, accounts[0], [9, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);
  });

  it("cannot re vote", async function() {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.genesisProtocol.vote(proposalId, 0);
    await checkVoteInfo(proposalId, accounts[0], [0, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [testSetup.reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);

    await testSetup.genesisProtocol.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [0, testSetup.reputationArray[0]],testSetup.genesisProtocol);
    await checkVotesStatus(proposalId, [testSetup.reputationArray[0],0, 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);
    await checkIsVotable(proposalId,true,testSetup.genesisProtocol);
  });



  it("Non-existent parameters hash shouldn't work", async function() {
    var testSetup = await setup(accounts);
    await testSetup.genesisProtocol.propose(6, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);

    var paramsHash = await testSetup.genesisProtocol.getParametersHash(helpers.NULL_ADDRESS, 50, 0,0,0,0,0);
    try {
      await testSetup.genesisProtocol.propose(6, paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    paramsHash = await testSetup.genesisProtocol.getParametersHash(helpers.SOME_ADDRESS, 50,0,0,0,0,0);
    try {
      await testSetup.genesisProtocol.propose(6, paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    paramsHash = await testSetup.genesisProtocol.getParametersHash(testSetup.org.reputation.address, 50,0,0,0,0,0);
    try {
      await testSetup.genesisProtocol.propose(6, paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("Invalid percentage required( < 0 || > 100) shouldn't work", async function() {
    try {
      await setup(accounts,150);
      assert(false, "setParameters was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      await setup(accounts,-50);
      assert(false, "setParameters was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("Proposal voting  shouldn't be able after proposal has been executed", async function () {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // After this voting the proposal should be executed
    await testSetup.genesisProtocol.vote(proposalId, 0, {from: accounts[2]});

    // Should not be able to vote because the proposal has been executed
    try {
        await testSetup.genesisProtocol.vote(proposalId, 1, { from: accounts[1] });
        assert(false, "vote was supposed to throw but didn't.");
    } catch (error) {
        helpers.assertVMException(error);
    }

  });

  it("the vote function should behave as expected", async function () {
    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    var submittedTime = await  web3.eth.getBlock("latest").timestamp;
    await checkProposalInfo(proposalId, [testSetup.org.avatar.address, 10, testSetup.executable.address, 0, 0, submittedTime,0,2,0],testSetup.genesisProtocol);

    // lets try to vote by the owner on the behalf of non-existent voters(they do exist but they aren't registered to the reputation system).
    for (var i = 3; i < accounts.length; i++) {
        await testSetup.genesisProtocol.vote(proposalId, 3,{ from: accounts[i] });
    }

    // everything should be 0
    await checkVotesStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],testSetup.genesisProtocol);

  });

  it("Should behave sensibly when voting with an empty reputation system", async function () {
     var testSetup = new helpers.TestSetup();
     testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
     testSetup.genesisProtocol = await GenesisProtocol.new(testSetup.standardTokenMock.address);
     testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
     testSetup.reputationArray = [20, 10, 70 ];
     testSetup.org = await setupOrganization(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
       // Send empty rep system to the genesisProtocol contract
     testSetup.org.reputation = Reputation.at(helpers.NULL_ADDRESS);
     testSetup.genesisProtocolParams= await setupGenesisProtocolParams(testSetup);
     var permissions = "0x0000000F";
     testSetup.executable = await ExecutableTest.new();
     await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.genesisProtocol.address],[testSetup.genesisProtocolParams.paramsHash],[permissions]);

      // Try to propose - an exception should be raised
      try {
        await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
        assert(false, 'Should throw an exception but didn\'t');
      } catch (ex) {
        helpers.assertVMException(ex);
      }
  });

  it("Should behave sensibly without an executable [TODO] execution isn't implemented yet", async function () {

    var testSetup = await setup(accounts);
    try {
        await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, helpers.NULL_ADDRESS);
        assert(false, 'Should throw an exception because no executable is null');
      } catch (ex) {
          helpers.assertVMException(ex);
    }

  });

  it('Proposal with wrong num of options', async function () {
      var testSetup = await setup(accounts);

    // 12 options - max is 10 - exception should be raised
    try {
      await testSetup.genesisProtocol.propose(12, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, 'Tried to create a proposal with 12 options - max is 10');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // -5 options - exception should be raised
    try {
      await testSetup.genesisProtocol.propose(-5, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, 'Tried to create an absolute vote with negative number of options');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // 0 options - exception should be raised
    try {
      await testSetup.genesisProtocol.propose(0, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      assert(false, 'Tried to create an absolute vote with 0 number of options');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it('Test voteWithSpecifiedAmounts - More reputation than I own, negative reputation, etc..', async function () {
      var testSetup = await setup(accounts);
      let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      var proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

    // Vote with the reputation the I own - should work
    await testSetup.genesisProtocol.voteWithSpecifiedAmounts(proposalId, 1, testSetup.reputationArray[0], 0);

    // Vote with more reputation that i own - exception should be raised
    try {
      await testSetup.genesisProtocol.voteWithSpecifiedAmounts(proposalId, 1, (testSetup.reputationArray[1] + 1), 0,{from:accounts[1]});
      assert(false, 'Not enough reputation - voting shouldn\'t work');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Vote with a very big number - exception should be raised
    let BigNumber = require('bignumber.js');
    let bigNum = ((new BigNumber(2)).toPower(254));
    try {
      await testSetup.genesisProtocol.voteWithSpecifiedAmounts(proposalId, 1, bigNum, 0);
      assert(false, 'Voting shouldn\'t work');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("Internal functions can not be called externally", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);


    // Lets try to call internalVote function
    try {
      await testSetup.genesisProtocol.internalVote(proposalId, accounts[0], 1, testSetup.reputationArray[0]);
      assert(false, 'Can\'t call internalVote');
    } catch (ex) {
      helpers.assertInternalFunctionException(ex);
    }
  });

  it("Try to send wrong proposal id to the voting/cancel functions", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // Lets try to call vote with invalid proposal id
    try {
      await testSetup.genesisProtocol.vote('asdsada', 1, {from: accounts[0]});
      assert(false, 'Invalid proposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call voteWithSpecifiedAmounts with invalid proposal id
    try {
      await testSetup.genesisProtocol.voteWithSpecifiedAmounts('asdsada', 1, 1, 1);
      assert(false, 'Invalid proposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call execute with invalid proposal id
    try {
      await testSetup.genesisProtocol.execute('asdsada');
      assert(false, 'Invalid proposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("stake log", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,10);

    tx = await testSetup.genesisProtocol.stake(proposalId,1,10);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Stake");
    assert.equal(tx.logs[0].args._voter, accounts[0]);
    assert.equal(tx.logs[0].args._vote, 1);
    assert.equal(tx.logs[0].args._amount, 10);
  });

  it("stake without approval - fail", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

      try {
        await testSetup.genesisProtocol.stake(proposalId,1,10);
        assert(false, 'stake without approval should revert');
      } catch (ex) {
        helpers.assertVMException(ex);
      }
  });

  it("stake on boosted proposal is not allowed", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);
    //shift proposal to boosted phase
    var proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);
    assert.equal(proposalInfo[4],0);
    assert.equal(proposalInfo[7],2);
    await testSetup.genesisProtocol.vote(proposalId,1);

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
    await testSetup.genesisProtocol.stake(proposalId,1,100);
    proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);

    assert.equal(proposalInfo[4],100); //totalStakes
    assert.equal(proposalInfo[7],3);   //state

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
    //S* POW(R/totalR)
    var score = (100 * (testSetup.reputationArray[0]**2))/((testSetup.reputationArray[0]+testSetup.reputationArray[1]+testSetup.reputationArray[2])**2);
    assert.equal(await testSetup.genesisProtocol.score(proposalId),score);


    await testSetup.genesisProtocol.vote(proposalId, 4, { from: accounts[2] });
    //try to stake on boosted proposal should fail
    tx = await testSetup.genesisProtocol.stake(proposalId,1,10);
    assert.equal(tx.logs.length, 0);

  });

  it("shouldBoost ", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);

    var proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);

    await testSetup.genesisProtocol.vote(proposalId,1);

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
    assert.equal(await testSetup.genesisProtocol.score(proposalId),0);
    await testSetup.genesisProtocol.stake(proposalId,1,100);
    proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);

    assert.equal(proposalInfo[4],100); //totalStakes
    assert.equal(proposalInfo[7],3);   //state

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
    //S* POW(R/totalR)
    var score = (100 * (testSetup.reputationArray[0]**2))/((testSetup.reputationArray[0]+testSetup.reputationArray[1]+testSetup.reputationArray[2])**2);
    assert.equal(await testSetup.genesisProtocol.score(proposalId),score);

  });

  it("proposal score ", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);

    var proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);

    await testSetup.genesisProtocol.vote(proposalId,1);

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
    await testSetup.genesisProtocol.stake(proposalId,1,100);
    proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);

    assert.equal(proposalInfo[4],100); //totalStakes
    assert.equal(proposalInfo[7],3);   //state

    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);

  });

  it("stake on none votable phase should revert ", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,10);
    //vote with majority. state is executed
    await testSetup.genesisProtocol.vote(proposalId, 4, { from: accounts[2] });

    try {
      await testSetup.genesisProtocol.stake(proposalId,1,10);
      assert(false, 'stake on executed phase should revert');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

  });

  it("threshold ", async () => {

    var testSetup = await setup(accounts);
    assert.equal(await testSetup.genesisProtocol.threshold(testSetup.org.avatar.address),1);

  });

  it("redeem ", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);
    await testSetup.genesisProtocol.vote(proposalId,1);
    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
    await testSetup.genesisProtocol.stake(proposalId,1,100);
    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
    await helpers.increaseTime(61);
    await testSetup.genesisProtocol.execute(proposalId);
    var redeemAmount = await testSetup.genesisProtocol.redeemAmount(proposalId,accounts[0]);
    assert.equal(redeemAmount,((100*100)/100));
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),900);
    tx = await testSetup.genesisProtocol.redeem(proposalId);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId, proposalId);
    assert.equal(tx.logs[0].args._beneficiary, accounts[0]);
    assert.equal(tx.logs[0].args._amount, 100);
    assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),1000);
  });

  it("redeem without  execution should revert", async () => {

    var testSetup = await setup(accounts);
    let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
    var proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);
    await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);
    await testSetup.genesisProtocol.vote(proposalId,1);
    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
    await testSetup.genesisProtocol.stake(proposalId,1,100);
    assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
    await testSetup.genesisProtocol.execute(proposalId);
    try {
      await  testSetup.genesisProtocol.redeem(proposalId);
      assert(false, 'redeem before execution should revert');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

    it("genesisProtocolFormulasInterface ", async () => {

      var genesisProtocolFormulasMock = await GenesisProtocolFormulasMock.new();
      var testSetup = await setup(accounts,50,60,60,1,genesisProtocolFormulasMock.address,0);
      let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      var proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);
      await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,100);
      var proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);
      await testSetup.genesisProtocol.vote(proposalId,1);
      assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),false);
      assert.equal(await testSetup.genesisProtocol.score(proposalId),0);
      await testSetup.genesisProtocol.stake(proposalId,1,100);
      proposalInfo = await testSetup.genesisProtocol.proposals(proposalId);
      assert.equal(proposalInfo[4],100); //totalStakes
      assert.equal(proposalInfo[7],3);   //state
      assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
      //S* POW(R/totalR)
      var score = (100 * (testSetup.reputationArray[0]**2))/((testSetup.reputationArray[0]+testSetup.reputationArray[1]+testSetup.reputationArray[2])**2);
      assert.equal(await testSetup.genesisProtocol.score(proposalId),score);
      await helpers.increaseTime(61);
      await testSetup.genesisProtocol.execute(proposalId);
      var redeemAmount = await testSetup.genesisProtocol.redeemAmount(proposalId,accounts[0]);
      assert.equal(redeemAmount,((100*100)/100));
    });

    it("dynamic threshold ", async () => {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.genesisProtocol.address,1000);
      let tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      var proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.equal(await testSetup.genesisProtocol.threshold(testSetup.org.avatar.address),1);
      assert.equal(await testSetup.genesisProtocol.orgBoostedProposalsCnt(testSetup.org.avatar.address),0);
      await testSetup.genesisProtocol.vote(proposalId,1);
      await testSetup.genesisProtocol.stake(proposalId,1,100);
      assert.equal(await testSetup.genesisProtocol.shouldBoost(proposalId),true);
      assert.equal(await testSetup.genesisProtocol.state(proposalId),3);
      assert.equal(await testSetup.genesisProtocol.orgBoostedProposalsCnt(testSetup.org.avatar.address),1);
      assert.equal(await testSetup.genesisProtocol.threshold(testSetup.org.avatar.address),2);
      //set up another proposal
      tx = await testSetup.genesisProtocol.propose(10, testSetup.genesisProtocolParams.paramsHash, testSetup.org.avatar.address, testSetup.executable.address);
      proposalId = await getValueFromLogs(tx, '_proposalId');
      //boost it
      await testSetup.genesisProtocol.vote(proposalId,1);
      await testSetup.genesisProtocol.stake(proposalId,1,100);
      assert.equal(await testSetup.genesisProtocol.state(proposalId),3);
      assert.equal(await testSetup.genesisProtocol.orgBoostedProposalsCnt(testSetup.org.avatar.address),2);
      assert.equal(await testSetup.genesisProtocol.threshold(testSetup.org.avatar.address),5);

      //execute
      await helpers.increaseTime(61);
      await testSetup.genesisProtocol.execute(proposalId);
      assert.equal(await testSetup.genesisProtocol.orgBoostedProposalsCnt(testSetup.org.avatar.address),1);
      assert.equal(await testSetup.genesisProtocol.threshold(testSetup.org.avatar.address),2);

    });
});
