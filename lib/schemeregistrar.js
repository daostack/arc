"use strict";
const SoliditySchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");

export class SchemeRegistrar extends SoliditySchemeRegistrar {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
        tokenAddress: undefined, // the address of a token to use
    };

    const options = Object.assign(defaults, opts);

    let token;
    if (options.tokenAddress == undefined) {
        token = await MintableToken.new('schemeregistrartoken', 'SRT');

    } else {
        token = await MintableToken.at(options.tokenAddress);
    }

    return SoliditySchemeRegistrar.new(token.address, options.fee, options.beneficiary);
  }
}
