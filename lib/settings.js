// TODO: these are settings for testing. Need some way to switch to "production settings"
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const SimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const SimpleVote = artifacts.require("./SimpleVote.sol");
const TokenCapGC = artifacts.require("./TokenCapGC.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");

const getSettings = async function(){
  const contributionScheme = await SimpleContributionScheme.deployed();
  const genesisScheme = await GenesisScheme.deployed();
  const globalConstraintRegistrar = await GlobalConstraintRegistrar.deployed();
  const schemeRegistrar = await SchemeRegistrar.deployed();
  const simpleICO = await SimpleICO.deployed();
  const tokenCapGC = await TokenCapGC.deployed();
  const upgradeScheme = await UpgradeScheme.deployed();
  const votingMachine = await SimpleVote.deployed();

  return {
    contributionScheme: contributionScheme.address,
    genesisScheme: genesisScheme.address,
    globalConstraintRegistrar: globalConstraintRegistrar.address,
    schemeRegistrar: schemeRegistrar.address,
    simpleICO: simpleICO.address,
    tokenCapGC: tokenCapGC.address,
    upgradeScheme: upgradeScheme.address,
    votingMachine: votingMachine.address,
  };
};

export { getSettings };
