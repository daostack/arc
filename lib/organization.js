"use strict";
const Controller = artifacts.require("./Controller.sol");
const Avatar = artifacts.require("./Avatar.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const SimpleVote = artifacts.require("./SimpleVote.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");


import { daostack } from './daostack.js';
import { getSettings } from './settings.js';
import { getValueFromLogs } from './utils.js';

export class Organization {
  constructor() {
    // this.controller = Controller.at(controllerAddress);
    // this.avatar = Avatar.at(this.controller.avatar);
  }
}

Organization.new = async function(opts) {
  // TODO: optimization: we now have all sequantial awaits: parallelize them if possible
  let tx;
  const settings = await getSettings();
  console.log(settings);
  // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
  // TODO: orgName, tokenName and tokenSymbol should be required - implement this
  // QUESTION: should we add options to deploy with existing tokens or rep?
  const accounts = web3.eth.accounts;
  const defaults = {
      orgName: null,
      tokenName: null,
      tokenSymbol: null,
      founders: [accounts[0], accounts[1], accounts[2]],
      tokensForFounders: [1, 2, 3],
      repForFounders: [5, 8, 13],
      votePrec: 50,
      genesisScheme: settings.genesisScheme,
      schemeRegistrar: settings.schemeRegistrar,
      upgradeScheme: settings.upgradeScheme,
      globalConstraintRegistrar: settings.globalConstraintRegistrar,
      votingMachine: settings.votingMachine,
  }

  const options = Object.assign({}, defaults, opts);

  // TODO: estimate gas/ether needed based on given options, check balance of sender, and
  // warn if necessary.

  let org = new Organization();
  const genesisScheme = await GenesisScheme.at(options.genesisScheme);

  // const genesisSchemeInst = await GenesisScheme.new();
  tx = await genesisScheme.forgeOrg(
      options.orgName,
      options.tokenName,
      options.tokenSymbol,
      options.founders,
      options.tokensForFounders,
      options.repForFounders,
  );
  // get the address of the avatar from the logs
  org.founders = options.founders;
  const avatarAddress =  getValueFromLogs(tx, '_avatar');
  org.avatar =  await Avatar.at(avatarAddress);

  const controllerAddress = await org.avatar.owner();
  org.controller = await Controller.at(controllerAddress);

  const tokenAddress = await org.controller.nativeToken();
  org.token = DAOToken.at(tokenAddress);

  const reputationAddress = await org.controller.nativeReputation();
  org.reputation = Reputation.at(reputationAddress);

  // TODO: perhaps make the following async functions, to save time?
  // TODO: if they are not lazy, we shoudl parallelize their constructio
  // TODO: error handling (if addresses are not define)
  // TODO: deploy new contracts if addresses are null
  org.schemeRegistrar = SchemeRegistrar.at(options.schemeRegistrar);
  org.upgradeScheme = UpgradeScheme.at(options.upgradeScheme);
  org.globalConstraintRegistrar = GlobalConstraintRegistrar.at(options.globalConstraintRegistrar);
  org.votingMachine = SimpleVote.at(options.votingMachine);

  const voteParametersHash = await org.votingMachine.getParametersHash(reputationAddress, options.votePrec);
  // TODO: these are specific configuation options that should be settable in the options above
  await org.schemeRegistrar.setParameters(voteParametersHash, voteParametersHash, org.votingMachine.address);
  const schemeRegistrarParams = await org.schemeRegistrar.getParametersHash(voteParametersHash, voteParametersHash, org.votingMachine.address);
  const schemeRegistrarFee = await org.schemeRegistrar.fee();
  const schemeRegistrarTokenAddress = await org.schemeRegistrar.nativeToken();
  const schemeRegistrarToken = DAOToken.at(schemeRegistrarTokenAddress);

  // TODO: these are specific configuation options that should be settable in the options above
  await org.upgradeScheme.setParameters(voteParametersHash, org.votingMachine.address)
  const upgradeSchemeParams = await org.upgradeScheme.getParametersHash(voteParametersHash, org.votingMachine.address);
  const upgradeSchemeFee = await org.upgradeScheme.fee();
  const upgradeSchemeTokenAddress = await org.upgradeScheme.nativeToken();
  const upgradeSchemeToken = await DAOToken.at(upgradeSchemeTokenAddress);

  // TODO: these are specific configuation options that should be settable in the options above
  await org.globalConstraintRegistrar.setParameters(voteParametersHash, org.votingMachine.address);
  const globalConstraintRegistrarParams = await org.globalConstraintRegistrar.getParametersHash(voteParametersHash, org.votingMachine.address);
  const globalConstraintRegistrarFee = await org.globalConstraintRegistrar.fee();
  const globalConstraintRegistrarTokenAddress = await org.globalConstraintRegistrar.nativeToken();
  const globalConstraintRegistrarToken = DAOToken.at(globalConstraintRegistrarTokenAddress);
  //
  // TODO: next line is just nonsense: get some sensible permissions
  const permissionsArray = [3, 5, 9];

  // register the schemes with the organization
  await genesisScheme.setInitialSchemes(
        org.avatar.address,
        [options.schemeRegistrar, options.upgradeScheme, options.globalConstraintRegistrar],
        [schemeRegistrarParams, upgradeSchemeParams, globalConstraintRegistrarParams],
        [schemeRegistrarTokenAddress, upgradeSchemeTokenAddress, globalConstraintRegistrarTokenAddress],
        [schemeRegistrarFee, upgradeSchemeFee, globalConstraintRegistrarFee],
        permissionsArray
    );

  // register organizations with the schemes

  // transfer what we need for fees
  // TODO: check if we have the funds, if not, throw an exception
  // fee = await org.schemeRegistrar.fee())
  await schemeRegistrarToken.transfer(org.avatar.address, schemeRegistrarFee);
  await org.schemeRegistrar.registerOrganization(org.avatar.address);
  await upgradeSchemeToken.transfer(org.avatar.address, upgradeSchemeFee);
  await org.upgradeScheme.registerOrganization(org.avatar.address);
  await globalConstraintRegistrarToken.transfer(org.avatar.address, globalConstraintRegistrarFee);
  await org.globalConstraintRegistrar.registerOrganization(org.avatar.address);
  //
  return org;
}

Organization.at = function(avatarAddress) {
  throw 'Not implemented yet';
}
