"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract } from './utils.js';

const SolidityGlobalConstraintRegistrar = requireContract("GlobalConstraintRegistrar");
const DAOToken = requireContract("DAOToken");

export class GlobalConstraintRegistrar extends ExtendTruffleContract(SolidityGlobalConstraintRegistrar) {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
        tokenAddress: null, // the address of a token to use
    };

    const options = dopts(opts, defaults);

    let token;
    if (options.tokenAddress == null) {
      token = await DAOToken.new('globalconstraintregistrartoken', 'GCT');
      // TODO: or is it better to throw an error?
      // throw 'A tokenAddress must be provided';
    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SolidityGlobalConstraintRegistrar.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  async setParams(params) {
    return await this._setParameters(params.voteParametersHash, params.votingMachine);
  }
  
  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000005';
  }  
}
