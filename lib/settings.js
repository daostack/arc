// TODO: these are settings for testing. Need some way to switch to "production settings"
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
import { GlobalConstraintRegistrar } from   '../lib/globalconstraintregistrar.js';
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
// const SoliditySimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");
import { SimpleContributionScheme } from   '../lib/simplecontributionscheme.js';
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
  const simpleVote = await SimpleVote.deployed();

  return {
    votingMachine: simpleVote.address,
    daostackContracts: {
      SimpleContributionScheme: {
        contract: SimpleContributionScheme,
        address: contributionScheme.address,
      },
      GenesisScheme: {
        contract: GenesisScheme,
        address: genesisScheme.address,
      },
      GlobalConstraintRegistrar: {
        contract: GlobalConstraintRegistrar,
        address: globalConstraintRegistrar.address,
      },
      SchemeRegistrar: {
        contract: SchemeRegistrar,
        address: schemeRegistrar.address,
      },
      SimpleICO: {
        contract: SimpleICO,
        address: simpleICO.address,
      },
      TokenCapGC: {
        contract: TokenCapGC,
        address: tokenCapGC.address,
      },
      UpgradeScheme: {
        contract: UpgradeScheme,
        address: upgradeScheme.address,
      },
      SimpleVote: {
        contract: SimpleVote,
        address: simpleVote.address,
      },
    }
  };
};

export { getSettings };
