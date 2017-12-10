"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract } from './utils.js';

const SolidityGlobalConstraintRegistrar = requireContract("GlobalConstraintRegistrar");
const DAOToken = requireContract("DAOToken");

export class GlobalConstraintRegistrar extends ExtendTruffleContract(SolidityGlobalConstraintRegistrar) {
  static async new(opts={}) {
    // TODO: provide options to use an existing token or specify the new token
    const defaults = {
        fee: 0, // the fee to use this scheme, in Wei
        beneficiary: getDefaultAccount(),
        tokenAddress: null, // the address of a token to use
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let token;
    if (options.tokenAddress == null) {
      token = await DAOToken.new('globalconstraintregistrartoken', 'GCT');
      // TODO: or is it better to throw an error?
      // throw new Error('A tokenAddress must be provided');
    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SolidityGlobalConstraintRegistrar.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  async proposeToAddModifyGlobalConstraint(opts={}) {
    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined
      /**
       *  the address of the global constraint to add
       */
      , globalConstraint: undefined
      /**
       * hash of the parameters of the global contraint
       */
      , globalConstraintParametersHash: undefined
      /**
       * voting machine to use when voting to remove the global constraint
       */
      , votingMachineHash: undefined
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.globalConstraint)
    {
      throw new Error("avatar globalConstraint is not defined");
    }

    if (!options.globalConstraintParametersHash)
    {
      throw new Error("avatar globalConstraintParametersHash is not defined");
    }

    if (!options.votingMachineHash)
    {
      throw new Error("avatar votingMachineHash is not defined");
    }
  // console.log(`****** avatar ${options.avatar} ******`);
  // console.log(`****** globalConstraint ${options.globalConstraint} ******`);
  // console.log(`****** globalConstraintParametersHash ${options.globalConstraintParametersHash} ******`);
  // console.log(`****** votingMachineHash ${options.votingMachineHash} ******`);

    let tx = await this.contract.proposeGlobalConstraint(
      options.avatar,
      options.globalConstraint,
      options.globalConstraintParametersHash,
      options.votingMachineHash);

    return tx;
  }

  async proposeToRemoveGlobalConstraint(opts={}) {

    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined
      /**
       *  the address of the global constraint to remove
       */
      , globalConstraint: undefined
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.globalConstraint)
    {
      throw new Error("avatar globalConstraint is not defined");
    }

    let tx = await this.contract.proposeToRemoveGC(options.avatar, options.globalConstraint);

    return tx;
  }

  async setParams(params) {
    return await this._setParameters(params.voteParametersHash, params.votingMachine);
  }

  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000007';
  }
}
