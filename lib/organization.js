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

export class Organization {
  constructor(controllerAddress) {
    this.controller = Controller.at(controllerAddress);
    this.avatar = Avatar.at(this.controller.avatar);
  }
}

Organization.new = async function(opts) {
    const org = await daostack.forgeOrganization(opts);
    return org;
}

Organization.at = function(address) {
  throw 'Not implemented yet';
}
