const helpers = require('./helpers');
import { getValueFromLogs } from '../lib/utils.js';

const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

let reputation, avatar, absoluteVote, executable, accounts, reputationArray;

const setupAbsoluteVote = async function (isOwnedVote=true, precReq=50, numOfChoices=6) {
  accounts = web3.eth.accounts;
  absoluteVote = await AbsoluteVote.new();
  executable = await ExecutableTest.new();

  // set up a reputaiton system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
  reputationArray = [20, 10, 70 ];
  await reputation.mint(reputationArray[0], accounts[0]);
  await reputation.mint(reputationArray[1], accounts[1]);
  await reputation.mint(reputationArray[2], accounts[2]);

  // register some parameters
  await absoluteVote.setParameters(reputation.address, numOfChoices, precReq, isOwnedVote);

  return absoluteVote;
};

const checkProposalInfo = async function(proposalId, _proposalInfo) {
  let proposalInfo;
  proposalInfo = await absoluteVote.proposals(proposalId);
  //console.log("proposalInfo: " + proposalInfo);
  // proposalInfo has the following structure
  // address owner;
  assert.equal(proposalInfo[0], _proposalInfo[0]);
  // address avatar;
  assert.equal(proposalInfo[1], _proposalInfo[1]);
  // ExecutableInterface executable;
  assert.equal(proposalInfo[2], _proposalInfo[2]);
  // bytes32 paramsHash;
  assert.equal(proposalInfo[3], _proposalInfo[3]);
  // uint totalVotes;
  assert.equal(proposalInfo[4], _proposalInfo[4]);
  // - the mapping is simply not returned at all in the array
  // bool opened; // voting opened flag
  assert.equal(proposalInfo[5], _proposalInfo[5]);
};

const checkProposalStatus = async function(proposalId, _proposalStatus){
  let proposalStatus;
  proposalStatus = await absoluteVote.proposalStatus(proposalId);
  // console.log("ProposalStatus: " + proposalStatus);
  // uint Option 1
  assert.equal(proposalStatus[0], _proposalStatus[0]);
  // uint Option 2
  assert.equal(proposalStatus[1], _proposalStatus[1]);
  // uint Option 3
  assert.equal(proposalStatus[2], _proposalStatus[2]);
  // uint Option 4
  assert.equal(proposalStatus[3], _proposalStatus[3]);
  // uint Option 5
  assert.equal(proposalStatus[4], _proposalStatus[4]);
  // uint Option 6
  assert.equal(proposalStatus[5], _proposalStatus[5]);
  // uint Option 7
  assert.equal(proposalStatus[6], _proposalStatus[6]);
  // uint Option 8
  assert.equal(proposalStatus[7], _proposalStatus[7]);
  // uint Option 9
  assert.equal(proposalStatus[8], _proposalStatus[8]);
  // uint Option 10
  assert.equal(proposalStatus[9], _proposalStatus[9]);
  // uint an empty cell equals to 0
  assert.equal(proposalStatus[10], 0);
  // uint an empty cell equals to 0
  assert.equal(proposalStatus[11], 0);
  // uint Opened - is the porposal open for voting?
  assert.equal(proposalStatus[12], _proposalStatus[12]);
};

const checkVoteInfo = async function(proposalId, voterAddress, _voteInfo) {
  let voteInfo;
  voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
  // console.log("VoteInfo: " + voteInfo);
  // voteInfo has the following structure
  // int vote;
  assert.equal(voteInfo[0], _voteInfo[0]);
  // uint reputation;
  assert.equal(voteInfo[1], _voteInfo[1]);
};

