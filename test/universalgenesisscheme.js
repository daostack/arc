const helpers = require('./helpers')

var UniversalGenesisScheme = artifacts.require("./UniversalGenesisScheme.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

contract('UniversalGenesisScheme', function(accounts) {

    it("founders should get their share in reputation and tokens", async function() {    
        // create an organization
        const founders = [accounts[0], accounts[1], accounts[2], accounts[3]];
        const tokenForFounders = [1, 2, 3, 5];
        const repForFounders = [8, 13, 21, 34];
        const controller = await helpers.forgeOrganization(this, founders, tokenForFounders, repForFounders)
        
        const reputationAddress = await controller.nativeReputation();
        const reputationInstance = Reputation.at(reputationAddress);
        const tokenAddress = await controller.nativeToken();
        const tokenInstance = MintableToken.at(tokenAddress);
                                                                                            
        for (let i = 0 ; i < founders.length ; i++ ) {
            let rep = await reputationInstance.reputationOf(founders[i]); 
            // let rep = await genesis.controller.nativeReputation().reputationOf(founders[i]);          
            assert.equal(rep.valueOf(), repForFounders[i], "founder's reputation is not as expected");
            
            let balance = await tokenInstance.balanceOf(founders[i]);
            assert.equal(balance.valueOf(), tokenForFounders[i], "founder's token is not as expected");
        }
        
        // check that a non-founder as no reputation or tokens
        let rep = await reputationInstance.reputationOf(accounts[4]);
        assert.equal(rep.valueOf(), 0, "founders reputation is not as expected");
        let balance = await tokenInstance.balanceOf(accounts[4]);
        assert.equal(balance.valueOf(), 0, "founders reputation is not as expected");
        
    });

    // it("setInitialScheme cannot be called by anyone", async function() {    
    //     const universalGenesisScheme = await UniversalGenesisScheme.new()
    //     const controller = await helpers.forgeOrganization(this);

    //     // try {
    //     //     await universalGenesisScheme.setInitialSchemes(controller
    //     //         _registeringScheme, _upgradingScheme, _globalConstraintsScheme,
    //     //         _registeringSchemeParams, _upgradingSchemeParams, _globalConstraintsSchemeParams);
    //     //     throw 'an error';
    //     // } catch(error) {
    //     //     helpers.assertVMException(error)
    //     //     throw error;
    //     // };
 
    // });
   
});
