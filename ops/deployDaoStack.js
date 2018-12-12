const path = require('path');
const DAOstackMigration = require('@daostack/migration');
const { migrationFileLocation } = require('./settings');

async function deployDaoStack (options) {
  let provider;
  if (process.env.ethereum) {
    provider = process.env.ethereum;
  } else {
    provider = 'http://localhost:8545';
  }
  options = {
    // web3 provider url
    provider,
    quiet: true,
    // disable confirmation messages
    force: true,
    // filepath to output the migration results
    output: path.resolve(migrationFileLocation),
    ...options
  };

  // migrate both base and an example DAO
  const migrationResult = await DAOstackMigration.migrate(options); // migrate
  return { options, migrationResult };
}

if (require.main === module) {
  deployDaoStack().catch((err)  => { console.log(err); process.exit(1) })
} else {
  module.exports = deployDaoStack
}
