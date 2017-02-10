const helpers = require('./helpers')
const assertJump = require('./zeppelin-solidity/helpers/assertJump');

contract('TokenSale', function(accounts) {
    
    it("simple scenario - buy tokens", async function() {    
        // create a value system
        let founders = [accounts[0],accounts[1]];//,accounts[2]];
        let tokenForFounders = [1,2,4];
        let repForFounders = [7,9,12];
        
        await helpers.setupController(this, founders, tokenForFounders, repForFounders)

        let tokenSaleScheme = await TokenSale.new(this.controllerAddress);
        let tokenSaleAddress = tokenSaleScheme.address;
                        
        // vote to approve ICO scheme        
        await this.genesis.proposeScheme(tokenSaleAddress,{'start_gas':4700000});
        await this.genesis.voteScheme(tokenSaleAddress, true, {'from': founders[1],'start_gas':4700000});
        
        // buy tokens
        let value = web3.toWei(1, "ether");
        web3.eth.sendTransaction({'from':founders[1], 'to':tokenSaleAddress, 'value': value});

        let controllerBalanceBefore = await web3.eth.getBalance(this.controllerAddress);

        // deploy withdraw scehem
        let withdrawContract = await WithdrawEtherFromOldController.new();
        // vote to approve scheme
        await this.genesis.proposeScheme(withdrawContract.address,{'start_gas':4700000});
        await this.genesis.voteScheme(withdrawContract.address, true, {'from': founders[1],'start_gas':4700000});

        // withdraw ether
        await withdrawContract.withdraw(this.controllerAddress,value,{'from':founders[0],'start_gas':4700000});
                
        let controllerBalanceAfter = await web3.eth.getBalance(this.controllerAddress);
        
        assert.equal(parseInt(controllerBalanceBefore.valueOf()),
                     parseInt(controllerBalanceAfter.valueOf()) + parseInt(value.valueOf()),
                     "Ether was not sent" );
    });
});