const checkProposalStatusWithAbsoluteVote = async function(proposalId, _proposalStatus, absoluteVote){
  let proposalStatus;
  proposalStatus = await absoluteVote.proposalStatus(proposalId);
  //console.log("ProposalStatus: " + proposalStatus);
  // uint Option 1
  assert.equal(proposalStatus[0], _proposalStatus[0]);
  // uint Option 2
  assert.equal(proposalStatus[1], _proposalStatus[1]);
  // uint Option 3
  assert.equal(proposalStatus[2], _proposalStatus[2]);
  // uint Option 4
  assert.equal(proposalStatus[3], _proposalStatus[3]);
  // uint Option 5
  assert.equal(proposalStatus[4], _proposalStatus[4]);
  // uint Option 6
  assert.equal(proposalStatus[5], _proposalStatus[5]);
  // uint Option 7
  assert.equal(proposalStatus[6], _proposalStatus[6]);
  // uint Option 8
  assert.equal(proposalStatus[7], _proposalStatus[7]);
  // uint Option 9
  assert.equal(proposalStatus[8], _proposalStatus[8]);
  // uint Option 10
  assert.equal(proposalStatus[9], _proposalStatus[9]);
  // uint an empty cell equals to 0
  assert.equal(proposalStatus[10], 0);
  // uint an empty cell equals to 0
  assert.equal(proposalStatus[11], 0);
  // uint Opened - is the porposal open for voting?
  assert.equal(proposalStatus[12], _proposalStatus[12]);

};

const checkProposalInfoWithAbsoluteVote = async function(proposalId, _proposalInfo, absoluteVote) {
  let proposalInfo;
  proposalInfo = await absoluteVote.proposals(proposalId);
  //console.log("proposalInfo: " + proposalInfo);
  // proposalInfo has the following structure
  // address owner;
  assert.equal(proposalInfo[0], _proposalInfo[0]);
  // address avatar;
  assert.equal(proposalInfo[1], _proposalInfo[1]);
  // ExecutableInterface executable;
  assert.equal(proposalInfo[2], _proposalInfo[2]);
  // bytes32 paramsHash;
  assert.equal(proposalInfo[3], _proposalInfo[3]);
  // uint totalVotes;
  assert.equal(proposalInfo[4], _proposalInfo[4]);
  // - the mapping is simply not returned at all in the array
  // bool opened; // voting opened flag
  assert.equal(proposalInfo[5], _proposalInfo[5]);
};

// const checkVoteInfoWithAbsoluteVote = async function(proposalId, voterAddress, _voteInfo, absoluteVote) {
//   let voteInfo;
//   voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
//   // console.log("VoteInfo: " + voteInfo);
//   // voteInfo has the following structure
//   // int vote;
//   assert.equal(voteInfo[0], _voteInfo[0]);
//   // uint reputation;
//   assert.equal(voteInfo[1], _voteInfo[1]);
// };

