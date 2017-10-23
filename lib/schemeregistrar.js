"use strict";
const dopts = require('default-options');

import { ExtendTruffleContract, requireContract } from './utils.js';

const SoliditySchemeRegistrar = requireContract("SchemeRegistrar");


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
}
