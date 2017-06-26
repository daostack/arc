const helpers = require('./helpers')

const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

contract('UniversalGenesisScheme', function(accounts) {

    it("founders should get their share in reputation and tokens", async function() {    
        // create an organization
        const founders = [accounts[0], accounts[1], accounts[2], accounts[3]];
        const tokenForFounders = [1, 2, 3, 5];
        const repForFounders = [8, 13, 21, 34];
        return
        await helpers.forgeOrganization(this, founders, tokenForFounders, repForFounders)
        
        reputationInstance = Reputation.at(this.controller.nativeReputation());
        tokenInstance = MintableToken.at(this.controller.nativeToken());
                                                                                            
        for (let i = 0 ; i < founders.length ; i++ ) {
            let rep = await reputationInstance.reputationOf(founders[i]); 
            // let rep = await genesis.controller.nativeReputation().reputationOf(founders[i]);          
            assert.equal(rep.valueOf(), repForFounders[i], "founder's reputation is not as expected");
            
            let balance = await this.tokenInstance.balanceOf(founders[i]);
            assert.equal(balance.valueOf(), tokenForFounders[i], "founder's token is not as expected");
        }
        
        // check that a non-founder as no reputation or tokens
        let rep = await reputationInstance.reputationOf(accounts[4]);
        assert.equal(rep.valueOf(), 0, "founders reputation is not as expected");
        let balance = await tokenInstance.balanceOf(accounts[4]);
        assert.equal(balance.valueOf(), 0, "founders reputation is not as expected");
        
    });

});