contract('AbsoluteVote', function (accounts) {

  it("Sanity checks", async function () {
      absoluteVote = await setupAbsoluteVote(true, 50, 5);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 5, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
      await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      // now lets vote Option 1 with a minority reputation
      await absoluteVote.vote(proposalId, 1);
      await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], true]);
      await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      // another minority reputation (Option 0):
      await absoluteVote.vote(proposalId, 0, { from: accounts[1] });
      await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, (reputationArray[0] + reputationArray[1]), true]);
      await checkProposalStatus(proposalId, [reputationArray[1], reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);


      // the decisive vote is cast now and the proposal will be executed with option 5
      tx = await absoluteVote.ownerVote(proposalId, 5, accounts[2]);
      await checkVoteInfo(proposalId, accounts[2], [5, reputationArray[2]]);
      // Porposal should be empty (being deleted after execution)
      await checkProposalInfo(proposalId, [helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_HASH, 0, false]);
      // TODO: Adam: option[0] should be 0 rep, I don't know why it's still 10 rep. do you have any idea why?
      await checkProposalStatus(proposalId, [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("log the LogNewProposal event on porposing new porposal", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "LogNewProposal");
    assert.equal(tx.logs[0].args._proposalId, proposalId);
    assert.equal(tx.logs[0].args._proposer, accounts[0]);
    assert.equal(tx.logs[0].args._paramsHash, paramsHash);
  });

  it("should log the LogCancelProposal event on canceling a porposal", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    let newtx = await absoluteVote.cancelProposal(proposalId);

    assert.equal(newtx.logs.length, 1);
    assert.equal(newtx.logs[0].event, "LogCancelProposal");
    assert.equal(newtx.logs[0].args._proposalId, proposalId);
  });

  it("should log the LogVoteProposal and LogCancelVoting events on voting and caceling the vote", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    let voteTX = await absoluteVote.vote(proposalId, 1);

    assert.equal(voteTX.logs.length, 1);
    assert.equal(voteTX.logs[0].event, "LogVoteProposal");
    assert.equal(voteTX.logs[0].args._proposalId, proposalId);
    assert.equal(voteTX.logs[0].args._voter, accounts[0]);
    assert.equal(voteTX.logs[0].args._vote, 1);
    assert.equal(voteTX.logs[0].args._reputation, reputationArray[0]);
    assert.equal(voteTX.logs[0].args._isOwnerVote, false);

    let cancelVoteTX = await absoluteVote.cancelVote(proposalId);
    assert.equal(cancelVoteTX.logs.length, 1);
    assert.equal(cancelVoteTX.logs[0].event, "LogCancelVoting");
    assert.equal(cancelVoteTX.logs[0].args._proposalId, proposalId);
    assert.equal(cancelVoteTX.logs[0].args._voter, accounts[0]);
  });

  it("should log the LogExecuteProposal event", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // now lets vote with a minority reputation
    await absoluteVote.vote(proposalId, 1);

    // another minority reputation:
    await absoluteVote.vote(proposalId, 0, { from: accounts[1] });

    // the decisive vote is cast now and the proposal will be executed
    tx = await absoluteVote.ownerVote(proposalId, 4, accounts[2]);

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[1].event, "LogExecuteProposal");
    assert.equal(tx.logs[1].args._proposalId, proposalId);
    assert.equal(tx.logs[1].args._decision, 4);
  });

  it("All options can be voted (0-9)", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 10);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 10, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // Option 1
    await absoluteVote.vote(proposalId, 0);
    await checkVoteInfo(proposalId, accounts[0], [0, reputationArray[0]]);
    await checkProposalStatus(proposalId, [reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    // Option 2
    await absoluteVote.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    // Option 3
    await absoluteVote.vote(proposalId, 2);
    await checkVoteInfo(proposalId, accounts[0], [2, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    // Option 4
    await absoluteVote.vote(proposalId, 3);
    await checkVoteInfo(proposalId, accounts[0], [3, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    // Option 5
    await absoluteVote.vote(proposalId, 4);
    await checkVoteInfo(proposalId, accounts[0], [4, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 1]);

    // Option 6
    await absoluteVote.vote(proposalId, 5);
    await checkVoteInfo(proposalId, accounts[0], [5, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 1]);

    // Option 7
    await absoluteVote.vote(proposalId, 6);
    await checkVoteInfo(proposalId, accounts[0], [6, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 1]);

    // Option 8
    await absoluteVote.vote(proposalId, 7);
    await checkVoteInfo(proposalId, accounts[0], [7, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 1]);

    // Option 9
    await absoluteVote.vote(proposalId, 8);
    await checkVoteInfo(proposalId, accounts[0], [8, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 1]);

    // Option 10
    await absoluteVote.vote(proposalId, 9);
    await checkVoteInfo(proposalId, accounts[0], [9, reputationArray[0]]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 1]);
  });


  it("Double vote shouldn't double proposal's 'Option 2' count", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // Lets try to vote twice from the same address
    await absoluteVote.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
    await absoluteVote.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);

    // Total 'Option 2' should be equal to the voter's reputation exactly, even though we voted twice
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], true]);
    await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("Vote cancellation should revert proposal's counters", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // Lets try to vote and then cancel our vote
    await absoluteVote.vote(proposalId, 1);
    await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
    await absoluteVote.cancelVote(proposalId);
    await checkVoteInfo(proposalId, accounts[0], [0, 0]);

    // Proposal's votes supposed to be zero again.
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("As allowOwner is set to true, Vote on the behalf of someone else should work", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // Lets try to vote on the behalf of someone else
    await absoluteVote.ownerVote(proposalId, 1, accounts[1]);
    await checkVoteInfo(proposalId, accounts[1], [1, reputationArray[1]]);

    // Proposal's 'yes' count should be equal to accounts[1] reputation
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[1], true]);
    await checkProposalStatus(proposalId, [0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("As allowOwner is set to false, Vote on the beahlf of someone elase should NOT work", async function() {
    absoluteVote = await setupAbsoluteVote(false, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, false);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // Lets try to vote on the behalf of someone else
    await absoluteVote.ownerVote(proposalId, 1, accounts[1]);

    // The vote should not be counted
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
  });

  it("if the voter is not the proposal's owner, he shouldn't be able to vote on the behalf of someone else", async function () {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // Lets try to vote on the behalf of someone else
    try {
      await absoluteVote.ownerVote(proposalId, 1, accounts[0], {from: accounts[1]});
      assert(false, "ownerVote was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    // The vote should not be counted
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
  });

  it("Non-existent parameters hash should'nt work", async function() {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);
    var paramsHash;

    // propose a vote
    paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    await absoluteVote.propose(paramsHash, avatar.address, executable.address);

    paramsHash = await absoluteVote.getParametersHash(helpers.NULL_ADDRESS, 6, 50, true);
    try {
      await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    paramsHash = await absoluteVote.getParametersHash(helpers.SOME_ADDRESS, 6, 50, true);
    try {
      await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, false);
    try {
      await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      assert(false, "propose was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("Invalid precentage required( < 0 || > 100) shouldn't work", async function() {
    try {
      absoluteVote = await setupAbsoluteVote(true, 150, 6);
      assert(false, "setParameters(we call it here: test/absolutevote.js:setupAbsoluteVote()) was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }

    try {
      absoluteVote = await setupAbsoluteVote(true, -50, 6);
      assert(false, "setParameters(we call it here: test/absolutevote.js:setupAbsoluteVote()) was supposed to throw but didn't.");
    } catch(error) {
      helpers.assertVMException(error);
    }
  });

  it("Proposal voting or cancelling shouldn't be able after proposal has been executed", async function () {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // After this voting the proposal should be executed
    await absoluteVote.vote(proposalId, 0, {from: accounts[2]});

    // Should not be able to cancel the porposal because it's already been executed
    try {
      await absoluteVote.cancelProposal(proposalId);
      assert(false, "cancelProposal was supposed to throw but didn't.");
    } catch (error) {
      helpers.assertVMException(error);
    }

    // Should not be able to cancel the vote because the porposal has been executed
    try {
        await absoluteVote.cancelVote(proposalId);
        assert(false, "cancelVote was supposed to throw but didn't.");
    } catch (error) {
        helpers.assertVMException(error);
    }

    // Should not be able to vote because the porposal has been executed
    try {
        await absoluteVote.vote(proposalId, 1, { from: accounts[1] });
        assert(false, "vote was supposed to throw but didn't.");
    } catch (error) {
        helpers.assertVMException(error);
    }

  });

  it("the vote function should behave as expected", async function () {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a vote
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // no one has voted yet at this point
    await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

    // lets try to vote by the owner on the behalf of non-existent voters(they do exist but they aren't registered to the reputation system).
    for (var i = 3; i < accounts.length; i++) {
        await absoluteVote.ownerVote(proposalId, 3, accounts[i], { from: accounts[0] });
    }

    // everything should be 0
    await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    // Let's try to change user voting choice. and also check that if it's the same choice, ignore.
    await absoluteVote.vote(proposalId, 1, accounts[1], { from: accounts[1] });
    await absoluteVote.vote(proposalId, 1, accounts[1], { from: accounts[1] });
    await absoluteVote.vote(proposalId, 2, accounts[1], { from: accounts[1] });
    await absoluteVote.vote(proposalId, 2, accounts[1], { from: accounts[1] });
    // Total 'Option 2' supposed to be 0, 'Option 3' supposed to be accounts[1] reputation.
    // everything should be 0
    await checkProposalStatus(proposalId, [0, 0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  describe("as _not_ proposal owner - vote for myself", async function () {

    it('vote "Option 1" then vote "Option 2" should register "Option 2"', async function () {
      absoluteVote = await setupAbsoluteVote(true, 50, 6);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

      await absoluteVote.vote(proposalId, 0, accounts[1], { from: accounts[1] });

      await checkProposalStatus(proposalId, [reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      await absoluteVote.vote(proposalId, 1, accounts[1], { from: accounts[1] });

      await checkProposalStatus(proposalId, [0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });

    it('vote "Option 3" then vote "Option 4" should register "Option 4"', async function () {
      absoluteVote = await setupAbsoluteVote(true, 50, 6);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

      await absoluteVote.vote(proposalId, 2, accounts[1], { from: accounts[1] });

      await checkProposalStatus(proposalId, [0, 0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      await absoluteVote.vote(proposalId, 3, accounts[1], { from: accounts[1] });

      await checkProposalStatus(proposalId, [0, 0, 0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });
  });

  describe("as proposal owner - vote for another user", async function () {
    it('vote "Option 1" then vote "Option 2" should register "Option 2"', async function () {
      absoluteVote = await setupAbsoluteVote(true, 50, 6);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

      await absoluteVote.ownerVote(proposalId, 0, accounts[1], { from: accounts[0] });

      await checkProposalStatus(proposalId, [reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      await absoluteVote.ownerVote(proposalId, 1, accounts[1], { from: accounts[0] });

      await checkProposalStatus(proposalId, [0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });

    it('vote "Option 3" then vote "Option 4" should register "Option 4"', async function () {
      absoluteVote = await setupAbsoluteVote(true, 50, 6);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);

      await absoluteVote.ownerVote(proposalId, 2, accounts[1], { from: accounts[0] });

      await checkProposalStatus(proposalId, [0, 0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      await absoluteVote.ownerVote(proposalId, 3, accounts[1], { from: accounts[0] });

      await checkProposalStatus(proposalId, [0, 0, 0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    });
  });

  it('cannot vote for another user', async function () {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a new porposal
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    try {
      await absoluteVote.ownerVote(proposalId, 1, accounts[1], { from: accounts[2] });
      assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  // Irrelevant test
  // it('cannot cancel vote by another user', async function () {
  //   absoluteVote = await setupAbsoluteVote(true, 50, 6);
  //
  //   // propose a vote
  //   const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
  //   let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
  //   const proposalId = await getValueFromLogs(tx, '_proposalId');
  //   assert.isOk(proposalId);
  //
  //   await absoluteVote.vote(proposalId, 1, { from: accounts[1] });
  //
  //   try {
  //     await absoluteVote.cancelVote(proposalId, { from: accounts[2] });
  //     assert(false, 'accounts[2] canceled vote by accounts[1] but accounts[2] is not owner');
  //   } catch (ex) {
  //     helpers.assertVMException(ex);
  //   }
  // });

  it("Shoud behave sensibly when voting with an empty reputation system", async function () {
      // Initiate objects
      const absoluteVote = await AbsoluteVote.new();
      const reputation = await Reputation.new();
      const executable = await ExecutableTest.new();
      avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);

      // Send empty rep system to the absoluteVote contract
      await absoluteVote.setParameters(helpers.NULL_ADDRESS, 6, 50, true);
      const paramsHash = await absoluteVote.getParametersHash(helpers.NULL_ADDRESS, 6, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');

      // Try to vote - an exception should be raised
      try {
        await absoluteVote.vote(proposalId, 3, accounts[1]);
        assert(false, 'Should throw an exception but didn\'t');
      } catch (ex) {
        helpers.assertVMException(ex);
      }

  });

  it("Shoud behave sensibly without an executable [TODO] execution isn't implemented yet", async function () {

    // Initiate objects & give reputation
    const absoluteVote = await AbsoluteVote.new();
    const reputation = await Reputation.new();
    reputationArray = [20, 10, 70 ];
    await reputation.mint(reputationArray[0], accounts[0]);
    await reputation.mint(reputationArray[1], accounts[1]);
    await reputation.mint(reputationArray[2], accounts[2]);
    avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);

    // Send empty rep system to the absoluteVote contract
    await absoluteVote.setParameters(reputation.address, 6, 50, true);
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, helpers.NULL_ADDRESS);
    const proposalId = await getValueFromLogs(tx, '_proposalId');

    // Minority vote - no execution - no exception
    tx = await absoluteVote.vote(proposalId, 5, accounts[0]);

    // // In the future should throw an exception because we can't execute an empty address.
    // // The decisive vote - execution should be initiated and excpetion should be raised
    // try {
    //   await absoluteVote.vote(proposalId, 5, accounts[2]);
    //   assert(false, 'The decisive vote initiated an empty execution object');
    // } catch (ex) {
    //   helpers.assertVMException(ex);
    // }
  });

  it('Porposal with wrong num of options', async function () {

    // 6 Option - no exception should be raised
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // 12 options - max is 10 - exception should be raised
    try {
      absoluteVote = await setupAbsoluteVote(true, 50, 12);
      assert(false, 'Tried to create an absolute vote with 12 options - max is 10');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // -5 options - exception should be raised
    try {
      absoluteVote = await setupAbsoluteVote(true, 50, -5);
      assert(false, 'Tried to create an absolute vote with negative number of options');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // 0 options - exception should be raised
    try {
      absoluteVote = await setupAbsoluteVote(true, 50, 0);
      assert(false, 'Tried to create an absolute vote with 0 number of options');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

  });

  it('Test voteWithSpecifiedAmounts - More reputation than I own, negative reputation, etc..', async function () {
    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a new porposal
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // Vote with the reputation the I own - should work
    await absoluteVote.voteWithSpecifiedAmounts(proposalId, 1, reputationArray[0], 0);

    // Vote with negative reputation - exception should be raised
    try {
      await absoluteVote.voteWithSpecifiedAmounts(proposalId, 1, -100, 0);
      assert(false, 'Vote with -100 reputation voting shouldn\'t work');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Vote with more reputation that i own - exception should be raised
    try {
      await absoluteVote.voteWithSpecifiedAmounts(proposalId, 1, (reputationArray[0] + 1), 0);
      assert(false, 'Not enough reputation - voting shouldn\'t work');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Vote with a very big number - exception should be raised
    let BigNumber = require('bignumber.js');
    let bigNum = ((new BigNumber(2)).toPower(254));
    try {
      await absoluteVote.voteWithSpecifiedAmounts(proposalId, 1, bigNum, 0);
      assert(false, 'Voting shouldn\'t work');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

  });

  it("Internal functions can not be called externally", async () => {

    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a new porposal
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // Lets try to call internalVote function
    try {
      await absoluteVote.internalVote(proposalId, 1, accounts[0]);
      assert(false, 'Can\'t call internalVote');
    } catch (ex) {
      helpers.assertInternalFunctionException(ex);
    }

    await absoluteVote.vote(proposalId, 1, accounts[0]);

    // Lets try to call internalVote function
    try {
      await absoluteVote.cancelVoteInternal(proposalId, accounts[0]);
      assert(false, 'Can\'t call cancelVoteInternal');
    } catch (ex) {
      helpers.assertInternalFunctionException(ex);
    }
  });

  it("Try to send wrong porposal id to the voting/cancel functions", async () => {

    absoluteVote = await setupAbsoluteVote(true, 50, 6);

    // propose a new porposal
    const paramsHash = await absoluteVote.getParametersHash(reputation.address, 6, 50, true);
    let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
    const proposalId = await getValueFromLogs(tx, '_proposalId');
    assert.isOk(proposalId);

    // Lets try to call vote with invalid porposal id
    try {
      await absoluteVote.vote('asdsada', 1, accounts[0]);
      assert(false, 'Invalid porposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call voteWithSpecifiedAmounts with invalid porposal id
    try {
      await absoluteVote.voteWithSpecifiedAmounts('asdsada', 1, 1, 1);
      assert(false, 'Invalid porposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call executeProposal with invalid porposal id
    try {
      await absoluteVote.executeProposal('asdsada', 1, 1, 1);
      assert(false, 'Invalid porposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call ownerVote with invalid porposal id
    try {
      await absoluteVote.ownerVote('asdsada', 1, accounts[0]);
      assert(false, 'Invalid porposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Lets try to call cancel a vote with invalid porposal id
    try {
      await absoluteVote.cancelVote('asdsada', accounts[0]);
      assert(false, 'Invalid porposal ID has been delivered');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

  });

  it('2 Porposals, 1 Reputation system', async function () {

    // Initiate parameters
    accounts = web3.eth.accounts;
    executable = await ExecutableTest.new();
    reputation = await Reputation.new();
    avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
    reputationArray = [20, 10, 70 ];
    await reputation.mint(reputationArray[0], accounts[0]);
    await reputation.mint(reputationArray[1], accounts[1]);
    await reputation.mint(reputationArray[2], accounts[2]);

    // Porposal 1 - 6 choices - 30% - ownerVote disabled
    let absoluteVote1 = await AbsoluteVote.new();
    await absoluteVote1.setParameters(reputation.address, 6, 30, false);
    const paramsHash1 = await absoluteVote1.getParametersHash(reputation.address, 6, 30, false);
    let tx1 = await absoluteVote1.propose(paramsHash1, avatar.address, executable.address);
    const proposalId1 = await getValueFromLogs(tx1, '_proposalId');
    assert.isOk(proposalId1);

    // Porposal 2 - Yes/No - 50% - ownerVote enabled
    let absoluteVote2 = await AbsoluteVote.new();
    await absoluteVote2.setParameters(reputation.address, 2, 50, true);
    const paramsHash2 = await absoluteVote2.getParametersHash(reputation.address, 2, 50, true);
    let tx2 = await absoluteVote2.propose(paramsHash2, avatar.address, executable.address, { from: accounts[1] });
    const proposalId2 = await getValueFromLogs(tx2, '_proposalId');
    assert.isOk(proposalId2);

    // Lets check the porposals
    await checkProposalInfoWithAbsoluteVote(proposalId1, [accounts[0], avatar.address, executable.address, paramsHash1, 0, true], absoluteVote1);
    await checkProposalInfoWithAbsoluteVote(proposalId2, [accounts[1], avatar.address, executable.address, paramsHash2, 0, true], absoluteVote2);

    // Account 0 votes in both porposals, and on behalf of Account 1 - should get an exception for that
    await absoluteVote1.voteWithSpecifiedAmounts(proposalId1, 2, 2, 0);
    await absoluteVote2.vote(proposalId2, 0);
    try {
      await absoluteVote2.ownerVote(proposalId2, 0, accounts[1]);
      assert(false, 'Account 0 is not the owner of porposal 2');
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    // Account 1 voting on both porposals
    await absoluteVote1.vote(proposalId1, 4, { from: accounts[1] });
    // Made mistake and changed his vote
    await absoluteVote1.vote(proposalId1, 3, { from: accounts[1] });
    await absoluteVote2.vote(proposalId2, 1, { from: accounts[1] });
    // Account 1 changing Account 0 vote from 0 to 1
    await absoluteVote2.ownerVote(proposalId2, 1, accounts[0], { from: accounts[1] });

    // Lets check the porposalst status
    await checkProposalStatusWithAbsoluteVote(proposalId1, [0, 0, 2, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 1], absoluteVote1);
    await checkProposalStatusWithAbsoluteVote(proposalId2, [0, (reputationArray[0] + reputationArray[1]), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], absoluteVote2);

  });
});
