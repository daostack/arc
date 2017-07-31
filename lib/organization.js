"use strict";
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
import { GlobalConstraintRegistrar } from   '../lib/globalconstraintregistrar.js';
const Reputation = artifacts.require("./Reputation.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const SimpleVote = artifacts.require("./SimpleVote.sol");
const SimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");
const TokenCapGC = artifacts.require("./TokenCapGC.sol");
const UniversalScheme = artifacts.require("./UniversalScheme.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");

import { getSettings } from './settings.js';
import { getValueFromLogs } from './utils.js';
import { SchemeRegistrar } from './schemeregistrar.js';

const promisify = require('promisify');

const SCHEME_PERMISSION_REGISTERING = 2;
const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
const SCHEME_PERMISSION_UPGRADE = 8;
const CONTRACT_SCHEMEREGISTRAR = 'SchemeRegistrar';
const CONTRACT_UPGRADESCHEME = 'UpdateScheme';
const CONTRACT_GLOBALCONSTRAINTREGISTRAR = 'GlobalConstraintRegistrar';

export class Organization {
  constructor() {
  }

  static async new(opts) {
    // TODO: optimization: we now have all sequantial awaits: parallelize them if possible
    // TODO: estimate gas/ether needed based on given options, check balance of sender, and
    // warn if necessary.
    // TODO: default options need to be extended), cf. https://github.com/daostack/daostack/issues/43
    // TODO: orgName, tokenName and tokenSymbol should be required - implement this
    // QUESTION: should we add options to deploy with existing tokens or rep?
    const settings = await getSettings();
    const defaults = {
        orgName: null,
        tokenName: null,
        tokenSymbol: null,
        founders: [],
        votingMachine: settings.votingMachine,
        votePrec: 50,
        genesisScheme: settings.genesisScheme,
        schemes: [
          {
            contract: CONTRACT_SCHEMEREGISTRAR,
            schemeAddress: settings.schemeRegistrar,
          },
          {
            contract: CONTRACT_UPGRADESCHEME,
            schemeAddress: settings.upgradeScheme,
          },
          {
            contract: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
            schemeAddress: settings.globalConstraintRegistrar,
          },
        ],
    };

    const options = Object.assign({}, defaults, opts);

    let tx;

    const genesisScheme = await GenesisScheme.at(options.genesisScheme);

    tx = await genesisScheme.forgeOrg(
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
    let initialSchemesAddresses = [];
    let initialSchemesParams = [];
    let initialSchemesTokenAddresses = [];
    let initialSchemesFees = [];
    let initialSchemesPermissions = [];
    let scheme;
    // const initalSchemesPermissions = ['0x00000003', '0x00000009', '0x00000005'];

    const schemes = options.schemes;
    for (let i=0; i < schemes.length; i = i + 1) {
      if (schemes[i].contract === CONTRACT_SCHEMEREGISTRAR) {
        scheme = await SchemeRegistrar.at(schemes[i].schemeAddress);
        await scheme.setParameters(voteParametersHash, voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].schemeAddress);
        initialSchemesParams.push(await scheme.getParametersHash(voteParametersHash, voteParametersHash, org.votingMachine.address));
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push('0x00000003');
      }

      if (schemes[i].contract === CONTRACT_UPGRADESCHEME) {
        // TODO: these are specific configuation options that should be settable in the options above
        scheme = await UpgradeScheme.at(schemes[i].schemeAddress);
        await scheme.setParameters(voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].schemeAddress);
        initialSchemesParams.push(await scheme.getParametersHash(voteParametersHash, org.votingMachine.address));
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push('0x00000009');
      }

      if (schemes[i].contract === CONTRACT_GLOBALCONSTRAINTREGISTRAR) {
        // TODO: these are specific configuation options that should be settable in the options above
        scheme = await GlobalConstraintRegistrar.at(schemes[i].schemeAddress);
        await scheme.setParameters(voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].schemeAddress);
        initialSchemesParams.push(await scheme.getParametersHash(voteParametersHash, org.votingMachine.address));
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push('0x00000005');
      }
    }

    // register the schemes with the organization
    await genesisScheme.setInitialSchemes(
      org.avatar.address,
      initialSchemesAddresses,
      initialSchemesParams,
      initialSchemesTokenAddresses,
      initialSchemesFees,
      initialSchemesPermissions,
    );


    // transfer what we need for fees to register the organization at the given schemes
    // TODO: check if we have the funds, if not, throw an exception
    // fee = await org.schemeRegistrar.fee())
    // we must do this after setInitialSchemes, because that one approves the transactions
    // (but that logic shoudl change)
    let token, fee;
    for (let i=0; i < initialSchemesAddresses.length; i = i + 1) {
      scheme = await SchemeRegistrar.at(initialSchemesAddresses[i]);
      token = DAOToken.at(initialSchemesTokenAddresses[i]);
      fee  = initialSchemesFees[i];
      await token.transfer(org.avatar.address, fee);
      await scheme.registerOrganization(org.avatar.address);
    }

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
    // if (!web3.isAddress(options.schemeRegistrar)) {
    //   // throw
    //   msg = 'a valid address for option.schemeRegistrar must be provided';
    //   throw msg;
    // }
    // if (!web3.isAddress(options.upgradeScheme)) {
    //   // throw
    //   msg = 'a valid address for option.upgradeScheme must be provided';
    //   throw msg;
    // }
    //
    // if (!web3.isAddress(options.globalConstraintRegistrar)) {
    //   // throw
    //   msg = 'a valid address for option.globalConstraintRegistrar must be provided';
    //   throw msg;
    // }
  }

  async schemes(contract) {
    // return the schemes registered on this controller satisfying the contract spec
    // return all schems if contract is not given
    const schemes = await this._getSchemes();
    if (contract !== undefined) {
      let result = [];
      for (let i=0; i<schemes.length; i=i+1) {
        if (schemes[i].contract === contract) {
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
            // contract = 'unregistered' - we ignore it
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_REGISTERING) === SCHEME_PERMISSION_REGISTERING) {
            scheme['contract'] = CONTRACT_SCHEMEREGISTRAR;
            result.push(scheme);
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_UPGRADE) === SCHEME_PERMISSION_UPGRADE) {
            scheme['contract'] = CONTRACT_UPGRADESCHEME;
            result.push(scheme);
        } else if ((parseInt(permissions) & SCHEME_PERMISSION_GLOBALCONSTRAINT) === SCHEME_PERMISSION_GLOBALCONSTRAINT) {
            scheme['contract'] = CONTRACT_GLOBALCONSTRAINTREGISTRAR;
            result.push(scheme);
        } else {
            scheme['contract'] = null;
            result.push(scheme);
        }
    };
    return result;
  }

  async schemeRegistrar() {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const schemeAddress = (await this.schemes(CONTRACT_SCHEMEREGISTRAR))[0].address;
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
    const schemeAddress = (await this.schemes(CONTRACT_UPGRADESCHEME))[0].address;
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
    // returns a GlobalContraintRegistrar used by this organization
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const schemeAddress = (await this.schemes(CONTRACT_GLOBALCONSTRAINTREGISTRAR))[0].address;
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

  async proposeScheme(opts={}) {

    const settings = await getSettings();

    const defaults = {
      votePrec: 50, // used for SimpleContributionScheme
      boolVote: this.votingMachine.address, // used for SimpleContributionScheme
      orgNativeTokenFee: 0, // used for SimpleContributionScheme
      schemeNativeTokenFee: 0, // used for SimpleContributionScheme
    };

    const options = Object.assign({}, defaults, opts);

    let tx;

    const schemeRegistrar = await this.schemeRegistrar();

    if (options.contract === 'SimpleICO') {
      const scheme = await SimpleICO.at(settings.simpleICO);
      // TODO: create the parameters hash on the basis of the options
      const parametersHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const tokenForFee = await scheme.nativeToken();
      const fee = await scheme.fee();
      tx = await schemeRegistrar.proposeScheme(
        this.avatar.address, // Avatar _avatar,
        scheme.address, //address _scheme,
        parametersHash, // bytes32 _parametersHash,
        false, // bool _isRegistering,
        tokenForFee, // StandardToken _tokenFee,
        fee, // uint _fee
      );
      const proposalId = await getValueFromLogs(tx, 'proposalId');
      return proposalId;
    } else if (options.contract === 'SimpleContributionScheme') {
      // get the scheme
      const scheme = await SimpleContributionScheme.at(options.schemeAddress || settings.contributionScheme);
      const feeToken = await scheme.nativeToken();
      const fee = await scheme.fee();
      const votingMachine = SimpleVote.at(options.boolVote);
      // check if voteApporveParams are known on the votingMachine
      await votingMachine.setParameters(this.reputation.address, options.votePrec);
      const voteApproveParams = await votingMachine.getParametersHash(this.reputation.address, options.votePrec);
      const unpackedParams = await votingMachine.parameters(voteApproveParams);
      let msg = 'it seems your voteApproveParams are not known on this votingMachine';
      assert.isOk(unpackedParams[0], msg);

      const orgNativeTokenFee = options.orgNativeTokenFee;
      const schemeNativeTokenFee = options.schemeNativeTokenFee;

      const parametersHash = await scheme.getParametersHash(
        orgNativeTokenFee,
        schemeNativeTokenFee,
        voteApproveParams,
        options.boolVote
      );
      await scheme.setParameters(
        orgNativeTokenFee, // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
        schemeNativeTokenFee, // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
        voteApproveParams, // bytes32 voteApproveParams;
        options.boolVote, // BoolVoteInterface boolVote;
      );

      tx = await schemeRegistrar.proposeScheme(
        this.avatar.address, // Avatar _avatar,
        scheme.address, //address _scheme,
        parametersHash, // bytes32 _parametersHash,
        false, // bool _isRegistering,
        feeToken, // StandardToken _tokenFee,
        fee, // uint _fee
      );

      const proposalId = await getValueFromLogs(tx, 'proposalId');
      return proposalId;
    } else {
      throw 'Unknown contract';
    }
  }

  async proposeGlobalConstraint(opts= {}) {
    const settings = await getSettings();
    const defaults = {
      // contract
      // address
      params: {},
      // paramsHash
      // next three options regard removing a global constraint
      votingMachine: this.votingMachine.address,
      reputation: this.reputation.address,
      absPrecReq: 50,
    };

    const options = Object.assign(defaults, opts);

    if (options.contract==='TokenCapGC') {
      const tokenCapGC = TokenCapGC.at(settings.tokenCapGC);
      let tokenCapGCParamsHash;
      if (options.paramsHash) {
          // TODO: check if paramsHash is registered
          tokenCapGCParamsHash = options.paramsHash;
      } else {

          const defaultParams = {
            tokenAddress: this.token.address,
            cap: 21e9,
          };
          let params = Object.assign(defaultParams, options.params);
          await tokenCapGC.setParameters(params.tokenAddress, params.cap);
          tokenCapGCParamsHash = await tokenCapGC.getParametersHash(params.tokenAddress, params.cap);
      }

      // calculate (and set) the hash that will be used to remove the parameters
      await SimpleVote.at(options.votingMachine).setParameters(options.reputation, options.absPrecReq);
      const votingMachineHash = await SimpleVote.at(options.votingMachine).getParametersHash(options.reputation, options.absPrecReq);

      const globalConstraintRegistrar = await this.globalConstraintRegistrar();
      let tx = await globalConstraintRegistrar.proposeGlobalConstraint(this.avatar.address, tokenCapGC.address, tokenCapGCParamsHash, votingMachineHash);
      const proposalId = getValueFromLogs(tx, 'proposalId');
      return proposalId;
    }
  }

  async vote(proposalId, yesno) {
    // vote for the proposal given by proposalId using this.votingMachine
    // NB: this will not work for proposals using votingMachine's that are
    return await this.votingMachine.vote(proposalId, yesno);
  }
}
