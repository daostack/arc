"use strict";
const dopts = require('default-options');

import { requireContract } from './utils.js';
const Avatar = requireContract('Avatar');
const Controller = requireContract('Controller');
const DAOToken = requireContract("DAOToken");
const GenesisScheme = requireContract("GenesisScheme");
const Reputation = requireContract("Reputation");
// import { GlobalConstraintRegistrar } from   './globalconstraintregistrar.js';
const AbsoluteVote = requireContract("AbsoluteVote");
// import { UpgradeScheme } from   './upgradescheme.js';

import { getSettings } from './settings.js';
import { getValueFromLogs } from './utils.js';
import { SchemeRegistrar } from './schemeregistrar.js';

// const SCHEME_PERMISSION_REGISTERING = 2;
// const SCHEME_PERMISSION_GLOBALCONSTRAINT = 4;
// const SCHEME_PERMISSION_UPGRADE = 8;
const CONTRACT_SCHEMEREGISTRAR = 'SchemeRegistrar';
const CONTRACT_UPGRADESCHEME = 'UpgradeScheme';
const CONTRACT_GLOBALCONSTRAINTREGISTRAR = 'GlobalConstraintRegistrar';
// const CONTRACT_SIMPLECONTRIBUTIONSCHEME = 'SimpleContributionScheme';

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
        orgNativeTokenFee: 0, // used for SimpleContributionScheme
        schemeNativeTokenFee: 0, // used for SimpleContributionScheme
        genesisScheme: settings.daostackContracts.GenesisScheme.address,
        schemes: [
          {
            name: CONTRACT_SCHEMEREGISTRAR,
            address: settings.daostackContracts.SchemeRegistrar.address,
          },
          {
            name: CONTRACT_UPGRADESCHEME,
            address: settings.daostackContracts.UpgradeScheme.address,
          },
          {
            name: CONTRACT_GLOBALCONSTRAINTREGISTRAR,
            address: settings.daostackContracts.GlobalConstraintRegistrar.address,
          },
        ],
    };

    const options = dopts(opts, defaults, { allowUnknown: true });
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

    options.avatar = avatarAddress;
    org.avatar = await Avatar.at(options.avatar);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = await DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = await Reputation.at(reputationAddress);

    org.votingMachine = await AbsoluteVote.at(options.votingMachine);
    await org.votingMachine.setParameters(org.reputation.address, options.votePrec, options.ownerVote);

    const voteParametersHash = await org.votingMachine.getParametersHash(org.reputation.address, options.votePrec, options.ownerVote);

    // TODO: these are specific configuration options that should be settable in the options above
    let initialSchemesAddresses = [];
    let initialSchemesParams = [];
    let initialSchemesTokenAddresses = [];
    let initialSchemesFees = [];
    let initialSchemesPermissions = [];

    for (let optionScheme of options.schemes) {

        var arcSchemeInfo = settings.daostackContracts[optionScheme.name];
        var scheme = await arcSchemeInfo.contract.at(optionScheme.address || arcSchemeInfo.address);

        const paramsHash = await scheme.setParams({
          voteParametersHash: voteParametersHash,
          votingMachine: org.votingMachine.address,
          orgNativeTokenFee: options.orgNativeTokenFee,
          schemeNativeTokenFee: options.schemeNativeTokenFee
        });

        initialSchemesAddresses.push(scheme.address);
        initialSchemesParams.push(paramsHash);
        initialSchemesTokenAddresses.push(await scheme.nativeToken());
        initialSchemesFees.push(await scheme.fee());
        initialSchemesPermissions.push(scheme.getDefaultPermissions(/* supply options.permissions here? */));
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
      token = await DAOToken.at(initialSchemesTokenAddresses[i]);
      fee  = initialSchemesFees[i];
      await token.transfer(org.avatar.address, fee);
      await scheme.registerOrganization(org.avatar.address);
    }

    return org;
  }

  static async at(avatarAddress) {
    const org = new Organization();

    org.avatar = await Avatar.at(avatarAddress);
    const controllerAddress = await org.avatar.owner();
    org.controller = await Controller.at(controllerAddress);

    const tokenAddress = await org.controller.nativeToken();
    org.token = await DAOToken.at(tokenAddress);

    const reputationAddress = await org.controller.nativeReputation();
    org.reputation = await Reputation.at(reputationAddress);

    // TODO: we now just set the default voting machine, and assume it is used
    // throughout, but this assumption is not warranted
    const settings = await getSettings();
    if (settings.votingMachine) {
      org.votingMachine = AbsoluteVote.at(settings.votingMachine);
    }

    return org;
  }

  /**
   * returns 
   * @param name linke "SchemeRegistrar" 
   */
  async schemes(name) {
    // return the schemes registered on this controller satisfying the contract spec
    // return all schems if contract is not given
    const schemes = await this._getSchemes();
    if (name) {
      return schemes.filter(function(s) { return s.name === name; });
  } else {
      return schemes;
    }
  }

  /**
   * returns schemes currently in this Organization as Array<OrganizationSchemeInfo>
   */
  async _getSchemes() {
    // private method returns all registered schemes.
    // TODO: this is *expensive*, we need to cache the results (and perhaps poll for latest changes if necessary)
    const schemesMap = new Map(); // <string, { address: string, permissions: string, name: string }>
    const controller = this.controller;
    const arcTypesMap = new Map(); // <address: string, name: string>
    const settings = await getSettings();

    /**
     * TODO:  This should pull in all known versions of the schemes, names 
     * and versions in one fell swoop.
     */
    for(var name in settings.daostackContracts) {
      var contract = settings.daostackContracts[name];
      arcTypesMap.set(contract.address, name);
    }

    const registerSchemeEvent = controller.RegisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    await new Promise((resolve) => {
      registerSchemeEvent.get((err, eventsArray) => this._handleSchemeEvent(err, eventsArray, true, arcTypesMap, schemesMap).then(() => { resolve(); }));
      registerSchemeEvent.stopWatching();
    });

    const unRegisterSchemeEvent = controller.UnregisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    await new Promise((resolve) => {
      unRegisterSchemeEvent.get((err, eventsArray) => this._handleSchemeEvent(err, eventsArray, false, arcTypesMap, schemesMap).then(() => { resolve(); }));
      unRegisterSchemeEvent.stopWatching();
    });

    return Array.from(schemesMap.values());
  }

  async _handleSchemeEvent(err, eventsArray, adding, arcTypesMap, schemesMap) // : Promise<void>
    {
      if (!(eventsArray instanceof Array)) {
        eventsArray = [eventsArray];
      }
      let count = eventsArray.length;
      for (let i = 0; i < count; i++) {
        let schemeAddress =  eventsArray[i].args._scheme;
        // will be all zeros if not registered
        let permissions = await this.controller.getSchemePermissions(schemeAddress);
       
        let schemeInfo = {
           address: schemeAddress,
           permissions: permissions,
           // will be undefined if not a known scheme
           name: arcTypesMap.get(schemeAddress)
         };

        if (adding) {
          schemesMap.set(schemeAddress,schemeInfo);
        } else if (schemesMap.has(schemeAddress)) {
            schemesMap.delete(schemeAddress);
        }
    }
  }
  
  /**
   * Returns promise of a scheme as ExtendTruffleScheme, or ? if not found
   * @param contract name of scheme, like "SchemeRegistrar" 
   */
  async scheme(contract) {
    // returns the schemes can be used to register other schemes
    // TODO: error handling: throw an error if such a schem does not exist, and also if there is more htan one
    const settings = await getSettings();
    const contractInfo = settings.daostackContracts[contract];
    // check if indeed the registrar is registered as a scheme on  the controller
    // const isSchemeRegistered = await this.controller.isSchemeRegistered(contractInfo.address);
    // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

    return contractInfo.contract.at(contractInfo.address);
  }

  async checkSchemeConditions(scheme) {
    // check if the scheme if ready for usage - i.e. if the org is registered at the scheme and vice versa
    // check if the schems is usable
    // const controller = this.controller;
    const avatar = this.avatar;

    // check if indeed the registrar is registered as a scheme on  the controller
    // const isSchemeRegistered = await controller.isSchemeRegistered(scheme.address);
    // assert.equal(isSchemeRegistered, true, `${contract} is not registered with the controller`);

    // check if the controller is registered (has paid the fee)
    const isControllerRegistered = await scheme.isRegistered(avatar.address);
    if (!isControllerRegistered) {
        const msg = 'The organization is not registered on this schme: ' + contract +  '; ' + contractInfo.address;
        throw new Error(msg);
    }
    return true;
  }

  vote(proposalId, choice, params) {
    // vote for the proposal given by proposalId using this.votingMachine
    // NB: this will not work for proposals using votingMachine's that are not the default one
    return this.votingMachine.vote(proposalId, choice, params);
  }

}
