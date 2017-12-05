"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract } from './utils.js';
import { getSettings } from './settings.js';

const SoliditySchemeRegistrar = requireContract("SchemeRegistrar");
const DAOToken = requireContract("DAOToken");

export class SchemeRegistrar extends ExtendTruffleContract(SoliditySchemeRegistrar) {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme, in Wei
        beneficiary: getDefaultAccount(),
        tokenAddress: undefined, // the address of a token to use
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let token;
    if (options.tokenAddress == undefined) {
        token = await DAOToken.new('schemeregistrartoken', 'SRT');

    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SoliditySchemeRegistrar.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  /**
   * Note relating to permissions: According rules defined in the Controller,
   * this SchemeRegistrar is only capable of registering schemes that have 
   * either no permissions or have the permission to register other schemes.
   * Therefore Arc's SchemeRegistrar is not capable of registering schemes 
   * that have permissions greater than its own, thus excluding schemes having
   * the permission to add/remove global constraints or upgrade the controller.  
   * The Controller will throw an exception when an attempt is made
   * to add or remove schemes having greater permissions than the scheme attempting the change.
   */
  async proposeToAddModifyScheme(opts={}) {

    /**
     * Note that explicitly supplying any property with a value of undefined will prevent the property
     * from taking on its default value (weird behavior of default-options).
     * 
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
       * The fee that the scheme charges to register an organization in the scheme.  The controller
       * will be asked in advance to approve this expenditure.
       * 
       * fee should only be supplied when schemeKey is not given (and thus the scheme is non-Arc).
       * Otherwise we use the amount of the fee of the scheme given by scheme and schemeKey.
       * 
       * The fee is paid using the token given by tokenAddress.  In Wei.
       */
      , fee: null
      /**
       * The token used to pay the fee that the scheme charges to register an organization in the scheme.
       * 
       * tokenAddress should only be supplied when schemeKey is not given (and thus the scheme is non-Arc)
       * and the fee is non-zero.
       */
      , tokenAddress: null
      /**
       * true if the given scheme is able to register/unregister/modify schemes.
       * 
       * isRegistering should only be supplied when schemeKey is not given (and thus the scheme is non-Arc).
       * Otherwise we determine it's value based on scheme and schemeKey.
       */
      , isRegistering: null
      /**
       * true to register organization into the scheme when the proposal is approved.
       * If false then caller must do it manually via scheme.registerOrganization(avatarAddress).
       * Default is true.
       */
      , autoRegister:true
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

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

    let fee;
    let tokenAddress;
    let isRegistering;

    if (options.schemeKey) {
      const settings = await getSettings();
      const newScheme = await settings.daostackContracts[options.schemeKey].contract.at(options.scheme);
      // Note that the javascript wrapper "newScheme" we've gotten here is defined in this version of Arc.  If newScheme is 
      // actually coming from a different version of Arc, then theoretically the permissions could be different from this version.
      const permissions = number(newScheme.getDefaultPermissions());
      fee = await newScheme.fee();
      tokenAddress = await newScheme.nativeToken();
      isRegistering = (permissions & 2) != 0;

      if (permissions > this.getDefaultPermissions()) {
        throw new Error("SchemeRegistrar cannot work with schemes having greater permissions than its own");
      }
    } else {
      /**
       * fee will be NaN if not given.  Note that NaN evaluates to falsey and so does 0.
       */
      fee = Number(options.fee === null ? undefined: options.fee);
      tokenAddress = options.tokenAddress;
      isRegistering = options.isRegistering;

      if (isRegistering === null) {
        throw new Error("isRegistering is not defined; it is required for non-Arc schemes (schemeKey is undefined)");
      }

      if (Number.isNaN(fee) || !tokenAddress) {
        throw new Error("fee/tokenAddress are not defined; they are required for non-Arc schemes (schemeKey is undefined)");
      }

      if (fee < 0) {
        throw new Error("fee cannot be less than zero");
      }
    }

    let tx = await this.contract.proposeScheme(
      options.avatar,
      options.scheme,
      options.schemeParametersHash,
      isRegistering,
      tokenAddress,
      fee,
      options.autoRegister);    

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

    const options = dopts(opts, defaults, { allowUnknown: true });

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
