const helpers = require('./helpers')

var SimpleVote = artifacts.require("./SimpleVote.sol");
var SimpleContribution = artifacts.require("./SimpleContribution.sol");

contract('Proposal to distribute Reputation', function(accounts) {
    it("should respect basic sanity", async function() {
        let submissionFee = 0;
            
        await helpers.setupController(this)

        // set up a distribution scheme for minting tokens
        let contributionVotingScheme = await SimpleVote.new();
        let contributionScheme = await SimpleContribution.new(
            this.controllerAddress,
            submissionFee,
            contributionVotingScheme.address
            );

        // vote and accept the schema (founders[1] has the majority)
        await this.genesis.proposeScheme(contributionScheme.address);
        await this.genesis.voteScheme(contributionScheme.address, true, {from: this.founders[1]});

        // now we can make a proposal to distribute tokens to beneficiary
        let beneficiary = accounts[4]
        let askedTokens = 0
        let askedReputation = 3415 
        let contributionId = await contributionScheme.submitContribution.call("Give 3415 reputation to accounts[4]",
                                                                              askedTokens,
                                                                              askedReputation,
                                                                              beneficiary);
        // do the same call onchain
        await contributionScheme.submitContribution("Give 3415 reputation to accounts[4]",
                                                    askedTokens,
                                                    askedReputation,
                                                    beneficiary);

        // vote on contribution. 2nd founder has majority
        await contributionScheme.voteContribution(contributionId, true, {'from': this.founders[1]});

        // now the beneficiary should have askedTokens
        let reputation0AfterSubmission = await this.reputationInstance.reputationOf(beneficiary);
        assert.equal(reputation0AfterSubmission, askedReputation)
        return
    })
});
