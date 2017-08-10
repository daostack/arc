const GenesisScheme = artifacts.require('./GenesisScheme.sol');
const GlobalConstraintRegistrar = artifacts.require('./GlobalConstraintRegistrar.sol');

contract('Migrations', async function() {

    it('should have deployed entire DAOStack', async function() {
        // 'deployed()' will throw an error if the contract is not found
        // we test the first and last contract deployed in migrations
        await GenesisScheme.deployed();
        await GlobalConstraintRegistrar.deployed();
    });

});
