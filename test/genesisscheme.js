const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('GenesisScheme', function(accounts) {
    
    it("founders should get their share", async function() {    
        // create a value system
        var founders = [accounts[0],accounts[1],accounts[2]];
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
        
        var controllerAddress = await genesis.controller();
        var controllerInstance = Controller.at(controllerAddress);
        
        var reputationAddress = await controllerInstance.nativeReputation();
        var reputationInstance = Reputation.at(reputationAddress);
        
        var tokenAddress = await controllerInstance.nativeToken();
        var tokenInstance = MintableToken.at(tokenAddress); 
                                                                                            
        var i;
        for (i = 0 ; i < founders.length ; i++ ) {
           await genesis.collectFoundersShare({'from': founders[i]});
        }
        for (i = 0 ; i < founders.length ; i++ ) {
            let rep = await reputationInstance.reputationOf(founders[i]); 
            // let rep = await genesis.controller.nativeReputation().reputationOf(founders[i]);          
            assert.equal(rep.valueOf(), repForFounders[i], "founders reputation is not as expected");
            
            let balance = await tokenInstance.balanceOf(founders[i]);
            assert.equal(balance.valueOf(), tokenForFounders[i], "founders token is not as expected");
        }
        
        // check non founder
        await genesis.collectFoundersShare({'from': accounts[4]});
        let rep = await reputationInstance.reputationOf(accounts[4]);
        assert.equal(rep.valueOf(), 0, "founders reputation is not as expected");
            
        let balance = await tokenInstance.balanceOf(accounts[4]);
        assert.equal(balance.valueOf(), 0, "founders reputation is not as expected");
         
    });

    it("try to remove genesis scheme", async function() {
        let votingScheme = await SimpleVote.new();
    
        var founders = [accounts[0],accounts[1],accounts[2]];
        var tokenForFounders = [1,2,4];
        var repForFounders = [7,9,12];
        let genesis = await GenesisScheme.new("Shoes factory",
                                              "SHOE",
                                              founders,
                                              tokenForFounders,
                                              repForFounders,
                                              votingScheme.address,
                                              {'start_gas':4700000} );
        
        var genesisAddress = genesis.address; //TODO
        // vote to remove it. The second vote will get majority and throw is expected
        await genesis.proposeScheme(genesisAddress);
        await genesis.voteScheme(genesisAddress, true, {'from': founders[0]});
        var status = await genesis.getVoteStatus(genesisAddress); 
        console.log(status);

        try {
          await genesis.voteScheme(genesisAddress, true, {'from': founders[1]});
          throw 'an error' // make sure that an error is thrown
        } catch(error) {
          assertJump(error);
        }
    });
});