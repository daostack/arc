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
// const setupQuorumVote = async function (isOwnedVote=true, precReq=50) {
//     accounts = web3.eth.accounts;
//     quorumVote = await QuorumVote.new();
//     executable = await ExecutableTest.new();
//
//     // set up a reputaiton system
//     reputation = await Reputation.new();
//     avatar = await Avatar.new('name', helpers.NULL_ADDRESS, reputation.address);
//     reputationArray = [20, 10, 70 ];
//     await reputation.mint(reputationArray[0], accounts[0]);
//     await reputation.mint(reputationArray[1], accounts[1]);
//     await reputation.mint(reputationArray[2], accounts[2]);
//
//     // register some parameters
//     await quorumVote.setParameters(reputation.address, precReq, isOwnedVote);
//
//     return quorumVote;
// };
//
// const checkProposalInfo = async function(proposalId, _proposalInfo) {
//   let proposalInfo;
//   proposalInfo = await quorumVote.proposals(proposalId);
//   // proposalInfo has the following structure
//   // address owner;
//   assert.equal(proposalInfo[0], _proposalInfo[0]);
//   // address avatar;
//   assert.equal(proposalInfo[1], _proposalInfo[1]);
//   // ExecutableInterface executable;
//   assert.equal(proposalInfo[2], _proposalInfo[2]);
//   // bytes32 paramsHash;
//   assert.equal(proposalInfo[3], _proposalInfo[3]);
//   // uint yes; // total 'yes' votes
//   assert.equal(proposalInfo[4], _proposalInfo[4]);
//   // uint no; // total 'no' votes
//   assert.equal(proposalInfo[5], _proposalInfo[5]);
//   // uint abstain; // total 'no' votes
//   assert.equal(proposalInfo[6], _proposalInfo[6]);
//   // mapping(address=>Voter) voters;
//   // - the mapping is simply not returned at all in the array
//   // bool opened; // voting opened flag
//   assert.equal(proposalInfo[7], _proposalInfo[7]);
//   // bool executed; // voting had executed flag
//   assert.equal(proposalInfo[8], _proposalInfo[8]);
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
//     it("Sanity checks", async function () {
//         quorumVote = await setupQuorumVote();
//
//         // propose a vote
//         const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//         let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         const proposalId = await getValueFromLogs(tx, '_proposalId');
//         assert.isOk(proposalId);
//
//         // no one has voted yet at this point
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//         // now lets vote with a minority reputation
//         await quorumVote.vote(proposalId, 1);
//         await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, 0, true, false]);
//
//         // another minority reputation:
//         await quorumVote.vote(proposalId, 0, { from: accounts[1] });
//         await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, reputationArray[1], true, false]);
//
//
//         // the decisive vote is cast now and the proposal will be executed
//         tx = await quorumVote.ownerVote(proposalId, -1, accounts[2]);
//         await checkVoteInfo(proposalId, accounts[2], [-1, reputationArray[2]]);
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], reputationArray[2], reputationArray[1], true, true]);
//     });
//
//     it("Quorum porposals should be executed when reaching the precentage required", async function () {
//
//         // propose a vote with 25% precentage required
//         quorumVote = await setupQuorumVote(true, 25);
//         const paramsHash = await quorumVote.getParametersHash(reputation.address, 25, true);
//         let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         const proposalId = await getValueFromLogs(tx, '_proposalId');
//         assert.isOk(proposalId);
//
//         // no one has voted yet at this point
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//         // now lets vote 'yes' with 20% of the reputation - should not be executed yet (didn't reach 25%).
//         await quorumVote.vote(proposalId, 1);
//         await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, 0, true, false]);
//
//         // now lets vote 'no' with 10% of the reputation - should be executed with 'yes'! (reached 30% and the 'yes' is the majority).
//         await quorumVote.vote(proposalId, 0, { from: accounts[1] });
//         await checkVoteInfo(proposalId, accounts[1], [0, reputationArray[1]]);
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, reputationArray[1], true, true]);
//     });
//
//     it("Invalid inputs shouldn't work (precReq, vote)", async function () {
//
//         // Lets try to create a porposal with precReq=-1
//         try {
//             await setupQuorumVote(true, -1);
//             throw 'an error'; // make sure that an error is thrown
//         } catch (error) {
//             helpers.assertVMException(error);
//         }
//
//         // Lets try to create a porposal with precReq=200
//         try {
//             await setupQuorumVote(true, 200);
//             throw 'an error'; // make sure that an error is thrown
//         } catch (error) {
//             helpers.assertVMException(error);
//         }
//
//         // propose a porposal
//         quorumVote = await setupQuorumVote(true, 50);
//         const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//         let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         const proposalId = await getValueFromLogs(tx, '_proposalId');
//         assert.isOk(proposalId);
//
//         // Lets try to vote with the int 3 (invalid vote)
//         try {
//             await quorumVote.vote(proposalId, 3);
//             throw 'an error'; // make sure that an error is thrown
//         } catch (error) {
//             helpers.assertVMException(error);
//         }
//     });
//
//     it("Double vote shouldn't double proposal's 'yes' count", async function() {
//         quorumVote = await setupQuorumVote();
//
//         // propose a porposal
//         const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//         let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//         const proposalId = await getValueFromLogs(tx, '_proposalId');
//         assert.isOk(proposalId);
//
//         // no one has voted yet at this point
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//         // Lets try to vote twice from the same address
//         await quorumVote.vote(proposalId, 1);
//         await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//         await quorumVote.vote(proposalId, 1);
//         await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//
//         // Total 'yes' should be equal to the voter's reputation exactly, even though we voted twice
//         await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, Number(await reputation.reputationOf(accounts[0])), 0, 0, true, false]);
//     });
//
//     it("Vote cancellation should revert proposal's counters", async function() {
//       quorumVote = await setupQuorumVote();
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//       // Lets try to vote and then cancel our vote
//       await quorumVote.vote(proposalId, 1);
//       await checkVoteInfo(proposalId, accounts[0], [1, reputationArray[0]]);
//       await quorumVote.cancelVote(proposalId);
//       await checkVoteInfo(proposalId, accounts[0], [0, 0]);
//
//       // Proposal's counters are supposed to be zero again.
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//     });
//
//     it("As allowOwner is set to true, Vote on the behalf of someone else should work", async function() {
//       quorumVote = await setupQuorumVote();
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//       // Lets try to vote on the behalf of someone else
//       await quorumVote.ownerVote(proposalId, 1, accounts[1]);
//       await checkVoteInfo(proposalId, accounts[1], [1, reputationArray[1]]);
//
//       // Proposal's 'yes' count should be equal to accounts[1] reputation
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[1], 0, 0, true, false]);
//     });
//
//     it("As allowOwner is set to false, Vote on the beahlf of someone elase should NOT work", async function() {
//       quorumVote = await setupQuorumVote(false);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, false);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//
//       // Lets try to vote on the behalf of someone else
//       await quorumVote.ownerVote(proposalId, 1, accounts[1]);
//
//       // The vote should not be counted
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//     });
//
//     it("if the voter is not the proposal's owner, he shouldn't be able to vote on the behalf of someone else", async function () {
//       quorumVote = await setupQuorumVote(true);
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // no one has voted yet at this point
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
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
//       await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);
//     });
//
//     it("Should not able to vote / cancel vote / porposal after porposal has been executed", async function () {
//
//       // propose a vote with precrequired=19%
//       quorumVote = await setupQuorumVote(true, 19);
//
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 19, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // After that voting the porposal should be executed
//       await quorumVote.vote(proposalId, -1);
//
//       // Should not be able to cancel the porposal because it's already been executed
//       try {
//         await quorumVote.cancelProposal(proposalId);
//         throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//         assert(true);
//       }
//
//       // Should not be able to cancel the vote because the porposal has been executed
//       try {
//           await quorumVote.cancelVote(proposalId);
//           throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//           helpers.assertVMException(error);
//       }
//
//       // Should not be able to vote because the porposal has been executed
//       try {
//           await quorumVote.vote(proposalId, 1, { from: accounts[1] });
//           throw 'an error'; // make sure that an error is thrown
//       } catch (error) {
//           helpers.assertVMException(error);
//       }
//
//     });
//
//     it("Only the owner of the porposal can cancle it", async function () {
//
//       // propose a vote with precrequired=19%
//       quorumVote = await setupQuorumVote(true, 19);
//
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 19, true);
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
//     it("Should log the LogNewProposal event on porposing a new porposal", async () => {
//       quorumVote = await setupQuorumVote();
//
//       // propose a vote
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
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
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
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
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
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
//       quorumVote = await setupQuorumVote(true, 19);
//
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 19, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       let voteTX = await quorumVote.vote(proposalId, -1);
//
//       assert.equal(voteTX.logs.length, 2);
//       assert.equal(voteTX.logs[1].event, "LogExecuteProposal");
//       assert.equal(voteTX.logs[1].args._proposalId, proposalId);
//       assert.equal(voteTX.logs[1].args._decision, -1);
//     });
//
//     it("Internal functions can not be called externally", async () => {
//
//       // propose a porposal
//       quorumVote = await setupQuorumVote(true, 50);
//
//       const paramsHash = await quorumVote.getParametersHash(reputation.address, 50, true);
//       let tx = await quorumVote.propose(paramsHash, avatar.address, executable.address);
//       const proposalId = await getValueFromLogs(tx, '_proposalId');
//       assert.isOk(proposalId);
//
//       // Lets try to call internalVote function
//       try {
//           await quorumVote.internalVote(proposalId, 1, accounts[0]);
//       } catch (ex) {
//           helpers.assertInternalFunctionException(ex);
//       }
//     });
//
//
// });
