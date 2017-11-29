"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract, NULL_ADDRESS } from './utils.js';
import { getSettings } from './settings.js';

const SoliditySchemeRegistrar = requireContract("SchemeRegistrar");
const DAOToken = requireContract("DAOToken");

export class SchemeRegistrar extends ExtendTruffleContract(SoliditySchemeRegistrar) {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
        tokenAddress: undefined, // the address of a token to use
    };

    const options = dopts(opts, defaults);

    let token;
    if (options.tokenAddress == undefined) {
        token = await DAOToken.new('schemeregistrartoken', 'SRT');

    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SoliditySchemeRegistrar.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  async proposeToAddModifyScheme(opts={}) {

    /**
     * Note that explicitly supplying any property with a value of undefined will prevent the property
     * from taking on its default value (weird behavior of default-options)
     */
    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined
      /**
       * scheme address
       */
      , scheme: undefined
      /**
       * scheme identifier, like "SchemeRegistrar" or "SimpleContributionScheme".
       * pass null if registering a non-arc scheme
       */
      , schemeKey: undefined
      /**
       * hash of scheme parameters. These must be already registered with the new scheme.
       */
      , schemeParametersHash: undefined
      /**
       * true to register organization into the scheme when the proposal is approved.
       * If false then caller must do it manually via scheme.registerOrganization(avatarAddress).
       * Default is true.
       */
      , autoRegister:true
    };

    const options = dopts(opts, defaults);

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.scheme)
    {
      throw new Error("scheme is not defined");
    }

    if (!options.schemeParametersHash)
    {
      throw new Error("schemeParametersHash is not defined");
    }

    let tx;

    if (options.schemeKey) {
      const settings = await getSettings();
      const newScheme = await settings.daostackContracts[options.schemeKey].contract.at(options.scheme);
      const fee = await newScheme.fee();
      const tokenAddress = await newScheme.nativeToken();
      // Note that the javascript wrapper "newScheme" we've gotten here is defined in this version of Arc.  If newScheme is 
      // actually coming from a different version of Arc, then theoretically the permissions could be different from this version.
      const permissions = Number(newScheme.getDefaultPermissions());

      if (permissions > this.getDefaultPermissions()) {
        throw new Error("SchemeRegistrar cannot work with schemes having greater permissions than its own");
      }

      tx = await this.contract.proposeScheme(
        options.avatar,
        options.scheme,
        options.schemeParametersHash,
        (permissions & 2) != 0,
        tokenAddress,
        fee,
        options.autoRegister);    
    } else { // no schemeKey, not in DAO

      tx = await this.contract.proposeScheme(
        options.avatar,
        options.scheme,
        options.schemeParametersHash,
        // TODO: should caller be able to specify the rest of these parameters for non-arc schemes?
        false,
        NULL_ADDRESS,
        0,
        options.autoRegister);
    }

    return tx;
  }

  async proposeToRemoveScheme(opts={}) {

    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined
      /**
       * scheme address
       */
      , scheme: undefined
    };

    const options = dopts(opts, defaults);

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.scheme)
    {
      throw new Error("scheme address is not defined");
    }

    let tx = await this.contract.proposeToRemoveScheme(options.avatar, options.scheme);

    return tx;
  }

  async setParams(params) {
     return await this._setParameters(params.voteParametersHash, params.voteParametersHash, params.votingMachine);
   }
  
  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000003';
  }
}
