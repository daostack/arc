const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('GenesisScheme', function(accounts) {
    
    it("founders should get their share", async function() {    
        // create a value system
        var founders = [accounts[0],accounts[1],accounts[2],accounts[3]];
        var tokenForFounders = [1,2,4,5];
        var repForFounders = [7,9,12,1];
        
        await helpers.setupController(this, founders, tokenForFounders, repForFounders)
                                                                                            
        for (let i = 0 ; i < founders.length ; i++ ) {
            let rep = await this.reputationInstance.reputationOf(founders[i]); 
            // let rep = await genesis.controller.nativeReputation().reputationOf(founders[i]);          
            assert.equal(rep.valueOf(), repForFounders[i], "founders reputation is not as expected");
            
            let balance = await this.tokenInstance.balanceOf(founders[i]);
            assert.equal(balance.valueOf(), tokenForFounders[i], "founders token is not as expected");
        }
        
        // check non founder
        await this.genesis.collectFoundersShare({'from': accounts[4]});
        let rep = await this.reputationInstance.reputationOf(accounts[4]);
        assert.equal(rep.valueOf(), 0, "founders reputation is not as expected");
            
        let balance = await this.tokenInstance.balanceOf(accounts[4]);
        assert.equal(balance.valueOf(), 0, "founders reputation is not as expected");
        
    });

    it("try to remove genesis scheme", async function() {
        let votingScheme = await SimpleVote.new();
    
        let founders = [accounts[0],accounts[1],accounts[2]];
        let tokenForFounders = [1,2,4];
        let repForFounders = [7,9,12];
        await helpers.setupController(this, founders, tokenForFounders, repForFounders)
         
        let genesis = this.genesis;
        var genesisAddress = genesis.address; //TODO
        // vote to remove it. The second vote will get majority and throw is expected
        await genesis.proposeScheme(genesisAddress,{'start_gas':4700000});
        var status = await genesis.getVoteStatus(genesisAddress); 
        
        await genesis.voteScheme(genesisAddress, true, {'from': founders[0],'start_gas':4700000});
        var status = await genesis.getVoteStatus(genesisAddress); 

        var fail = 100;

        try {
          await genesis.voteScheme(genesisAddress, true, {'from': founders[1],'start_gas':4700000});
          throw 'an error' // make sure that an error is thrown
        } catch(error) {
            fail = 200;
        }
        
        assert.equal(fail,200,"vote should fail"); // todo make less ugly
        // note that catch error scheme fails as the failure is in internal contract
    });
});
