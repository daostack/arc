const helpers = require('./helpers');
import { getValueFromLogs } from '../lib/utils.js';

const AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

let reputation, avatar, absoluteVote, executable, accounts, reputationArray;


const setupAbsoluteVote = async function (isOwnedVote) {
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
    await absoluteVote.setParameters(reputation.address, 50, isOwnedVote);

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
  // uint abstain; // total 'no' votes
  assert.equal(proposalInfo[6], _proposalInfo[6]);
  // mapping(address=>Voter) voters;
  // - the mapping is simply not returned at all in the array
  // bool opened; // voting opened flag
  assert.equal(proposalInfo[7], _proposalInfo[7]);
  // bool ended; // voting had executed flag
  assert.equal(proposalInfo[8], _proposalInfo[8]);
};

contract('AbsoluteVote', function (accounts) {

    it("Sanity checks", async function () {
        absoluteVote = await setupAbsoluteVote(true);

        // propose a vote
        const paramsHash = await absoluteVote.getParametersHash(reputation.address, 50, true);
        let tx = await absoluteVote.propose(paramsHash, avatar.address, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, 0, 0, 0, true, false]);

        let voteInfo;

        // now lets vote with a minority reputation
        await absoluteVote.vote(proposalId, 1);
        voteInfo = await absoluteVote.voteInfo(proposalId, accounts[0]);
        assert.equal(voteInfo[0].toNumber(), 1);
        assert.equal(voteInfo[1].toNumber(), reputationArray[0]);
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, 0, true, false]);

        // another minority reputation:
        await absoluteVote.vote(proposalId, 0, { from: accounts[1] });
        voteInfo = await absoluteVote.voteInfo(proposalId, accounts[1]);
        assert.equal(voteInfo[0].toNumber(), 0);
        assert.equal(voteInfo[1].toNumber(), reputationArray[1]);
        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], 0, reputationArray[1], true, false]);


        // the decisive vote is cast now and the proposal will be executed
        tx = await absoluteVote.ownerVote(proposalId, -1, accounts[2]);
        voteInfo = await absoluteVote.voteInfo(proposalId, accounts[2]);
        assert.equal(voteInfo[0].toNumber(), -1);
        assert.equal(voteInfo[1].toNumber(), reputationArray[2]);

        await checkProposalInfo(proposalId, [accounts[0], avatar.address, executable.address, paramsHash, reputationArray[0], reputationArray[2], reputationArray[1], true, true]);
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
    //     // lets try to vote twice from the same address.
    //     await absoluteVote.vote(proposalId, true, accounts[1]);
    //     await absoluteVote.vote(proposalId, true, accounts[1]);
    //     // total 'yes' is supposed to be equal to the voter's reputation, and not doubled (because we tried to vote twice).
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), rep1.toNumber());
    //
    //     // lets try to cancel the previous vote.
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] });
    //     // total 'yes' is supposed to be zero again.
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), 0);
    //
    //     // We are the owner of the poposal, let's try to vote on the behalf of someone else.
    //     await absoluteVote.vote(proposalId, true, accounts[0]);
    //     await absoluteVote.vote(proposalId, true, accounts[1]);
    //     // total 'yes' is supposed to be equal to the voters 0 + 1 reputation
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), rep0.toNumber() + rep1.toNumber());
    //     await absoluteVote.cancelVote(proposalId, accounts[0], { from: accounts[0] }); // Cleaning the vote for the next test.
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.
    //
    //     // lets try to vote on the behalf of someone else without being the proposal owner.
    //     await absoluteVote.vote(proposalId, true, accounts[0], { from: accounts[1] });
    //     // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), rep1);
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.
    //
    //     // lets try to vote with empty address
    //     await absoluteVote.vote(proposalId, true, helpers.NULL_ADDRESS, { from: accounts[1] });
    //     // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), rep1);
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.
    //
    //     // lets try to vote with null address
    //     await absoluteVote.vote(proposalId, true, null, { from: accounts[1] });
    //     // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), rep1);
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.
    //
    //     // lets try to vote with false.
    //     await absoluteVote.vote(proposalId, false, helpers.NULL_ADDRESS, { from: accounts[1] });
    //     // Total 'yes' is supposed to be 0, Total 'no' is supposed to be accounts[1] reputation.
    //     proposalInfo = await absoluteVote.proposals(proposalId);
    //     assert.equal(proposalInfo[4].toNumber(), 0);
    //     assert.equal(proposalInfo[5].toNumber(), rep1);
    //     await absoluteVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.
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
