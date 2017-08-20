const helpers = require('./helpers');
import { getValueFromLogs } from '../lib/utils.js';

const SimpleVote = artifacts.require("./SimpleVote.sol");
const Reputation = artifacts.require("./Reputation.sol");
const ExecutableTest = artifacts.require("./ExecutableTest.sol");

let reputation, simpleVote, executable, accounts;


const setupSimpleVote = async function () {
    accounts = web3.eth.accounts;
    simpleVote = await SimpleVote.new();
    executable = await ExecutableTest.new();

    // set up a reputaiton system
    reputation = await Reputation.new();
    await reputation.mint(20, accounts[0]);
    await reputation.mint(10, accounts[1]);
    await reputation.mint(70, accounts[2]);

    // register some parameters
    await simpleVote.setParameters(reputation.address, 50);

    return simpleVote;
};


contract('SimpleVote', function (accounts) {

    it("should work", async function () {
        simpleVote = await setupSimpleVote();

        // propose a vote
        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        assert.isOk(proposalId);

        // no one has voted yet at this point
        let proposalInfo, voteInfo;
        proposalInfo = await simpleVote.proposals(proposalId);
        // proposalInfo has the following structure
        // address owner;
        assert.equal(proposalInfo[0], accounts[0]);
        // address avatar;
        assert.equal(proposalInfo[1], helpers.NULL_ADDRESS);
        // ExecutableInterface executable;
        assert.equal(proposalInfo[2], executable.address);
        // bytes32 paramsHash;
        assert.equal(proposalInfo[3], paramsHash);
        // uint yes; // total 'yes' votes
        assert.equal(proposalInfo[4], 0);
        // uint no; // total 'no' votes
        assert.equal(proposalInfo[5], 0);
        // mapping(address=>int) voted; // save the amount of reputation voted by an agent (positive sign is yes, negatice is no);
        // - the mapping is simply not returned at all in the array
        // bool opened; // voting opened flag
        assert.equal(proposalInfo[6], true);
        // bool ended; // voting had ended flag
        assert.equal(proposalInfo[7], false);

        // now lets vote with a minority reputation
        await simpleVote.vote(proposalId, true, accounts[1]);
        const rep1 = await reputation.reputationOf(accounts[1]);
        voteInfo = await simpleVote.voteInfo(proposalId, accounts[1]);
        assert.equal(voteInfo.toNumber(), rep1.toNumber());

        // the decisive vote is cast now and the proposal will be executed
        tx = await simpleVote.vote(proposalId, true, accounts[2]);
        const rep2 = await reputation.reputationOf(accounts[2]);
        voteInfo = await simpleVote.voteInfo(proposalId, accounts[2]);
        assert.equal(voteInfo.toNumber(), rep2.toNumber());

        // this means that the vote is ended now (and decided);
        proposalInfo = await simpleVote.proposals(proposalId);
        // uint yes; // total 'yes' votes
        assert.equal(proposalInfo[4].toNumber(), rep1.toNumber() + rep2.toNumber());
        // uint no; // total 'no' votes
        assert.equal(proposalInfo[5], 0);
        // bool ended; // voting had ended flag
        assert.equal(proposalInfo[7], true);
    });

    it("the vote function should behave as expected", async function () {
        simpleVote = await setupSimpleVote();

        // propose a vote
        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
        const proposalId = await getValueFromLogs(tx, '_proposalId');
        let proposalInfo;
        const rep0 = await reputation.reputationOf(accounts[0]);
        const rep1 = await reputation.reputationOf(accounts[1]);
        assert.isOk(proposalId);

        // lets try to vote twice from the same address.
        await simpleVote.vote(proposalId, true, accounts[1]);
        await simpleVote.vote(proposalId, true, accounts[1]);
        // total 'yes' is supposed to be equal to the voter's reputation, and not doubled (because we tried to vote twice).
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), rep1.toNumber());

        // lets try to cancel the previous vote.
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] });
        // total 'yes' is supposed to be zero again.
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), 0);

        // We are the owner of the poposal, let's try to vote on the behalf of someone else.
        await simpleVote.vote(proposalId, true, accounts[0]);
        await simpleVote.vote(proposalId, true, accounts[1]);
        // total 'yes' is supposed to be equal to the voters 0 + 1 reputation
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), rep0.toNumber() + rep1.toNumber());
        await simpleVote.cancelVote(proposalId, accounts[0], { from: accounts[0] }); // Cleaning the vote for the next test.
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.

        // lets try to vote on the behalf of someone else without being the proposal owner.
        await simpleVote.vote(proposalId, true, accounts[0], { from: accounts[1] });
        // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), rep1);
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.

        // lets try to vote with empty address
        await simpleVote.vote(proposalId, true, helpers.NULL_ADDRESS, { from: accounts[1] });
        // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), rep1);
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.

        // lets try to vote with null address
        await simpleVote.vote(proposalId, true, null, { from: accounts[1] });
        // total 'yes' is supposed to be account 1's reputaton because he's the one who actually voted(he's the sender but not the owner).
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), rep1);
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.

        // lets try to vote with false.
        await simpleVote.vote(proposalId, false, helpers.NULL_ADDRESS, { from: accounts[1] });
        // Total 'yes' is supposed to be 0, Total 'no' is supposed to be accounts[1] reputation.
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), 0);
        assert.equal(proposalInfo[5].toNumber(), rep1);
        await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[1] }); // Cleaning the vote for the next test.

        // lets try to vote by the owner on the behalf of non-existent voters(they do exist but they aren't registered to the reputation system).
        for (var i = 3; i < accounts.length; i++) {
            await simpleVote.vote(proposalId, true, accounts[i], { from: accounts[0] });
        }
        // Total 'yes' and 'no' are supposed to be 0.
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), 0);
        assert.equal(proposalInfo[5].toNumber(), 0);

        // Let's try to change user voting choice. and also check that if i'ts the same choice, ignore.
        await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
        await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });
        await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
        await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });
        // Total 'yes' supposed to be 0, 'no' supposed to be accounts[1] reputation.
        proposalInfo = await simpleVote.proposals(proposalId);
        assert.equal(proposalInfo[4].toNumber(), 0);
        assert.equal(proposalInfo[5].toNumber(), rep1);

        // proposalInfo = await simpleVote.proposals(proposalId);
        // console.log("accounts[1] commited reputation: " + await simpleVote.voteInfo(proposalId, accounts[1]));
        //console.log("yes: " + proposalInfo[4] + ", no: " + proposalInfo[5]);
    });

    it("shoud behave sensibly when voting with an empty reputation system [TODO]", async function () {
        // const accounts = web3.eth.accounts; // Commented to avoid linter error.
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();
        // register some parameters
        await simpleVote.setParameters(reputation.address, 50);
        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);

        await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);
    });

    it("shoud behave sensibly without an executable [TODO]", async function () {

    });

    it('log VoteProposal', async function () {
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();

        const reps = Math.floor(Math.random() * 49);

        await reputation.mint(reps, accounts[1]);

        await simpleVote.setParameters(reputation.address, 50);

        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

        const proposalId = tx.logs[0].args._proposalId;

        tx = await simpleVote.vote(proposalId, true, accounts[1]);

        assert(tx.logs[0].args._voter == accounts[1]);
        assert(tx.logs[0].args._proposalId == proposalId);
        assert(tx.logs[0].args._yes == true);
        assert(tx.logs[0].args._reputation.toNumber() == reps);
    });

    it('double vote "yes" changes nothing', async function () {
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();

        await reputation.mint(20, accounts[1]);
        await reputation.mint(40, accounts[2]);

        await simpleVote.setParameters(reputation.address, 50);

        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

        const proposalId = tx.logs[0].args._proposalId;

        await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });

        const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

        assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
        assert.equal(no1.toNumber(), 0, 'wrong "no" count');
        assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

        await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });

        const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

        assert.equal(yes1.toNumber(), yes2.toNumber());
        assert.equal(no1.toNumber(), no2.toNumber());
        assert.equal(ended1.toNumber(), ended2.toNumber());
    });

    it('double vote "no" changes nothing', async function () {
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();

        await reputation.mint(20, accounts[1]);
        await reputation.mint(40, accounts[2]);

        await simpleVote.setParameters(reputation.address, 50);

        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

        const proposalId = tx.logs[0].args._proposalId;

        await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });

        const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

        assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
        assert.equal(no1.toNumber(), 20, 'wrong "no" count');
        assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

        await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });

        const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

        assert.equal(yes1.toNumber(), yes2.toNumber());
        assert.equal(no1.toNumber(), no2.toNumber());
        assert.equal(ended1.toNumber(), ended2.toNumber());
    });
    describe("as _not_ proposal owner - vote for myself", async function () {

        it('vote "yes" then vote "no" should register "no"', async function () {
            const simpleVote = await SimpleVote.new();
            const reputation = await Reputation.new();
            const executable = await ExecutableTest.new();

            await reputation.mint(20, accounts[1]);
            await reputation.mint(40, accounts[2]);

            await simpleVote.setParameters(reputation.address, 50);

            const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
            let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

            const proposalId = tx.logs[0].args._proposalI;

            await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });

            const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
            assert.equal(no1.toNumber(), 0, 'wrong "no" count');
            assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

            await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });

            const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes2.toNumber(), 0, 'wrong "yes" count');
            assert.equal(no2.toNumber(), 20, 'wrong "no" count');
            assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
        });

        it('vote "no" then vote "yes" should register "yes"', async function () {
            const simpleVote = await SimpleVote.new();
            const reputation = await Reputation.new();
            const executable = await ExecutableTest.new();

            await reputation.mint(20, accounts[1]);
            await reputation.mint(40, accounts[2]);

            await simpleVote.setParameters(reputation.address, 50);

            const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
            let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

            const proposalId = tx.logs[0].args._proposalId;

            await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[1] });

            const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
            assert.equal(no1.toNumber(), 20, 'wrong "no" count');
            assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

            await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });

            const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes2.toNumber(), 20, 'wrong "yes" count');
            assert.equal(no2.toNumber(), 0, 'wrong "no" count');
            assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
        });
    });

    describe("as proposal owner - vote for another user", async function () {
        it('vote "yes" then vote "no" should register "no"', async function () {
            const simpleVote = await SimpleVote.new();
            const reputation = await Reputation.new();
            const executable = await ExecutableTest.new();

            await reputation.mint(20, accounts[1]);
            await reputation.mint(40, accounts[2]);

            await simpleVote.setParameters(reputation.address, 50);

            const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
            let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

            const proposalId = tx.logs[0].args._proposalId;

            await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[0] });

            const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes1.toNumber(), 20, 'wrong "yes" count');
            assert.equal(no1.toNumber(), 0, 'wrong "no" count');
            assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

            await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[0] });

            const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes2.toNumber(), 0, 'wrong "yes" count');
            assert.equal(no2.toNumber(), 20, 'wrong "no" count');
            assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
        });

        it('vote "no" then vote "yes" should register "yes"', async function () {
            const simpleVote = await SimpleVote.new();
            const reputation = await Reputation.new();
            const executable = await ExecutableTest.new();

            await reputation.mint(20, accounts[1]);
            await reputation.mint(40, accounts[2]);

            await simpleVote.setParameters(reputation.address, 50);

            const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
            let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

            const proposalId = tx.logs[0].args._proposalId;

            await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[0] });

            const [yes1, no1, ended1] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes1.toNumber(), 0, 'wrong "yes" count');
            assert.equal(no1.toNumber(), 20, 'wrong "no" count');
            assert.equal(ended1.toNumber(), 0, 'wrong "ended"');

            await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[0] });

            const [yes2, no2, ended2] = await simpleVote.voteStatus(proposalId);

            assert.equal(yes2.toNumber(), 20, 'wrong "yes" count');
            assert.equal(no2.toNumber(), 0, 'wrong "no" count');
            assert.equal(ended2.toNumber(), 0, 'wrong "ended"');
        });
    });

    it('cannot vote for another user', async function () {
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();

        await reputation.mint(20, accounts[1]);
        await reputation.mint(40, accounts[2]);

        await simpleVote.setParameters(reputation.address, 50);

        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

        const proposalId = tx.logs[0].args._proposalId;

        try {
            await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[2] });
            assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
        } catch (ex) {
            assert(true);
        }
        try {
            await simpleVote.vote(proposalId, false, accounts[1], { from: accounts[2] });
            assert(false, 'accounts[2] voted for accounts[1] but accounts[2] is not owner');
        } catch (ex) {
            assert(true);
        }
    });

    it('cannot cancel vote by another user', async function () {
        const simpleVote = await SimpleVote.new();
        const reputation = await Reputation.new();
        const executable = await ExecutableTest.new();

        await reputation.mint(20, accounts[1]);
        await reputation.mint(40, accounts[2]);

        await simpleVote.setParameters(reputation.address, 50);

        const paramsHash = await simpleVote.getParametersHash(reputation.address, 50);
        let tx = await simpleVote.propose(paramsHash, helpers.NULL_ADDRESS, executable.address);

        const proposalId = tx.logs[0].args._proposalId;

        await simpleVote.vote(proposalId, true, accounts[1], { from: accounts[1] });

        try {
            await simpleVote.cancelVote(proposalId, accounts[1], { from: accounts[2] });
            assert(false, 'accounts[2] canceled vote by accounts[1] but accounts[2] is not owner');
        } catch (ex) {
            assert(true);
        }
    });
});
