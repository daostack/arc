"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract, getWeb3 } from './utils.js';
import { getSettings } from './settings.js';

const SolidityUpgradeScheme = requireContract("UpgradeScheme");
const DAOToken = requireContract("DAOToken");

export class UpgradeScheme extends ExtendTruffleContract(SolidityUpgradeScheme) {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
        tokenAddress: null, // the address of a token to use
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let token;
    if (options.tokenAddress == null) {
        token = await DAOToken.new('schemeregistrartoken', 'SRT');
      // TODO: or is it better to throw an error?
      // throw new Error('A tokenAddress must be provided');
    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SolidityUpgradeScheme.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

/*******************************************
 * proposeController
 */
  async proposeController(opts={}) {
    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined
      /**
       *  controller address
       */
      , controller: undefined
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.controller)
    {
      throw new Error("controller address is not defined");
    }

      let tx = await this.contract.proposeUpgrade(options.avatar, options.controller);

      return tx;
  }


/********************************************
 * proposeUpgradingScheme
 */
    async proposeUpgradingScheme(opts={}) {

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
       *  upgrading scheme address
       */
      , scheme: undefined
      /**
       * hash of the parameters of the upgrading scheme. These must be already registered with the new scheme.
       */
      , schemeParametersHash: undefined
      /**
       * true to register organization into the scheme when the proposal is approved.
       * If false then caller must do it manually via scheme.registerOrganization(avatarAddress).
       * Default is true.
       *
       * [This needs to be implemented]
      , autoRegister:true
       */
      /**
       * The fee that the scheme charges to register an organization in the new upgrade scheme.
       * The controller will be asked in advance to approve this expenditure.
       *
       * If the new UpgradeScheme is an Arc scheme, you may omit fee and we will
       * obtain the values directly from the submitted scheme.
       * Otherwise fee is required.
       *
       * The fee is paid using the token given by tokenAddress.  In Wei.
       */
      , fee: null
      /**
       * address of token that will be used when paying the fee.
       *
       * If the new UpgradeScheme is an Arc scheme, you may omit tokenAddress and we will
       * obtain the values directly from the submitted scheme.
       * Otherwise tokenAddress is required.
       */
      , tokenAddress: null
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

    let feeIsDefined = (options.fee !== null) && (options.fee !== undefined);
    let tokenAddressIsDefined = !!options.tokenAddress;

    /**
     * throws an Error if not valid, yields 0 if null or undefined
     */
    let web3 = getWeb3();
    let fee = web3.toBigNumber(options.fee);
    let tokenAddress = options.tokenAddress;

    if (!feeIsDefined || !tokenAddressIsDefined) {
        try {
          const settings = await getSettings();
          const newScheme = await settings.daostackContracts.UpgradeScheme.contract.at(options.scheme);
          if (!feeIsDefined)
          {
            fee = await newScheme.fee();
          }
          if (!tokenAddressIsDefined)
          {
            tokenAddress = await newScheme.nativeToken();
          }
        } catch(ex) {
          // throw new Error("Unable to obtain default information from the given scheme address. The scheme is probably not an Arc UpgradeScheme and in that case you must supply fee and tokenAddress.");
        }
    }

    if (fee < 0)
    {
      throw new Error("fee cannot be less than 0");
    }

    let tx = await this.contract.proposeChangeUpgradingScheme(
        options.avatar,
        options.scheme,
        options.schemeParametersHash,
        tokenAddress,
        fee);

    return tx;
  }

  async setParams(params) {
    return await this._setParameters(params.voteParametersHash, params.votingMachine);
   }

  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x0000000b';
  }
}
