// const helpers = require('./helpers')

// var TokenSale = artifacts.require("./TokenSale.sol");


// contract('TokenSale', function(accounts) {
    
//     it("simple scenario - buy tokens", async function() {    
//         // create a value system
//         let founders = [accounts[0],accounts[1]];//,accounts[2]];
//         let tokenForFounders = [1,2,4];
//         let repForFounders = [7,9,12];
        
//         await helpers.setupController(this, founders, tokenForFounders, repForFounders)

//         let tokenSaleScheme = await TokenSale.new(this.controllerAddress);
//         let tokenSaleAddress = tokenSaleScheme.address;
        
//         // buying tokens should fail, because the schema as not been approved yet
//         try {
//             await web3.eth.sendTransaction({'from':founders[1], 'to':tokenSaleAddress, 'value': web3.toWei(1, "ether")})
//             throw 'an error' // make sure that an error is thrown
//         } catch(error) {
//             helpers.assertJumpOrOutOfGas(error)
//         }
        
//         // vote to approve scheme
//         await this.genesis.proposeScheme(tokenSaleAddress);
//         await this.genesis.voteScheme(tokenSaleAddress, true, {'from': founders[1]});
        
//         // buy tokens        
//         web3.eth.sendTransaction({'from':founders[1], 'to':tokenSaleAddress, 'value': web3.toWei(1, "ether")});
        
//         let balance0 = await this.tokenInstance.balanceOf(founders[0]);
//         let balance1 = await this.tokenInstance.balanceOf(founders[1]);
        
//         assert.equal(balance0.valueOf(), tokenForFounders[0], "founder's 0 token is not as expected");
//         assert.equal(balance1.valueOf(), tokenForFounders[1]  + 1000000000000000000, "founder's 1 token is not as expected");
        
//         // remove scheme
//         // vote to remove scheme
//         await this.genesis.proposeScheme(tokenSaleAddress);
//         await this.genesis.voteScheme(tokenSaleAddress, true, {'from': founders[1]});

//         // buying tokens should fail because the scheme has been removed
//         try {
//             await web3.eth.sendTransaction({'from':founders[1], 'to':tokenSaleAddress, 'value': web3.toWei(1, "ether")})
//             throw 'an error' // make sure that an error is thrown
//         } catch(error) {
//             helpers.assertJumpOrOutOfGas(error)
//         }
//         assert.equal(balance0.valueOf(), tokenForFounders[0], "founder's 0 token is not as expected");
//         assert.equal(balance1.valueOf(), tokenForFounders[1]  + 1000000000000000000, "founder's 1 token is not as expected");
//     });
// });
