"use strict";
import { getDefaultAccount } from './utils.js';

const SolidityGlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");

export class GlobalConstraintRegistrar extends SolidityGlobalConstraintRegistrar {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
        tokenAddress: undefined, // the address of a token to use
    };

    const options = Object.assign({}, defaults, opts);

    let token;
    if (options.tokenAddress == undefined) {
      token = await MintableToken.new('globalconstraintregistrartoken', 'GCT');
      // TODO: or is it better to throw an error?
      // throw 'A tokenAddress must be provided';
    } else {
        token = await MintableToken.at(options.tokenAddress);
    }

    return SolidityGlobalConstraintRegistrar.new(token.address, options.fee, options.beneficiary);
  }
}
