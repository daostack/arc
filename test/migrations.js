const helpers = require('./helpers')

const UniversalGenesisScheme = artifacts.require('./UniversalGenesisScheme.sol');
const GlobalConstraintRegistrar = artifacts.require('./GlobalConstraintRegistrar.sol');

contract('Migrations', async function(accounts) {

    it('should have deployed entire DAOStack', async function() {    
        // 'deployed()' will throw an error if the contract is not found
        // we test the first and last contract deployed in migrations
        await UniversalGenesisScheme.deployed();
        await GlobalConstraintRegistrar.deployed();
    });

});
