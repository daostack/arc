"use strict";
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const Reputation = artifacts.require("./Reputation.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const SimpleVote = artifacts.require("./SimpleVote.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");

import { getSettings } from './settings.js';
import { getValueFromLogs } from './utils.js';
import { SchemeRegistrar } from './schemeregistrar.js';

const promisify = require('promisify');

const SCHEME_PERMISSION_REGISTERING = 2;
const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
const SCHEME_PERMISSION_UPGRADE = 8;
const SCHEME_TYPE_SCHEMEREGISTRAR = 'SchemeRegistrar';
const SCHEME_TYPE_UPGRADESCHEME = 'UpdateScheme';
const SCHEME_TYPE_GLOBALCONTRAINTREGISTRAR = 'GlobalConstraintRegistrar';

export class Organization {

  constructor() {
  }

  static async new(opts) {
    // TODO: optimization: we now have all sequantial awaits: parallelize them if possible
    // TODO: estimate gas/ether needed based on given options, check balance of sender, and
    // warn if necessary.
    // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
    // TODO: orgName, tokenName and tokenSymbol should be required - implement this
    // TODO: the founders and reputation distribution shoudl GO!
    // QUESTION: should we add options to deploy with existing tokens or rep?
    const settings = await getSettings();
    const defaults = {
        orgName: null,
        tokenName: null,
        tokenSymbol: null,
        founders: [],
        votePrec: 50,
        genesisScheme: settings.genesisScheme,
        schemeRegistrar: settings.schemeRegistrar,
        upgradeScheme: settings.upgradeScheme,
        globalConstraintRegistrar: settings.globalConstraintRegistrar,
        votingMachine: settings.votingMachine,
    };

    const options = Object.assign({}, defaults, opts);

    const genesisScheme = await GenesisScheme.at(options.genesisScheme);

    let tx = await genesisScheme.forgeOrg(
        options.orgName,
        options.tokenName,
        options.tokenSymbol,
        options.founders.map(x => x.address),
        options.founders.map(x => x.tokens),
        options.founders.map(x => x.reputation),
    );
    // get the address of the avatar from the logs
    const avatarAddress = getValueFromLogs(tx, '_avatar');
    let org = new Organization();

    await org.checkOptions(options);

    options.avatar = avatarAddress;
    org.avatar = await Avatar.at(options.avatar);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = Reputation.at(reputationAddress);

    org.votingMachine = SimpleVote.at(options.votingMachine);

    await org.votingMachine.setParameters(org.reputation.address, options.votePrec);
    const voteParametersHash = await org.votingMachine.getParametersHash(org.reputation.address, options.votePrec);

    // TODO: these are specific configuration options that should be settable in the options above
    const schemeRegistrar = await SchemeRegistrar.at(settings.schemeRegistrar);
    await schemeRegistrar.setParameters(voteParametersHash, voteParametersHash, org.votingMachine.address);
    const schemeRegistrarParams = await schemeRegistrar.getParametersHash(voteParametersHash, voteParametersHash, org.votingMachine.address);
    const schemeRegistrarFee = await schemeRegistrar.fee();
    const schemeRegistrarTokenAddress = await schemeRegistrar.nativeToken();
    const schemeRegistrarToken = DAOToken.at(schemeRegistrarTokenAddress);

    // TODO: these are specific configuation options that should be settable in the options above
    const upgradeScheme = await UpgradeScheme.at(settings.upgradeScheme);
    await upgradeScheme.setParameters(voteParametersHash, org.votingMachine.address);
    const upgradeSchemeParams = await upgradeScheme.getParametersHash(voteParametersHash, org.votingMachine.address);
    const upgradeSchemeFee = await upgradeScheme.fee();
    const upgradeSchemeTokenAddress = await upgradeScheme.nativeToken();
    const upgradeSchemeToken = await DAOToken.at(upgradeSchemeTokenAddress);

    // TODO: these are specific configuation options that should be settable in the options above
    const globalConstraintRegistrar = await GlobalConstraintRegistrar.at(settings.globalConstraintRegistrar);
    await globalConstraintRegistrar.setParameters(voteParametersHash, org.votingMachine.address);
    const globalConstraintRegistrarParams = await globalConstraintRegistrar.getParametersHash(voteParametersHash, org.votingMachine.address);
    const globalConstraintRegistrarFee = await globalConstraintRegistrar.fee();
    const globalConstraintRegistrarTokenAddress = await globalConstraintRegistrar.nativeToken();
    const globalConstraintRegistrarToken = DAOToken.at(globalConstraintRegistrarTokenAddress);


    // register the schemes with the organization
    const permissionsArray = ['0x00000003', '0x00000009', '0x00000005'];
    await genesisScheme.setInitialSchemes(
          org.avatar.address,
          [options.schemeRegistrar, options.upgradeScheme, options.globalConstraintRegistrar],
          [schemeRegistrarParams, upgradeSchemeParams, globalConstraintRegistrarParams],
          [schemeRegistrarTokenAddress, upgradeSchemeTokenAddress, globalConstraintRegistrarTokenAddress],
          [schemeRegistrarFee, upgradeSchemeFee, globalConstraintRegistrarFee],
          permissionsArray
      );


    // transfer what we need for fees to register the organization at the given schemes
    // TODO: check if we have the funds, if not, throw an exception
    // fee = await org.schemeRegistrar.fee())
    await schemeRegistrarToken.transfer(org.avatar.address, schemeRegistrarFee);
    await schemeRegistrar.registerOrganization(org.avatar.address);
    await upgradeSchemeToken.transfer(org.avatar.address, upgradeSchemeFee);
    await upgradeScheme.registerOrganization(org.avatar.address);
    await globalConstraintRegistrarToken.transfer(org.avatar.address, globalConstraintRegistrarFee);
    await globalConstraintRegistrar.registerOrganization(org.avatar.address);

    return org;
  }

  static async at(avatarAddress) {
    const org = new Organization();

    org.avatar = Avatar.at(avatarAddress);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = Reputation.at(reputationAddress);

    // TODO: we now just set the default voting machine, and assume it is used
    // throughout, but this assumption is not warranted
    const settings = await getSettings();
    if (settings.votingMachine) {
      org.votingMachine = SimpleVote.at(settings.votingMachine);
    }

    return org;
  };

  async checkOptions(opts) {
    let msg;
    const options = opts;
    if (!web3.isAddress(options.schemeRegistrar)) {
      // throw
      msg = 'a valid address for option.schemeRegistrar must be provided';
      throw msg;
    }
    if (!web3.isAddress(options.upgradeScheme)) {
      // throw
      msg = 'a valid address for option.upgradeScheme must be provided';
      throw msg;
    }

    if (!web3.isAddress(options.globalConstraintRegistrar)) {
      // throw
      msg = 'a valid address for option.globalConstraintRegistrar must be provided';
      throw msg;
    }
  }

  async schemes(schemeType) {
    // return the schemes registered on this controller satisfying the schemeType spec
    // return all schems if schemeType is not given
    const schemes = await this._getSchemes();
    if (schemeType !== undefined) {
      let result = [];
      for (let i=0; i<schemes.length; i=i+1) {
        if (schemes[i].schemeType === schemeType) {
          result.push(schemes[i]);
        }
      }
      return result;
  } else {
      return schemes;
    }
  }

  async _getSchemes() {
    // private method returns all registered schemes.
    // TODO: this is *expensive*, we need to cache the results (and perhaps poll for latest changes if necessary)
    let result = [];
    const controller = this.controller;

    // TODO: only subscribe to registerScheme events that are registering to this.controller.address
    const registerSchemeEvent = controller.RegisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    const logs = await promisify.cb_func()(function(cb) { registerSchemeEvent.get(cb); })();
    registerSchemeEvent.stopWatching();

    // get scheme address from the logs
    const addresses = logs.map(function(log) { return log.args._scheme;});
    let permissions, i, scheme;

    // we derive the type of scheme from its permissions, which is at most approximate.
    for (i=0; i < addresses.length; i++) {
        scheme = {
          address: addresses[i],
          permissions: permissions,
        };
        permissions = await controller.getSchemePermissions(addresses[i]);
        // TODO: XXX: permissions should be checked by the bit that is set, not absolute number
        // TODO: XXX: if we have two or more schems with the same bits set, only one will be found
        if (parseInt(permissions) === 0) {
            // schemeType = 'unregistered' - we ignore it
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_REGISTERING) === SCHEME_PERMISSION_REGISTERING) {
            scheme['schemeType'] = SCHEME_TYPE_SCHEMEREGISTRAR;
            result.push(scheme);
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_UPGRADE) === SCHEME_PERMISSION_UPGRADE) {
            scheme['schemeType'] = SCHEME_TYPE_UPGRADESCHEME;
            result.push(scheme);
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_GLOBALCONSTRAINT) === SCHEME_PERMISSION_GLOBALCONSTRAINT) {
            scheme['schemeType'] = SCHEME_TYPE_GLOBALCONTRAINTREGISTRAR;
            result.push(scheme);
        } else {
            scheme['schemeType'] = null;
            result.push(scheme);
        }
    };
    return result;
  }

  async schemeRegistrar() {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const schemeAddress = (await this.schemes(SCHEME_TYPE_SCHEMEREGISTRAR))[0].address;
    const scheme =  SchemeRegistrar.at(schemeAddress);

    // TODO: refactor: these checks below are repeated for upgardeScheme() and globalConstraintRegister
    // TODO: and probably should be done in schemes().

    // check if the schems is usable
    const controller = this.controller;
    const avatar = this.avatar;

  	// check if indeed the registrar is registered as a scheme on  the controller
  	const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
  	assert.equal(isSchemeRegistered, true);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
  	assert.equal(isControllerRegistered, true);
    return scheme;
  }

  async upgradeScheme() {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const schemeAddress = (await this.schemes(SCHEME_TYPE_UPGRADESCHEME))[0].address;
    const scheme =  UpgradeScheme.at(schemeAddress);

    // also do some checking for conditions
    const controller = this.controller;
    const avatar = this.avatar;

    // check if indeed the registrar is registered as a scheme on  the controller
    const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
    assert.equal(isSchemeRegistered, true);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
    assert.equal(isControllerRegistered, true);
    return scheme;
  }

  async globalConstraintRegistrar() {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const schemeAddress = (await this.schemes(SCHEME_TYPE_GLOBALCONTRAINTREGISTRAR))[0].address;
    const scheme =  GlobalConstraintRegistrar.at(schemeAddress);

    // also do some checking for conditions
    const controller = this.controller;
    const avatar = this.avatar;

  	// check if indeed the registrar is registered as a scheme on  the controller
  	const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
  	assert.equal(isSchemeRegistered, true);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
  	assert.equal(isControllerRegistered, true);
    return scheme;
  }

  async proposeScheme(options) {
    // options has the following:

    if (options.schemeType === 'SimpleICO') {
      const schemeRegistrar = await this.schemeRegistrar();
      const settings = await getSettings();
      console.log(settings.simpleICO);
      const simpleICO = await SimpleICO.at(settings.simpleICO);
      // TODO: create the parameters hash on the basis of the options
      const parametersHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const tokenForFee = await simpleICO.nativeToken();
      const fee = await simpleICO.fee();
      await schemeRegistrar.proposeScheme(
        this.avatar.address, // Avatar _avatar,
        simpleICO.address, //address _scheme,
        parametersHash, // bytes32 _parametersHash,
        false, // bool _isRegistering,
        tokenForFee, // StandardToken _tokenFee,
        fee, // uint _fee
      );
    } else {
      throw 'Unknown SchemeType';
    }
  }
}
