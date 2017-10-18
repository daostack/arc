"use strict";
const dopts = require('default-options');

import { requireContract } from './utils.js';
const Avatar = requireContract('Avatar');
const Controller = requireContract('Controller');
const DAOToken = requireContract("DAOToken");
const GenesisScheme = requireContract("GenesisScheme");
const Reputation = requireContract("Reputation");
const SimpleICO = requireContract("SimpleICO");
// const SimpleVote = requireContract("SimpleVote");
import { GlobalConstraintRegistrar } from   '../lib/globalconstraintregistrar.js';
const AbsoluteVote = requireContract("AbsoluteVote");
import { SimpleContributionScheme } from   '../lib/simplecontributionscheme.js';
const TokenCapGC = requireContract("TokenCapGC");
const UpgradeScheme = requireContract("UpgradeScheme");

import { getSettings } from './settings.js';
import { getValueFromLogs, NULL_ADDRESS } from './utils.js';
import { SchemeRegistrar } from './schemeregistrar.js';

const promisify = require('promisify');

// const SCHEME_PERMISSION_REGISTERING = 2;
// const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
// const SCHEME_PERMISSION_UPGRADE = 8;
const CONTRACT_SCHEMEREGISTRAR = 'SchemeRegistrar';
const CONTRACT_UPGRADESCHEME = 'UpgradeScheme';
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
        votingMachine: settings.daostackContracts.AbsoluteVote.address,
        votePrec: 50,
        ownerVote: true,
        genesisScheme: settings.daostackContracts.GenesisScheme.address,
        schemes: [
          {
            contract: CONTRACT_SCHEMEREGISTRAR,
            address: settings.daostackContracts.SchemeRegistrar.address,
          },
          {
            contract: CONTRACT_UPGRADESCHEME,
            address: settings.daostackContracts.UpgradeScheme.address,
          },
          {
            contract: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
            address: settings.daostackContracts.GlobalConstraintRegistrar.address,
          },
        ],
    };

    const options = dopts(opts, defaults);

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

    options.avatar = avatarAddress;
    org.avatar = await Avatar.at(options.avatar);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = Reputation.at(reputationAddress);

    org.votingMachine = AbsoluteVote.at(options.votingMachine);
    await org.votingMachine.setParameters(org.reputation.address, options.votePrec, options.ownerVote);

    const voteParametersHash = await org.votingMachine.getParametersHash(org.reputation.address, options.votePrec, options.ownerVote);

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
        scheme = await SchemeRegistrar.at(schemes[i].address);
        await scheme.setParameters(voteParametersHash, voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].address);
        initialSchemesParams.push(await scheme.getParametersHash(voteParametersHash, voteParametersHash, org.votingMachine.address));
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push('0x00000003');
      }

      if (schemes[i].contract === CONTRACT_UPGRADESCHEME) {
        // TODO: these are specific configuation options that should be settable in the options above
        scheme = await UpgradeScheme.at(schemes[i].address);
        await scheme.setParameters(voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].address);
        initialSchemesParams.push(await scheme.getParametersHash(voteParametersHash, org.votingMachine.address));
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push('0x00000009');
      }

      if (schemes[i].contract === CONTRACT_GLOBALCONSTRAINTREGISTRAR) {
        // TODO: these are specific configuation options that should be settable in the options above
        scheme = await GlobalConstraintRegistrar.at(schemes[i].address);
        await scheme.setParameters(voteParametersHash, org.votingMachine.address);
        initialSchemesAddresses.push(schemes[i].address);
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
      // token = DAOToken.at(tokenAddress);
      token = await DAOToken.at(initialSchemesTokenAddresses[i]);
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
      org.votingMachine = AbsoluteVote.at(settings.votingMachine);
    }

    return org;
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
    const settings = await getSettings();

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
        if (parseInt(permissions) === 0) {
            // contract = 'unregistered' - we ignore it
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_REGISTERING) === SCHEME_PERMISSION_REGISTERING) {
        } else if (addresses[i] === String(settings.schemeRegistrar)) {
            scheme['contract'] = CONTRACT_SCHEMEREGISTRAR;
            result.push(scheme);
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_UPGRADE) === SCHEME_PERMISSION_UPGRADE) {
        } else if (addresses[i] === String(settings.upgradeScheme)) {
            scheme['contract'] = CONTRACT_UPGRADESCHEME;
            result.push(scheme);
        // } else if ((parseInt(permissions) & SCHEME_PERMISSION_GLOBALCONSTRAINT) === SCHEME_PERMISSION_GLOBALCONSTRAINT) {
        } else if (addresses[i] === String(settings.globalConstraintRegistrar)) {
            scheme['contract'] = CONTRACT_GLOBALCONSTRAINTREGISTRAR;
            result.push(scheme);
        } else if (addresses[i] === String(settings.contributionScheme)) {
            scheme['contract'] = 'ContributionScheme';
            result.push(scheme);
        } else {
            scheme['contract'] = null;
            result.push(scheme);
        }
    }
    return result;
  }

  async scheme(contract) {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const settings = await getSettings();
    const contractInfo = settings.daostackContracts[contract];
    // check if indeed the registrar is registered as a scheme on  the controller
    const isSchemeRegistered = await this.controller.isSchemeRegistered(contractInfo.address);
    assert.equal(isSchemeRegistered, true);

    return contractInfo.contract.at(contractInfo.address);
  }

  async checkSchemeConditions(scheme) {
    // check if the scheme if ready for usage - i.e. if the org is registered at the scheme and vice versa
    // check if the schems is usable
    const controller = this.controller;
    const avatar = this.avatar;

    // check if indeed the registrar is registered as a scheme on  the controller
    const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
    assert.equal(isSchemeRegistered, true);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
    if (!isControllerRegistered) {
        const msg = 'The organization is not registered on this schme: ' + contract +  '; ' + contractInfo.address;
        throw msg;
    }
    return true;
  }

  async proposeScheme(opts={}) {

    const settings = await getSettings();

    const defaults = {
      contract: undefined,
      address: null,
      params: {},
    };

    const options = dopts(opts, defaults);

    let tx;

    const schemeRegistrar = await this.scheme('SchemeRegistrar');

    if (options.contract === 'SimpleICO') {
      const scheme = await SimpleICO.at(settings.daostackContracts.SimpleICO.address);
      // TODO: check which default params should be required
      const defaultParams = {
        cap: 0, // uint _cap,
        price: 0, // uint _price,
        startBlock: 0, // uint _startBlock,
        endBlock: 0, // uint _endBlock,
        beneficiary: NULL_ADDRESS, // address _beneficiary,
        admin: NULL_ADDRESS,// address _admin)  returns(bytes32) {
      };
      // tod: all 'null' params are required
      options.params = dopts(options.params, defaultParams);

      // TODO: create the parameters hash on the basis of the options
      await scheme.setParameters(
        options.params.cap,
        options.params.price,
        options.params.startBlock,
        options.params.endBlock,
        options.params.beneficiary,
        options.params.admin,
      );
      const parametersHash = await scheme.getParametersHash(
        options.params.cap,
        options.params.price,
        options.params.startBlock,
        options.params.endBlock,
        options.params.beneficiary,
        options.params.admin,
      );
      const tokenForFee = await scheme.nativeToken();
      const fee = await scheme.fee();
      const autoRegister = false;
      tx = await schemeRegistrar.proposeScheme(
        this.avatar.address, // Avatar _avatar,
        scheme.address, //address _scheme,
        parametersHash, // bytes32 _parametersHash,
        false, // bool _isRegistering,
        tokenForFee, // StandardToken _tokenFee,
        fee, // uint _fee
        autoRegister // bool _autoRegister
      );
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      return proposalId;


    } else if (options.contract === 'SimpleContributionScheme') {
      // get the scheme
      const defaultParams = {
        votePrec: 50, // used for SimpleContributionScheme
        ownerVote: true,
        intVote: this.votingMachine.address, // used for SimpleContributionScheme
        orgNativeTokenFee: 0, // used for SimpleContributionScheme
        schemeNativeTokenFee: 0, // used for SimpleContributionScheme
      };
      // tod: all 'null' params are required
      options.params = dopts(options.params, defaultParams);

      const scheme = await SimpleContributionScheme.at(options.address || settings.daostackContracts.SimpleContributionScheme.address);
      const votingMachine = AbsoluteVote.at(options.params.intVote);
      // check if voteApporveParams are known on the votingMachine
      await votingMachine.setParameters(this.reputation.address, options.params.votePrec, options.params.ownerVote);
      const voteApproveParams = await votingMachine.getParametersHash(this.reputation.address, options.params.votePrec, options.params.ownerVote);

      // const unpackedParams = await votingMachine.parameters(voteApproveParams);
      // let msg = 'it seems your voteApproveParams are not known on this votingMachine';
      // assert.isOk(unpackedParams[0], msg);

      const parametersHash = await scheme.getParametersHash(
        options.params.orgNativeTokenFee,
        options.params.schemeNativeTokenFee,
        voteApproveParams,
        votingMachine.address,
      );
      await scheme.setParameters(
        options.params.orgNativeTokenFee, // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
        options.params.schemeNativeTokenFee, // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
        voteApproveParams, // bytes32 voteApproveParams;
        votingMachine.address,
      );

      const feeToken = await scheme.nativeToken();
      const fee = await scheme.fee();
      const autoRegister = false;

      tx = await schemeRegistrar.proposeScheme(
        this.avatar.address, // Avatar _avatar,
        scheme.address, //address _scheme,
        parametersHash, // bytes32 _parametersHash,
        false, // bool _isRegistering,
        feeToken, // StandardToken _tokenFee,
        fee, // uint _fee
        autoRegister // bool _autoRegister
      );
      const proposalId = await getValueFromLogs(tx, '_proposalId');
      return proposalId;
    } else {
      throw 'Unknown contract';
    }
  }

  async proposeGlobalConstraint(opts= {}) {
    const settings = await getSettings();
    const defaults = {
      contract: null,
      address: null,
      params: {},
      paramsHash: null,
      // next three options regard removing a global constraint
      votingMachine: this.votingMachine.address,
      reputation: this.reputation.address,
      absPrecReq: 50,
    };

    const options = dopts(opts, defaults);

    if (options.contract==='TokenCapGC') {
      options.address = options.address || settings.daostackContracts.TokenCapGC.address;
      const tokenCapGC = TokenCapGC.at(options.address);

      if (options.paramsHash) {
          // TODO: check if paramsHash is registered
      } else {
          const defaultParams = {
            token: null,
            tokenAddress: this.token.address,
            cap: 21e9,
          };
          let params = dopts(options.params, defaultParams);

          await tokenCapGC.setParameters(params.tokenAddress, params.cap);
          options.paramsHash = await tokenCapGC.getParametersHash(params.tokenAddress, params.cap);
      }

    } else {
      if (options.address) {
        //
      } else {
        let msg = 'Either "contract" or "address" must be provided';
        throw msg;
      }
    }
    // calculate (and set) the hash that will be used to remove the parameters
    await AbsoluteVote.at(options.votingMachine).setParameters(options.reputation, options.absPrecReq, true);
    options.votingMachineHash = await AbsoluteVote.at(options.votingMachine).getParametersHash(options.reputation, options.absPrecReq, true);

    const globalConstraintRegistrar = await this.scheme('GlobalConstraintRegistrar');
    let tx = await globalConstraintRegistrar.proposeGlobalConstraint(this.avatar.address, options.address, options.paramsHash, options.votingMachineHash);
    const proposalId = getValueFromLogs(tx, '_proposalId');
    return proposalId;
  }

  vote(proposalId, choice, params) {
    // vote for the proposal given by proposalId using this.votingMachine
    // NB: this will not work for proposals using votingMachine's that are not the default one
    return this.votingMachine.vote(proposalId, choice, NULL_ADDRESS, params);
  }

}
