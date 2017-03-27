const helpers = require('./helpers')

var SimpleVote = artifacts.require("./SimpleVote.sol");
var SimpleContribution = artifacts.require("./SimpleContribution.sol");


contract('SimpleContribution', function(accounts) {

    it("SimpleContribution scheme -> approve --> submitContribution --> submission fee", async function(){

        let submissionFee = 1;
            
        let founders = [accounts[0],accounts[1]];//,accounts[2]];
        let tokenForFounders = [1,2,4];
        let repForFounders = [7,9,12];
        await helpers.setupController(this, founders, tokenForFounders, repForFounders)
        
        let contributionVotingScheme = await SimpleVote.new();
        let contributionScheme = await SimpleContribution.new(this.controllerAddress,
                                                              submissionFee,
                                                              contributionVotingScheme.address);
        await this.genesis.proposeScheme(contributionScheme.address);
        await this.genesis.voteScheme(contributionScheme.address, true, {from: founders[0]});
        await this.genesis.voteScheme(contributionScheme.address, true, {from: founders[1]});
        
        
        let balance0BeforeSubmission = await this.tokenInstance.balanceOf(founders[0]);
        let reputation0BeforeSubmission = await this.reputationInstance.reputationOf(founders[0]);
        
        // submit contribution - for that need to aprrove token first
        // approve token
        await this.tokenInstance.approve(contributionScheme.address, submissionFee);
        await this.tokenInstance.approve(contributionScheme.address, submissionFee);        
        // submit contribution
        let askedTokens = 5;
        let askedReputation = 55;
        
        // do the first call ofchain in order to get the return value (instead of tx)
        let contributionId = await contributionScheme.submitContribution.call("simple contribution testing",
                                                                              askedTokens,
                                                                              askedReputation,
                                                                              founders[0],
                                                                              {'from':founders[0]});
        // do the same call onchain
        await contributionScheme.submitContribution("simple contribution testing",
                                                    askedTokens,
                                                    askedReputation,
                                                    founders[0],
                                                    {'from':founders[0]});

        // vote on contribution. 2nd founder has majority
        await contributionScheme.voteContribution(contributionId,true,{'from':founders[1]});
        
        // see that submitter was paid
        let balance0AfterSubmission = await this.tokenInstance.balanceOf(founders[0]);
        let reputation0AfterSubmission = await this.reputationInstance.reputationOf(founders[0]);
        
        assert.equal(parseInt(reputation0BeforeSubmission.valueOf()) + parseInt(askedReputation.valueOf()),
                     parseInt(reputation0AfterSubmission.valueOf()),
                     "contributer reputation are not as expected");
        
        
        assert.equal(parseInt(balance0BeforeSubmission.valueOf()) + parseInt(askedTokens) - parseInt(submissionFee),
                     parseInt(balance0AfterSubmission.valueOf()),
                     "contributer tokens are not as expected");                     
    });

});

