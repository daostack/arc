"use strict";
const Controller = artifacts.require("./Controller.sol");
const Avatar = artifacts.require("./Avatar.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");


import { daostack } from './daostack.js';
import { getSettings } from './settings.js';

export class Organization {
  constructor() {
    // this.controller = Controller.at(controllerAddress);
    // this.avatar = Avatar.at(this.controller.avatar);
  }
}

Organization.new = async function(opts) {
  const accounts = web3.eth.accounts;
  const settings = await getSettings();

  // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
  // TODO: orgName, tokenName and tokenSymbol *must* be given - implement this
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
  }

  const options = Object.assign({}, defaults, opts);
  console.log(options);
  console.log(settings)

  let org = new Organization();
  const genesisSchemeInst = await GenesisScheme.at(options.genesisScheme);
  // const genesisSchemeInst = await GenesisScheme.new();
  const tx = await genesisSchemeInst.forgeOrg(
      options.orgName,
      options.tokenName,
      options.tokenSymbol,
      options.founders,
      options.tokensForFounders,
      options.repForFounders,
  );


  org.founders = options.founders;
  org.genesisScheme = genesisSchemeInst;
  // get the address of the avatar from the logs
  const log = tx.logs[0];
  const avatarAddress =  log.args._avatar;
  org.avatar =  await Avatar.at(avatarAddress);
  const controllerAddress = await org.avatar.owner();
  org.controller = await Controller.at(controllerAddress);

  org.schemeRegistrar = SchemeRegistrar.at(options.schemeRegistrar);
  // TODO: deploy upgradeScheme in migration
  // org.upgradeScheme= UpgradeScheme.at(options.upgradeScheme);
  // const globalConstraintRegistrarInst = await daostack.createGlobalConstraintRegistrar();
  // const simpleVoteInst = await SimpleVote.new();
  // org.votingMachine = simpleVoteInst;
  // const tokenAddress = await controller.nativeToken();
  // const reputationAddress = await controller.nativeReputation();
  //
  // TODO: finish code above and actually return an organization
  org = await daostack.forgeOrganization(opts);
  return org;
  // const voteParametersHash = await simpleVoteInst.getParametersHash(reputationAddress, options.votePrec);
  //
  // // not sure if next line is strictly needed
  // await schemeRegistrarInst.setParameters(voteParametersHash, voteParametersHash, simpleVoteInst.address);
  // const schemeRegisterParams = await schemeRegistrarInst.getParametersHash(voteParametersHash, voteParametersHash, simpleVoteInst.address);
  //
  // // not sure if next line is strictly needed
  // await globalConstraintRegistrarInst.setParameters(voteParametersHash, simpleVoteInst.address);
  // const schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(voteParametersHash, simpleVoteInst.address);
  //
  // // not sure if next line is strictly needed
  // await upgradeSchemeInst.setParameters(voteParametersHash, simpleVoteInst.address)
  // const schemeUpgradeParams = await upgradeSchemeInst.getParametersHash(voteParametersHash, simpleVoteInst.address);
  //
  // const schemeRegisterFee = await schemeRegistrarInst.fee();
  // const schemeGCRegisterFee = await globalConstraintRegistrarInst.fee();
  // const schemeUpgradeFee = await upgradeSchemeInst.fee();
  // const schemeRegisterFeeToken = await schemeRegistrarInst.nativeToken();
  // const schemeGCRegisterFeeToken = await globalConstraintRegistrarInst.nativeToken();
  // const schemeUpgradeFeeToken = await upgradeSchemeInst.nativeToken();
  //
  // const permissionsArray = [3, 5, 9];
  //
  // await genesisSchemeInst.setInitialSchemes(
  //     org.avatarAddress,
  //     [schemeRegistrarInst.address, upgradeSchemeInst.address, globalConstraintRegistrarInst.address],
  //     [schemeRegisterParams, schemeUpgradeParams, schemeGCRegisterParams],
  //     [schemeRegisterFeeToken, schemeGCRegisterFeeToken, schemeUpgradeFeeToken],
  //     [schemeRegisterFee, schemeGCRegisterFee, schemeUpgradeFee],
  //     permissionsArray
  // );
  // org.schemeregistrar = schemeRegistrarInst;
  //
  // // Set SchemeRegistrar nativeToken and register DAOstack to it:
  // await schemeRegistrarInst.registerOrganization(avatar.address);
  // await globalConstraintRegistrarInst.registerOrganization(avatar.address, voteParametersHash, simpleVoteInst.address);
  // await upgradeSchemeInst.registerOrganization(avatar.address, voteParametersHash, simpleVoteInst.address);
  //
  // return org;

  // const org = await daostack.forgeOrganization(opts);
  // return org;
}

Organization.at = function(avatarAddress) {
  throw 'Not implemented yet';
}
