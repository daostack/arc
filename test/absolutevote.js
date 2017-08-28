const helpers = require('./helpers');
import { getValueFromLogs } from '../lib/utils.js';

const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

let reputation, avatar, absoluteVote, executable, accounts, reputationArray;

const setupAbsoluteVote = async function (isOwnedVote, precReq) {
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
    await absoluteVote.setParameters(reputation.address, precReq, isOwnedVote);

    return absoluteVote;
};

const checkProposalInfo = async function(proposalId, _proposalInfo) {
  let proposalInfo;
  proposalInfo = await absoluteVote.proposals(proposalId);
  // proposalInfo has the following structure
  // address owner;
  assert.equal(proposalInfo[0], _proposalInfo[0]);
  // address avatar;
  assert.equal(proposalInfo[1], _proposalInfo[1]);
  // ExecutableInterface executable;
  assert.equal(proposalInfo[2], _proposalInfo[2]);
  // bytes32 paramsHash;
  assert.equal(proposalInfo[3], _proposalInfo[3]);
  // uint yes; // total 'yes' votes
  assert.equal(proposalInfo[4], _proposalInfo[4]);
  // uint no; // total 'no' votes
  assert.equal(proposalInfo[5], _proposalInfo[5]);
  // uint abstain; // total 'abstain' votes
  assert.equal(proposalInfo[6], _proposalInfo[6]);
  // mapping(address=>Voter) voters;
  // - the mapping is simply not returned at all in the array
  // bool opened; // voting opened flag
  assert.equal(proposalInfo[7], _proposalInfo[7]);
  // bool executed; // voting had executed flag
  assert.equal(proposalInfo[8], _proposalInfo[8]);
};

const checkVoteInfo = async function(proposalId, voterAddress, _voteInfo) {
  let voteInfo;
  voteInfo = await absoluteVote.voteInfo(proposalId, voterAddress);
  // voteInfo has the following structure
  // int vote;
  assert.equal(voteInfo[0], _voteInfo[0]);
  // uint reputation;
  assert.equal(voteInfo[1], _voteInfo[1]);
};

