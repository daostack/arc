const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');


contract('SimpleContribution', function(accounts) {

    it("SimpleContribution scheme -> approve --> submitContribution --> submission fee", async function(){

        let submissionFee = 1;
            
        var founders = [accounts[0],accounts[1]];//,accounts[2]];
        var tokenForFounders = [1,2,4];
        var repForFounders = [7,9,12];
        
        let votingScheme = await SimpleVote.new();
        
        let genesis = await GenesisScheme.new("Shoes factory",
                                              "SHOE",
                                              founders,
                                              tokenForFounders,
                                              repForFounders,
                                              votingScheme.address,
                                              {'start_gas':4700000} );
        
        for (var i = 0 ; i < founders.length ; i++ ) {
           await genesis.collectFoundersShare({'from': founders[i]});
        }
        
        var controllerAddress = await genesis.controller();
        var controllerInstance = Controller.at(controllerAddress);
        
        var reputationAddress = await controllerInstance.nativeReputation();
        var reputationInstance = Reputation.at(reputationAddress);
        
        var tokenAddress = await controllerInstance.nativeToken();
        var tokenInstance = MintableToken.at(tokenAddress); 
        
        let contributionVotingScheme = await SimpleVote.new();
        let contributionScheme = await SimpleContribution.new(controllerAddress,
                                                              submissionFee,
                                                              contributionVotingScheme.address);
        await genesis.proposeScheme(contributionScheme.address);
        await genesis.voteScheme(contributionScheme.address, true, {from: founders[0]});
        await genesis.voteScheme(contributionScheme.address, true, {from: founders[1]});
        
        
        let balance0BeforeSubmission = await tokenInstance.balanceOf(founders[0]);
        let reputation0BeforeSubmission = await reputationInstance.reputationOf(founders[0]);
        
        // submit contribution - for that need to aprrove token first
        // approve token
        await tokenInstance.approve(contributionScheme.address, submissionFee);
        await tokenInstance.approve(contributionScheme.address, submissionFee);        
        // submit contribution
        let askedTokens = 5;
        let askedReputation = 55;
        
        // do the first call ofchain in order to get the return value (instead of tx)
        let contributionId = await contributionScheme.submitContribution.call("simple contribution testing",
                                                                              askedTokens,
                                                                              askedReputation,
                                                                              {'from':founders[0]});
        // do the same call onchain
        await contributionScheme.submitContribution("simple contribution testing",
                                                    askedTokens,
                                                    askedReputation,
                                                    {'from':founders[0]});

        // vote on contribution. 2nd founder has majority
        await contributionScheme.voteContribution(contributionId,true,{'from':founders[1]});
        
        // see that submitter was paid
        let balance0AfterSubmission = await tokenInstance.balanceOf(founders[0]);
        let reputation0AfterSubmission = await reputationInstance.reputationOf(founders[0]);
        
        assert.equal(parseInt(reputation0BeforeSubmission.valueOf()) + parseInt(askedReputation.valueOf()),
                     parseInt(reputation0AfterSubmission.valueOf()),
                     "contributer reputation are not as expected");
        
        
        assert.equal(parseInt(balance0BeforeSubmission.valueOf()) + parseInt(askedTokens) - parseInt(submissionFee),
                     parseInt(balance0AfterSubmission.valueOf()),
                     "contributer tokens are not as expected");                     
    });

});

