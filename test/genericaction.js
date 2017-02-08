const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('TokenSale', function(accounts) {
    
    it("simple scenario - buy tokens", async function() {    
        // create a value system
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
       
        let controllerAddress = await genesis.controller();
        let controllerInstance = Controller.at(controllerAddress);               
        let tokenSaleScheme = await TokenSale.new(controllerAddress);
        let tokenSaleAddress = tokenSaleScheme.address;
                        
        // vote to approve ICO scheme        
        await genesis.proposeScheme(tokenSaleAddress,{'start_gas':4700000});
        await genesis.voteScheme(tokenSaleAddress, true, {'from': founders[1],'start_gas':4700000});
        
        // buy tokens
        let value = web3.toWei(1, "ether");
        web3.eth.sendTransaction({'from':founders[1], 'to':tokenSaleAddress, 'value': value});

        let controllerBalanceBefore = await web3.eth.getBalance(controllerAddress);

        // deploy withdraw scehem
        let withdrawContract = await WithdrawEtherFromOldController.new();
        // vote to approve scheme
        await genesis.proposeScheme(withdrawContract.address,{'start_gas':4700000});
        await genesis.voteScheme(withdrawContract.address, true, {'from': founders[1],'start_gas':4700000});

        // withdraw ether
        await withdrawContract.withdraw(controllerAddress,value,{'from':founders[0],'start_gas':4700000});
                
        let controllerBalanceAfter = await web3.eth.getBalance(controllerAddress);
        
        
        assert.equal(parseInt(controllerBalanceBefore.valueOf()),
                     parseInt(controllerBalanceAfter.valueOf()) + parseInt(value.valueOf()),
                     "Ether was not sent" );
    });
});
