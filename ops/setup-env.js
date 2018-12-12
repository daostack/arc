const path = require('path');
const subgraphRepo = path.resolve(`${__dirname}/..`);

async function setupenv () {
  // const provider = 'http://ganach:8545';
  let result
  console.log(`Deploying Daostack contracts`)
  const deployDaoStack = require('./deployDaoStack');
  result = await deployDaoStack();
  console.log(result)
  console.log(`Deployed Daostack contracts, information written to ${result.options.output}`);
  console.log(result.migrationResult)
  console.log(`Generating ABI files`);
  // node ops/generate-abis.js && node ops/generate-schema.js && node ops/generate-subgraph.js
  await require(`../ops/generate-abis`)();

  console.log(`Generating schemas`);
  await require(`${subgraphRepo}/ops/generate-schema`)();

  console.log(`Generating subgraph`);
  await require(`../ops/generate-subgraph`)();

  const cwd = subgraphRepo;
  console.log('Calling graph codegen');
  result = await require(`../ops/graph-codegen`)(cwd);
  console.log(result);

  console.log('Deploying subgraph configuration');
  await require(`${subgraphRepo}/ops/graph-deploy`)();

  console.log('Environment setup finished successfully');
  // deploymentResult[0] is the status code
  // but it is not very helpful, because it returns 0 also on some errors
  // console.log(deploymentResult[0])
}


if (require.main === module) {
  setupenv().catch((err)  => { console.log(err); process.exit(1) })
} else {
  module.exports = setupenv;
}
