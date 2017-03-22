const helpers = require('./helpers')

var SimpleVote = artifacts.require("./SimpleVote.sol");
var SimpleContribution = artifacts.require("./SimpleContribution.sol");

contract('Proposal to distribute Tokens', function(accounts) {
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
        let askedTokens = 3414 
        let askedReputation = 0
        let contributionId = await contributionScheme.submitContribution.call("Give tokens to beneficiary",
                                                                              askedTokens,
                                                                              askedReputation,
                                                                              beneficiary);
        // do the same call onchain
        await contributionScheme.submitContribution("Give tokens to beneficiary",
                                                    askedTokens,
                                                    askedReputation,
                                                    beneficiary);

        // vote on contribution. 2nd founder has majority
        await contributionScheme.voteContribution(contributionId, true, {'from': this.founders[1]});

        // now the beneficiary should have askedTokens
        let balance0AfterSubmission = await this.tokenInstance.balanceOf(beneficiary);
        // let reputation0AfterSubmission = await this.reputationInstance.reputationOf(founders[0]);
        assert.equal(balance0AfterSubmission, askedTokens)
        return
    })
});
