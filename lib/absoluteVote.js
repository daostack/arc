"use strict";
// const dopts = require('default-options');

import { ExtendTruffleContract, requireContract } from './utils.js';

const SolidityAbsoluteVote = requireContract("AbsoluteVote");

export class AbsoluteVote extends ExtendTruffleContract(SolidityAbsoluteVote) {
  static async new(opts={}) {
    contract = await SolidityAbsoluteVote.new();
    return new this(contract);
  }

  async setParams(params) {
     return await this._setParameters(params.reputation, params.votePrec, params.ownerVote);
   }
}
