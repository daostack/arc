// const helpers = require('./helpers');
// import { getValueFromLogs } from '../lib/utils.js';
//
// const QuorumVote = artifacts.require("./QuorumVote.sol");
// const Reputation = artifacts.require("./Reputation.sol");
// const Avatar = artifacts.require("./Avatar.sol");
// const ExecutableTest = artifacts.require("./ExecutableTest.sol");
//
// let reputation, avatar, quorumVote, executable, accounts, reputationArray;
//
//
// const setupQuorumVote = async function (isOwnedVote=true, precReq=50, numOfChoices=6) {
//   accounts = web3.eth.accounts;
//   quorumVote = await QuorumVote.new();
//   executable = await ExecutableTest.new();
//
//   // set up a reputaiton system
//   reputation = await Reputation.new();
//   avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
//   reputationArray = [20, 10, 70 ];
//   await reputation.mint(reputationArray[0], accounts[0]);
//   await reputation.mint(reputationArray[1], accounts[1]);
//   await reputation.mint(reputationArray[2], accounts[2]);
//
//   // register some parameters
//   await quorumVote.setParameters(reputation.address, numOfChoices, precReq, isOwnedVote);
//
//   return quorumVote;
// };
//
// const checkProposalInfo = async function(proposalId, _proposalInfo) {
//   let proposalInfo;
//   proposalInfo = await quorumVote.proposals(proposalId);
//   //console.log("proposalInfo: " + proposalInfo);
//   // proposalInfo has the following structure
//   // address owner;
//   assert.equal(proposalInfo[0], _proposalInfo[0]);
//   // address avatar;
//   assert.equal(proposalInfo[1], _proposalInfo[1]);
//   // ExecutableInterface executable;
//   assert.equal(proposalInfo[2], _proposalInfo[2]);
//   // bytes32 paramsHash;
//   assert.equal(proposalInfo[3], _proposalInfo[3]);
//   // uint totalVotes;
//   assert.equal(proposalInfo[4], _proposalInfo[4]);
//   // - the mapping is simply not returned at all in the array
//   // bool opened; // voting opened flag
//   assert.equal(proposalInfo[5], _proposalInfo[5]);
// };
//
// const checkProposalStatus = async function(proposalId, _proposalStatus){
//   let proposalStatus;
//   proposalStatus = await quorumVote.proposalStatus(proposalId);
//   //console.log("ProposalStatus: " + proposalStatus);
//   // uint Option 1
//   assert.equal(proposalStatus[0], _proposalStatus[0]);
//   // uint Option 2
//   assert.equal(proposalStatus[1], _proposalStatus[1]);
//   // uint Option 3
//   assert.equal(proposalStatus[2], _proposalStatus[2]);
//   // uint Option 4
//   assert.equal(proposalStatus[3], _proposalStatus[3]);
//   // uint Option 5
//   assert.equal(proposalStatus[4], _proposalStatus[4]);
//   // uint Option 6
//   assert.equal(proposalStatus[5], _proposalStatus[5]);
//   // uint Option 7
//   assert.equal(proposalStatus[6], _proposalStatus[6]);
//   // uint Option 8
//   assert.equal(proposalStatus[7], _proposalStatus[7]);
//   // uint Option 9
//   assert.equal(proposalStatus[8], _proposalStatus[8]);
//   // uint Option 10
//   assert.equal(proposalStatus[9], _proposalStatus[9]);
//   // uint an empty cell equals to 0
//   assert.equal(proposalStatus[10], 0);
//   // uint an empty cell equals to 0
//   assert.equal(proposalStatus[11], 0);
//   // uint Opened - is the porposal open for voting?
//   assert.equal(proposalStatus[12], _proposalStatus[12]);
// };
//
// const checkVoteInfo = async function(proposalId, voterAddress, _voteInfo) {
//   let voteInfo;
//   voteInfo = await quorumVote.voteInfo(proposalId, voterAddress);
//   // voteInfo has the following structure
//   // int vote;
//   assert.equal(voteInfo[0], _voteInfo[0]);
//   // uint reputation;
//   assert.equal(voteInfo[1], _voteInfo[1]);
// };
//
// contract('QuorumVote', function (accounts) {
//
//   it("Sanity checks", async function () {
//     quorumVote = await setupQuorumVote(true, 50, 6);
//
//     // propose a vote
//     const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//     let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//     const proposalId = await getValueFromLogs(tx, '_proposalId');
//     assert.isOk(proposalId);
//
//     // no one has voted yet at this point
//     await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//     await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//     // now lets vote Option 1 with a minority reputation
//     await quorumVote.vote(proposalId, 1);
//     await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//     await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], true]);
//     await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//     // another minority reputation (Option 0):
//     await quorumVote.vote(proposalId, 0, { from: accounts[1] });
//     await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
//     await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, (reputationArray[0] + reputationArray[1]), true]);
//     await checkProposalStatus(proposalId, [reputationArray[1], reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//
//     // the decisive vote is cast now and the proposal will be executed with option 5
//     tx = await quorumVote.ownerVote(proposalId, 5, accounts[2]);
//     await checkVoteInfo(proposalId, accounts[2], [5, reputationArray[2]]);
//     // Porposal should be empty (being deleted after execution)
//     await checkProposalInfo(proposalId, [helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_HASH, 0, false]);
//     // TODO: Adam: option[0] should be 0 rep, I don't know why it's still 10 rep. do you have any idea why?
//     await checkProposalStatus(proposalId, [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//   });
//
//     it("Quorum porposals should be executed when reaching the precentage required", async function () {
//
//       // 25% precReq porposal
//       quorumVote = await setupQuorumVote(true, 25, 6);
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 25, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // now lets vote 'Option 0' with 20% of the reputation - should not be executed yet (didn't reach 25%).
//       await quorumVote.vote(proposalId, 0);
//       await checkVoteInfo(proposalId, accounts[0], [0, reputationArray[0]]);
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], true]);
//       await checkProposalStatus(proposalId, [reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // now lets vote 'Option 1' with 10% of the reputation - should be executed with 'Option 0'! (reached 30% and the 'Option 1' is the majority).
//       await quorumVote.vote(proposalId, 1, { from: accounts[1] });
//       await checkVoteInfo(proposalId, accounts[1], [1, reputationArray[1]]);
//       await checkProposalInfo(proposalId, [helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_ADDRESS, helpers.NULL_HASH, 0, false]);
//     });
//
//     it("Invalid inputs shouldn't work (precReq, vote)", async function () {
//
//       // Lets try to create a porposal with precReq=-1
//       try {
//         quorumVote = await setupQuorumVote(true, -1, 6);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // Lets try to create a porposal with precReq=200
//       try {
//         quorumVote = await setupQuorumVote(true, 200, 6);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // Lets try to create a porposal with numOfChoices=99
//       try {
//         quorumVote = await setupQuorumVote(true, 22, 99);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // Lets try to create a porposal with numOfChoices=-1
//       try {
//         quorumVote = await setupQuorumVote(true, 22, -1);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // propose a porposal
//       quorumVote = await setupQuorumVote(true, 3, 6);
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 3, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Lets try to vote with the uint 99 (invalid vote)
//       try {
//         await quorumVote.vote(proposalId, 99);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // Lets try to vote with the -1 (invalid vote)
//       try {
//         await quorumVote.vote(proposalId, -1);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//     });
//
//     it("All options can be voted (0-9)", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 10);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 10, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Option 1
//       await quorumVote.vote(proposalId, 0);
//       await checkVoteInfo(proposalId, accounts[0], [0, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 2
//       await quorumVote.vote(proposalId, 1);
//       await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 3
//       await quorumVote.vote(proposalId, 2);
//       await checkVoteInfo(proposalId, accounts[0], [2, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 4
//       await quorumVote.vote(proposalId, 3);
//       await checkVoteInfo(proposalId, accounts[0], [3, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 5
//       await quorumVote.vote(proposalId, 4);
//       await checkVoteInfo(proposalId, accounts[0], [4, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 6
//       await quorumVote.vote(proposalId, 5);
//       await checkVoteInfo(proposalId, accounts[0], [5, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 0, 1]);
//
//       // Option 7
//       await quorumVote.vote(proposalId, 6);
//       await checkVoteInfo(proposalId, accounts[0], [6, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 0, 1]);
//
//       // Option 8
//       await quorumVote.vote(proposalId, 7);
//       await checkVoteInfo(proposalId, accounts[0], [7, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 0, 1]);
//
//       // Option 9
//       await quorumVote.vote(proposalId, 8);
//       await checkVoteInfo(proposalId, accounts[0], [8, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 0, 1]);
//
//       // Option 10
//       await quorumVote.vote(proposalId, 9);
//       await checkVoteInfo(proposalId, accounts[0], [9, reputationArray[0]]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, reputationArray[0], 0, 0, 1]);
//     });
//
//
//     it("Double vote shouldn't double proposal's 'Option 2' count", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//
//       // Lets try to vote twice from the same address
//       await quorumVote.vote(proposalId, 1);
//       await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//       await quorumVote.vote(proposalId, 1);
//       await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//
//       // Total 'Option 2' should be equal to the voter's reputation exactly, even though we voted twice
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], true]);
//       await checkProposalStatus(proposalId, [0, reputationArray[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//     });
//
//     it("Vote cancellation should revert proposal's counters", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//
//       // Lets try to vote and then cancel our vote
//       await quorumVote.vote(proposalId, 1);
//       await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//       await quorumVote.cancelVote(proposalId);
//       await checkVoteInfo(proposalId, accounts[0], [0, 0]);
//
//       // Proposal's votes supposed to be zero again.
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//       await checkProposalStatus(proposalId, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//     });
//
//     it("As allowOwner is set to true, Vote on the behalf of someone else should work", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//
//       // Lets try to vote on the behalf of someone else
//       await quorumVote.ownerVote(proposalId, 1, accounts[1]);
//       await checkVoteInfo(proposalId, accounts[1], [1, reputationArray[1]]);
//
//       // Proposal's 'yes' count should be equal to accounts[1] reputation
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[1], true]);
//       await checkProposalStatus(proposalId, [0, reputationArray[1], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
//     });
//
//     it("As allowOwner is set to false, Vote on the beahlf of someone elase should NOT work", async function() {
//       let quorumVote = await setupQuorumVote(false, 50, 6);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, false);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//
//       // Lets try to vote on the behalf of someone else
//       await quorumVote.ownerVote(proposalId, 1, accounts[1]);
//
//       // The vote should not be counted
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//     });
//
//     it("if the voter is not the proposal's owner, he shouldn't be able to vote on the behalf of someone else", async function () {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//
//       // Lets try to vote on the behalf of someone else
//       try {
//         await quorumVote.ownerVote(proposalId, 1, accounts[0], {from: accounts[1]});
//         assert(false, "ownerVote was supposed to throw but didn't.");
//       } catch(error) {
//         helpers.assertVMException(error);
//       }
//
//       // The vote should not be counted
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, true]);
//     });
//
//     it("Non-existent parameters hash shouldn't work", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//       var paramsHash;
//
//       // propose a vote
//       paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       await quorumVote.propose(paramsHash, avatar.address, executable.address);
//
//       paramsHash = await quorumVote.getParametersHash(helpers.NULL_ADDRESS, 6, 50, true);
//       try {
//         await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         assert(false, "propose was supposed to throw but didn't.");
//       } catch(error) {
//         helpers.assertVMException(error);
//       }
//
//       paramsHash = await quorumVote.getParametersHash(helpers.SOME_ADDRESS, 6, 50, true);
//       try {
//         await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         assert(false, "propose was supposed to throw but didn't.");
//       } catch(error) {
//         helpers.assertVMException(error);
//       }
//
//       paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, false);
//       try {
//         await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         assert(false, "propose was supposed to throw but didn't.");
//       } catch(error) {
//         helpers.assertVMException(error);
//       }
//     });
//
//     it("Should not able to vote / cancel vote / porposal after porposal has been executed", async function () {
//
//       // propose a vote with precrequired=19%
//       let quorumVote = await setupQuorumVote(true, 19, 6);
//
//       // propose a porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 19, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // After that voting the porposal should be executed
//       await quorumVote.vote(proposalId, 0);
//
//       // Should not be able to cancel the porposal because it's already been executed
//       try {
//         await quorumVote.cancelProposal(proposalId);
//         assert(false, "Can't cancel porposal because it's already been executed.");
//       } catch (error) {
//         helpers.assertVMException(error);
//       }
//
//       // Should not be able to cancel the vote because the porposal has been executed
//       try {
//           await quorumVote.cancelVote(proposalId);
//           assert(false, "Can't cancel vote because porposal already been executed.");
//       } catch (error) {
//           helpers.assertVMException(error);
//       }
//
//       // Should not be able to vote because the porposal has been executed
//       try {
//           await quorumVote.vote(proposalId, 1, { from: accounts[1] });
//           assert(false, "Can't vote because porposal already been executed.");
//       } catch (error) {
//           helpers.assertVMException(error);
//       }
//
//     });
//
//     it("Only the owner of the porposal can cancel it", async function () {
//
//       // propose a vote with precrequired=19%
//       let quorumVote = await setupQuorumVote(true, 19, 6);
//
//       // propose a porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 19, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Account 1 is not the owner of the porposal, he can't cancel it
//       try {
//           await quorumVote.cancelProposal(proposalId, { from: accounts[1] });
//           throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//           helpers.assertVMException(error);
//       }
//
//       // Shouldn't throw an exception because account 0 is the owner of the porposal
//       await quorumVote.cancelProposal(proposalId);
//     });
//
//
//     it("log the LogNewProposal event on porposing new porposal", async function() {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       assert.equal(tx.logs.length, 1);
//       assert.equal(tx.logs[0].event, "LogNewProposal");
//       assert.equal(tx.logs[0].args._proposalId, proposalId);
//       assert.equal(tx.logs[0].args._proposer, accounts[0]);
//       assert.equal(tx.logs[0].args._paramsHash, paramsHash);
//     });
//
//     it("Should log the LogCancelProposal event on canceling a porposal", async () => {
//       quorumVote = await setupQuorumVote();
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       let newtx = await quorumVote.cancelProposal(proposalId);
//
//       assert.equal(newtx.logs.length, 1);
//       assert.equal(newtx.logs[0].event, "LogCancelProposal");
//       assert.equal(newtx.logs[0].args._proposalId, proposalId);
//     });
//
//     it("Should log the LogVoteProposal and LogCancelVoting events on voting and caceling the vote", async () => {
//       quorumVote = await setupQuorumVote();
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       let voteTX = await quorumVote.vote(proposalId, 1);
//
//       assert.equal(voteTX.logs.length, 1);
//       assert.equal(voteTX.logs[0].event, "LogVoteProposal");
//       assert.equal(voteTX.logs[0].args._proposalId, proposalId);
//       assert.equal(voteTX.logs[0].args._voter, accounts[0]);
//       assert.equal(voteTX.logs[0].args._vote, 1);
//       assert.equal(voteTX.logs[0].args._reputation, reputationArray[0]);
//       assert.equal(voteTX.logs[0].args._isOwnerVote, false);
//
//       let cancelVoteTX = await quorumVote.cancelVote(proposalId);
//       assert.equal(cancelVoteTX.logs.length, 1);
//       assert.equal(cancelVoteTX.logs[0].event, "LogCancelVoting");
//       assert.equal(cancelVoteTX.logs[0].args._proposalId, proposalId);
//       assert.equal(cancelVoteTX.logs[0].args._voter, accounts[0]);
//     });
//
//     it("Should log the LogExecuteProposal event on executing qourum porposal with 'no' decision", async () => {
//
//       // propose a porposal with precrequired=19%
//       quorumVote = await setupQuorumVote(true, 19, 6);
//
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 19, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       let voteTX = await quorumVote.vote(proposalId, 0);
//
//       assert.equal(voteTX.logs.length, 2);
//       assert.equal(voteTX.logs[1].event, "LogExecuteProposal");
//       assert.equal(voteTX.logs[1].args._proposalId, proposalId);
//       assert.equal(voteTX.logs[1].args._decision, 0);
//     });
//
//     it('cannot vote for another user', async function () {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a new porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       try {
//         await quorumVote.ownerVote(proposalId, 1, accounts[1], { from: accounts[2] });
//         assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//     });
//
//     it("Shoud behave sensibly when voting with an empty reputation system", async function () {
//         // Initiate objects
//         const quorumVote = await QuorumVote.new();
//         const reputation = await Reputation.new();
//         const executable = await ExecutableTest.new();
//         avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
//
//         // Send empty rep system to the absoluteVote contract
//         await quorumVote.setParameters(helpers.NULL_ADDRESS, 6, 50, true);
//         const paramsHash = await quorumVote.getParametersHash(helpers.NULL_ADDRESS, 6, 50, true);
//         let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         const proposalId = await getValueFromLogs(tx, '_proposalId');
//
//         // Try to vote - an exception should be raised
//         try {
//           await quorumVote.vote(proposalId, 3, accounts[1]);
//           assert(false, 'Should throw an exception but didn\'t');
//         } catch (ex) {
//           helpers.assertVMException(ex);
//         }
//     });
//
//     it("Shoud behave sensibly without an executable [TODO] execution isn't implemented yet", async function () {
//
//       // Initiate objects & give reputation
//       const quorumVote = await QuorumVote.new();
//       const reputation = await Reputation.new();
//       reputationArray = [20, 10, 70 ];
//       await reputation.mint(reputationArray[0], accounts[0]);
//       await reputation.mint(reputationArray[1], accounts[1]);
//       await reputation.mint(reputationArray[2], accounts[2]);
//       avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
//
//       // Send empty rep system to the absoluteVote contract
//       await quorumVote.setParameters(reputation.address, 6, 50, true);
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, helpers.NULL_ADDRESS);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//
//       // Minority vote - no execution - no exception
//       tx = await quorumVote.vote(proposalId, 5, accounts[0]);
//
//       // // In the future should throw an exception because we can't execute an empty address.
//       // // The decisive vote - execution should be initiated and excpetion should be raised
//       // try {
//       //   await absoluteVote.vote(proposalId, 5, accounts[2]);
//       //   assert(false, 'The decisive vote initiated an empty execution object');
//       // } catch (ex) {
//       //   helpers.assertVMException(ex);
//       // }
//     });
//
//     it('Test voteWithSpecifiedAmounts - More reputation than I own, negative reputation, etc..', async function () {
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a new porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Vote with the reputation the I own - should work
//       await quorumVote.voteWithSpecifiedAmounts(proposalId, 1, reputationArray[0], 0);
//
//       // Vote with negative reputation - exception should be raised
//       try {
//         await quorumVote.voteWithSpecifiedAmounts(proposalId, 1, -100, 0);
//         assert(false, 'Vote with -100 reputation voting shouldn\'t work');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Vote with more reputation that i own - exception should be raised
//       try {
//         await quorumVote.voteWithSpecifiedAmounts(proposalId, 1, (reputationArray[0] + 1), 0);
//         assert(false, 'Not enough reputation - voting shouldn\'t work');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Vote with a very big number - exception should be raised
//       let BigNumber = require('bignumber.js');
//       let bigNum = ((new BigNumber(2)).toPower(254));
//       try {
//         await quorumVote.voteWithSpecifiedAmounts(proposalId, 1, bigNum, 0);
//         assert(false, 'Voting shouldn\'t work');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//     });
//
//     it("Internal functions can not be called externally", async () => {
//
//       let quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a new porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Lets try to call internalVote function
//       try {
//         await quorumVote.internalVote(proposalId, 1, accounts[0]);
//         assert(false, 'Can\'t call internalVote');
//       } catch (ex) {
//         helpers.assertInternalFunctionException(ex);
//       }
//
//       await quorumVote.vote(proposalId, 1, accounts[0]);
//
//       // Lets try to call internalVote function
//       try {
//         await quorumVote.cancelVoteInternal(proposalId, accounts[0]);
//         assert(false, 'Can\'t call cancelVoteInternal');
//       } catch (ex) {
//         helpers.assertInternalFunctionException(ex);
//       }
//     });
//
//     it("Try to send wrong porposal id to the voting/cancel functions", async () => {
//
//       quorumVote = await setupQuorumVote(true, 50, 6);
//
//       // propose a new porposal
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 6, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Lets try to call vote with invalid porposal id
//       try {
//         await quorumVote.vote('asdsada', 1, accounts[0]);
//         assert(false, 'Invalid porposal ID has been delivered');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Lets try to call voteWithSpecifiedAmounts with invalid porposal id
//       try {
//         await quorumVote.voteWithSpecifiedAmounts('asdsada', 1, 1, 1);
//         assert(false, 'Invalid porposal ID has been delivered');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Lets try to call executeProposal with invalid porposal id
//       try {
//         await quorumVote.executeProposal('asdsada', 1, 1, 1);
//         assert(false, 'Invalid porposal ID has been delivered');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Lets try to call ownerVote with invalid porposal id
//       try {
//         await quorumVote.ownerVote('asdsada', 1, accounts[0]);
//         assert(false, 'Invalid porposal ID has been delivered');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//       // Lets try to call cancel a vote with invalid porposal id
//       try {
//         await quorumVote.cancelVote('asdsada', accounts[0]);
//         assert(false, 'Invalid porposal ID has been delivered');
//       } catch (ex) {
//         helpers.assertVMException(ex);
//       }
//
//     });
// });
