"use strict";
// const dopts = require('default-options');

import { ExtendTruffleContract, requireContract } from './utils.js';

const SolidityTokenCapGC = requireContract("TokenCapGC");

export class TokenCapGC extends ExtendTruffleContract(SolidityTokenCapGC) {
  static async new() {
    contract = await SolidityTokenCapGC.new();
    return new this(contract);
  }

  async setParams(params) {
     return await this._setParameters(params.token, params.cap);
   }
}
