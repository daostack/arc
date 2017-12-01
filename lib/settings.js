import { requireContract } from './utils.js';

// TODO: these are settings for testing. Need some way to switch to "production settings"
const GenesisScheme = requireContract("GenesisScheme");
import { GlobalConstraintRegistrar } from   './globalconstraintregistrar.js';
import { SchemeRegistrar } from   './schemeregistrar.js';
import { SimpleContributionScheme } from   './simplecontributionscheme.js';
const SimpleICO = requireContract("SimpleICO");
import {AbsoluteVote} from "./absoluteVote.js";
import {TokenCapGC} from "./tokenCapGC.js";
import { UpgradeScheme } from   './upgradescheme.js';

const getSettings = async function(){
  const contributionScheme = await SimpleContributionScheme.deployed();
  const genesisScheme = await GenesisScheme.deployed();
  const globalConstraintRegistrar = await GlobalConstraintRegistrar.deployed();
  const schemeRegistrar = await SchemeRegistrar.deployed();
  const simpleICO = await SimpleICO.deployed();
  const tokenCapGC = await TokenCapGC.deployed();
  const upgradeScheme = await UpgradeScheme.deployed();
  const absoluteVote = await AbsoluteVote.deployed();

  return {
    votingMachine: absoluteVote.address,
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
      AbsoluteVote: {
        contract: AbsoluteVote,
        address: absoluteVote.address,
      }
    }
  };
};

export { getSettings };