contract('AbsoluteVote', function (accounts) {

    it("Sanity checks", async function () {
        absoluteVote = await setupAbsoluteVote(true, 50);

        // propose a vote
        const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

        // now lets vote with a minority reputation
        await absoluteVote.vote(proposalId, 1);
        await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, 0, true, false]);

        // another minority reputation:
        await absoluteVote.vote(proposalId, 0, { from: accounts[1] });
        await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, reputationArray[1], true, false]);


        // the decisive vote is cast now and the proposal will be executed
        tx = await absoluteVote.ownerVote(proposalId, -1, accounts[2]);
        await checkVoteInfo(proposalId, accounts[2], [-1, reputationArray[2]]);
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], reputationArray[2], reputationArray[1], true, true]);
    });

    it("log the LogNewProposal event on porposing new porposal", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "LogNewProposal");
      assert.equal(tx.logs[0].args._proposalId, proposalId);
      assert.equal(tx.logs[0].args._proposer, accounts[0]);
      assert.equal(tx.logs[0].args._paramsHash, paramsHash);
    });

    it("should log the LogCancelProposal event on canceling a porposal", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      let newtx = await absoluteVote.cancelProposal(proposalId);

      assert.equal(newtx.logs.length, 1);
      assert.equal(newtx.logs[0].event, "LogCancelProposal");
      assert.equal(newtx.logs[0].args._proposalId, proposalId);
    });

    it("should log the LogVoteProposal and LogCancelVoting events on voting and caceling the vote", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

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

    it("should log the LogExecuteProposal event on executing qourum porposal with 'no' decision", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // now lets vote with a minority reputation
      await absoluteVote.vote(proposalId, 1);
      await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, 0, true, false]);

      // another minority reputation:
      await absoluteVote.vote(proposalId, 0, { from: accounts[1] });
      await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, reputationArray[1], true, false]);

      // the decisive vote is cast now and the proposal will be executed
      tx = await absoluteVote.ownerVote(proposalId, -1, accounts[2]);
      await checkVoteInfo(proposalId, accounts[2], [-1, reputationArray[2]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], reputationArray[2], reputationArray[1], true, true]);

      assert.equal(tx.logs.length, 2);
      assert.equal(tx.logs[1].event, "LogExecuteProposal");
      assert.equal(tx.logs[1].args._proposalId, proposalId);
      assert.equal(tx.logs[1].args._decision, -1);
    });

    it("Vote with 'no'", async function() {
        absoluteVote = await setupAbsoluteVote(true, 50);

        // propose a vote
        const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

        // Lets try to vote with 'no'
        await absoluteVote.vote(proposalId, -1);
        await checkVoteInfo(proposalId, accounts[0], [-1, reputationArray[0]]);

        // Total 'no' should be equal to the voter's reputation exactly
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, Number(await reputation.reputationOf(accounts[0])), 0, true, false]);
    });

    it("Vote with 'abstain'", async function() {
        absoluteVote = await setupAbsoluteVote(true, 50);

        // propose a vote
        const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

        // Lets try to vote with 'no'
        await absoluteVote.vote(proposalId, 0);
        await checkVoteInfo(proposalId, accounts[0], [0, reputationArray[0]]);

        // Total 'no' should be equal to the voter's reputation exactly
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, Number(await reputation.reputationOf(accounts[0])), true, false]);
    });

    it("Double vote shouldn't double proposal's 'yes' count", async function() {
        absoluteVote = await setupAbsoluteVote(true, 50);

        // propose a vote
        const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

        // Lets try to vote twice from the same address
        await absoluteVote.vote(proposalId, 1);
        await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
        await absoluteVote.vote(proposalId, 1);
        await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);

        // Total 'yes' should be equal to the voter's reputation exactly, even though we voted twice
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, Number(await reputation.reputationOf(accounts[0])), 0, 0, true, false]);
    });

    it("Vote cancellation should revert proposal's counters", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // Lets try to vote and then cancel our vote
      await absoluteVote.vote(proposalId, 1);
      await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
      await absoluteVote.cancelVote(proposalId);
      await checkVoteInfo(proposalId, accounts[0], [0, 0]);

      // Proposal's counters are supposed to be zero again.
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
    });

    it("As allowOwner is set to true, Vote on the behalf of someone else should work", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // Lets try to vote on the behalf of someone else
      await absoluteVote.ownerVote(proposalId, 1, accounts[1]);
      await checkVoteInfo(proposalId, accounts[1], [1, reputationArray[1]]);

      // Proposal's 'yes' count should be equal to accounts[1] reputation
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[1], 0, 0, true, false]);
    });

    it("As allowOwner is set to false, Vote on the beahlf of someone elase should NOT work", async function() {
      absoluteVote = await setupAbsoluteVote(false, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, false);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // Lets try to vote on the behalf of someone else
      await absoluteVote.ownerVote(proposalId, 1, accounts[1]);

      // The vote should not be counted
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
    });

    it("if the voter is not the proposal's owner, he shouldn't be able to vote on the behalf of someone else", async function () {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // Lets try to vote on the behalf of someone else
      try {
        await absoluteVote.ownerVote(proposalId, 1, accounts[0], {from: accounts[1]});
        assert(false, "ownerVote was supposed to throw but didn't.");
      } catch(error) {
        helpers.assertVMException(error);
      }

      // The vote should not be counted
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
    });

    it("Non-existent parameters hash should'nt work", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);
      var paramsHash;

      // propose a vote
      paramsHash = await absoluteVote.getParametersHash(reputation.address, 70, true);
      try {
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        assert(false, "propose was supposed to throw but didn't.");
      } catch(error) {
        helpers.assertVMException(error);
      }

      paramsHash = await absoluteVote.getParametersHash(helpers.NULL_ADDRESS, 50, true);
      try {
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        assert(false, "propose was supposed to throw but didn't.");
      } catch(error) {
        helpers.assertVMException(error);
      }

      paramsHash = await absoluteVote.getParametersHash(helpers.SOME_ADDRESS, 50, true);
      try {
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        assert(false, "propose was supposed to throw but didn't.");
      } catch(error) {
        helpers.assertVMException(error);
      }

      paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, false);
      try {
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        assert(false, "propose was supposed to throw but didn't.");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("Invalid precentage required( < 0 || > 100) shouldn't work", async function() {
      try {
        absoluteVote = await setupAbsoluteVote(true, 150);
        assert(false, "setParameters(we call it here: test/absolutevote.js:setupAbsoluteVote()) was supposed to throw but didn't.")
      } catch(error) {
        helpers.assertVMException(error);
      }

      try {
        absoluteVote = await setupAbsoluteVote(true, -50);
        assert(false, "setParameters(we call it here: test/absolutevote.js:setupAbsoluteVote()) was supposed to throw but didn't.")
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("Proposal voting or cancelling shouldn't be able after proposal has been executed", async function () {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // After this voting the proposal should be executed
      await absoluteVote.vote(proposalId, -1, {from: accounts[2]});
      await checkVoteInfo(proposalId, accounts[2], [-1, reputationArray[2]]);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, reputationArray[2], 0, true, true]);

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

    it("executeProposal shouldn't set 'bool executed' to true if the proposal hasn't reached majority", async function() {
      absoluteVote = await setupAbsoluteVote(true, 50);

      // propose a vote
      const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
      let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      assert.isOk(proposalId);

      // no one has voted yet at this point
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

      // Lets try to vote and then cancel our vote
      await absoluteVote.vote(proposalId, 1);
      await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);

      // Total 'yes' should be equal to the voter's reputation exactly
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, Number(await reputation.reputationOf(accounts[0])), 0, 0, true, false]);

      await absoluteVote.executeProposal(proposalId);
      await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, Number(await reputation.reputationOf(accounts[0])), 0, 0, true, false]);
    });

    //
    // it("the vote function should behave as expected", async function () {
    //     absoluteVote = await setupAbsoluteVote();
    //
    //     // propose a vote
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //     const proposalId = await getValueFromLogs(tx, '_proposalId');
    //     let proposalInfo;
    //     const rep0 = await reputation.reputationOf(accounts[0]);
    //     const rep1 = await reputation.reputationOf(accounts[1]);
    //     assert.isOk(proposalId);
    //
    //     // lets try to vote by the owner on the behalf of non-existent voters(they do exist but they aren't registered to the reputation system).
    //     for (var i = 3; i < accounts.length; i++) {
    //         await absoluteVote.vote(proposalId, true, accounts[i], { from: accounts[0] });
    //     }
    //     // Total 'yes' and 'no' are supposed to be 0.
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), 0);
    //     assert.equal(proposalInfo[5].toNumber(), 0);
    //
    //     // Let's try to change user voting choice. and also check that if i'ts the same choice, ignore.
    //     await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //     await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //     await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //     await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //     // Total 'yes' supposed to be 0, 'no' supposed to be accounts[1] reputation.
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), 0);
    //     assert.equal(proposalInfo[5].toNumber(), rep1);
    //
    //     // proposalInfo = await absoluteVote.proposals(proposalId);
    //     // console.log("accounts[1] commited reputation: " + await absoluteVote.voteInfo(proposalId, accounts[1]));
    //     //console.log("yes: " + proposalInfo[4] + ", no: " + proposalInfo[5]);
    // });
    //
    //
    // it("shoud behave sensibly when voting with an empty reputation system [TODO]", async function () {
    //     // const accounts = web3.eth.accounts; // Commented to avoid linter error.
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //     // register some parameters
    //     await absoluteVote.setParameters(reputation.address, 50);
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //
    //     await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    // });
    //
    // it("shoud behave sensibly without an executable [TODO]", async function () {
    //
    // });
    //
    // it('log VoteProposal', async function () {
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //
    //     const reps = Math.floor(Math.random() * 49);
    //
    //     await reputation.mint(reps, accounts[1]);
    //
    //     await absoluteVote.setParameters(reputation.address, 50);
    //
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //     const proposalId = tx.logs[0].args._proposalId;
    //
    //     tx = await absoluteVote.vote(proposalId, true, accounts[1]);
    //
    //     assert(tx.logs[0].args._voter == accounts[1]);
    //     assert(tx.logs[0].args._proposalId == proposalId);
    //     assert(tx.logs[0].args._yes == true);
    //     assert(tx.logs[0].args._reputation.toNumber() == reps);
    // });
    //
    // it('double vote "yes" changes nothing', async function () {
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //
    //     await reputation.mint(20, accounts[1]);
    //     await reputation.mint(40, accounts[2]);
    //
    //     await absoluteVote.setParameters(reputation.address, 50);
    //
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //     const proposalId = tx.logs[0].args._proposalId;
    //
    //     await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //
    //     const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //     assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
    //     assert.equal(no1.toNumber(), 0, 'wrong "no" count');
    //     assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //     await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //
    //     const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //     assert.equal(yes1.toNumber(), yes2.toNumber());
    //     assert.equal(no1.toNumber(), no2.toNumber());
    //     assert.equal(ended1.toNumber(), ended2.toNumber());
    // });
    //
    // it('double vote "no" changes nothing', async function () {
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //
    //     await reputation.mint(20, accounts[1]);
    //     await reputation.mint(40, accounts[2]);
    //
    //     await absoluteVote.setParameters(reputation.address, 50);
    //
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //     const proposalId = tx.logs[0].args._proposalId;
    //
    //     await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //
    //     const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //     assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
    //     assert.equal(no1.toNumber(), 20, 'wrong "no" count');
    //     assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //     await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //
    //     const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //     assert.equal(yes1.toNumber(), yes2.toNumber());
    //     assert.equal(no1.toNumber(), no2.toNumber());
    //     assert.equal(ended1.toNumber(), ended2.toNumber());
    // });
    // describe("as _not_ proposal owner - vote for myself", async function () {
    //
    //     it('vote "yes" then vote "no" should register "no"', async function () {
    //         const absoluteVote = await AbsoluteVote.new();
    //         const reputation = await Reputation.new();
    //         const executable = await ExecutableTest.new();
    //
    //         await reputation.mint(20, accounts[1]);
    //         await reputation.mint(40, accounts[2]);
    //
    //         await absoluteVote.setParameters(reputation.address, 50);
    //
    //         const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //         let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //         const proposalId = tx.logs[0].args._proposalId;
    //
    //         await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //
    //         const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
    //         assert.equal(no1.toNumber(), 0, 'wrong "no" count');
    //         assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //         await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //
    //         const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes2.toNumber(), 0, 'wrong "yes" count');
    //         assert.equal(no2.toNumber(), 20, 'wrong "no" count');
    //         assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
    //     });
    //
    //     it('vote "no" then vote "yes" should register "yes"', async function () {
    //         const absoluteVote = await AbsoluteVote.new();
    //         const reputation = await Reputation.new();
    //         const executable = await ExecutableTest.new();
    //
    //         await reputation.mint(20, accounts[1]);
    //         await reputation.mint(40, accounts[2]);
    //
    //         await absoluteVote.setParameters(reputation.address, 50);
    //
    //         const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //         let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //         const proposalId = tx.logs[0].args._proposalId;
    //
    //         await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
    //
    //         const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
    //         assert.equal(no1.toNumber(), 20, 'wrong "no" count');
    //         assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //         await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //
    //         const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes2.toNumber(), 20, 'wrong "yes" count');
    //         assert.equal(no2.toNumber(), 0, 'wrong "no" count');
    //         assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
    //     });
    // });
    //
    // describe("as proposal owner - vote for another user", async function () {
    //     it('vote "yes" then vote "no" should register "no"', async function () {
    //         const absoluteVote = await AbsoluteVote.new();
    //         const reputation = await Reputation.new();
    //         const executable = await ExecutableTest.new();
    //
    //         await reputation.mint(20, accounts[1]);
    //         await reputation.mint(40, accounts[2]);
    //
    //         await absoluteVote.setParameters(reputation.address, 50);
    //
    //         const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //         let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //         const proposalId = tx.logs[0].args._proposalId;
    //
    //         await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[0] });
    //
    //         const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
    //         assert.equal(no1.toNumber(), 0, 'wrong "no" count');
    //         assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //         await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[0] });
    //
    //         const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes2.toNumber(), 0, 'wrong "yes" count');
    //         assert.equal(no2.toNumber(), 20, 'wrong "no" count');
    //         assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
    //     });
    //
    //     it('vote "no" then vote "yes" should register "yes"', async function () {
    //         const absoluteVote = await AbsoluteVote.new();
    //         const reputation = await Reputation.new();
    //         const executable = await ExecutableTest.new();
    //
    //         await reputation.mint(20, accounts[1]);
    //         await reputation.mint(40, accounts[2]);
    //
    //         await absoluteVote.setParameters(reputation.address, 50);
    //
    //         const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //         let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //         const proposalId = tx.logs[0].args._proposalId;
    //
    //         await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[0] });
    //
    //         const [yes1, no1, ended1] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
    //         assert.equal(no1.toNumber(), 20, 'wrong "no" count');
    //         assert.equal(ended1.toNumber(), 0, 'wrong "ended"');
    //
    //         await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[0] });
    //
    //         const [yes2, no2, ended2] = await absoluteVote.voteStatus(proposalId);
    //
    //         assert.equal(yes2.toNumber(), 20, 'wrong "yes" count');
    //         assert.equal(no2.toNumber(), 0, 'wrong "no" count');
    //         assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
    //     });
    // });
    //
    // it('cannot vote for another user', async function () {
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //
    //     await reputation.mint(20, accounts[1]);
    //     await reputation.mint(40, accounts[2]);
    //
    //     await absoluteVote.setParameters(reputation.address, 50);
    //
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //     const proposalId = tx.logs[0].args._proposalId;
    //
    //     try {
    //         await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[2] });
    //         assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
    //     } catch (ex) {
    //         assert(true);
    //     }
    //     try {
    //         await absoluteVote.vote(proposalId, false, accounts[1], { from: accounts[2] });
    //         assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
    //     } catch (ex) {
    //         assert(true);
    //     }
    // });
    //
    // it('cannot cancel vote by another user', async function () {
    //     const absoluteVote = await AbsoluteVote.new();
    //     const reputation = await Reputation.new();
    //     const executable = await ExecutableTest.new();
    //
    //     await reputation.mint(20, accounts[1]);
    //     await reputation.mint(40, accounts[2]);
    //
    //     await absoluteVote.setParameters(reputation.address, 50);
    //
    //     const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50);
    //     let tx = await absoluteVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    //
    //     const proposalId = tx.logs[0].args._proposalId;
    //
    //     await absoluteVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
    //
    //     try {
    //         await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[2] });
    //         assert(false, 'accounts[2] canceled vote by accounts[1] but accounts[2] is not owner');
    //     } catch (ex) {
    //         assert(true);
    //     }
    // });
});
