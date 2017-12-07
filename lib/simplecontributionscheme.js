"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, requireContract, getWeb3 } from './utils.js';

const SoliditySimpleContributionScheme = requireContract("SimpleContributionScheme");
const DAOToken = requireContract("DAOToken");

class SimpleContributionScheme extends ExtendTruffleContract(SoliditySimpleContributionScheme) {

  static async new(opts={}) {
    // TODO: provide options to use an existing token or specifiy the new token
    const defaults = {
        tokenAddress: null, // the address of a token to use
        fee: 0, // the fee to use this scheme
        beneficiary: getDefaultAccount(),
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    let token;
    if (options.tokenAddress == null) {
        token = await DAOToken.new('schemeregistrartoken', 'STK');
      // TODO: or is it better to throw an error?
      // throw new Error('A tokenAddress must be provided');
    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SoliditySimpleContributionScheme.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  async proposeContribution(opts={}) {
    /**
     * Note that explicitly supplying any property with a value of undefined will prevent the property
     * from taking on its default value (weird behavior of default-options)
     */
    const defaults = {
      /**
       * avatar address
       */
      avatar: undefined,
      /**
       * description of the constraint
       */
      description: undefined,
      /**
       * reward in the DAO's native token.  In Wei.
       */
      nativeTokenReward: 0,
      /**
       * reward in the DAO's native reputation.  In Wei.
       */
      reputationReward: 0,
      /**
       * reward in ethers.  In Wei.
       */
      ethReward: 0,
      /**
       * the address of an external token (for externalTokenReward)
       * Only required when externalTokenReward is non-zero.
       */
      externalToken: null,
      /**
       * reward in the given external token.  In Wei.
       */
      externalTokenReward: 0,
      /**
       *  beneficiary address
       */
      beneficiary: undefined
    };

    const options = dopts(opts, defaults, { allowUnknown: true });

    if (!options.avatar)
    {
      throw new Error("avatar address is not defined");
    }

    if (!options.description)
    {
      throw new Error("description is not defined");
    }

    /**
     * will thrown Error if not valid numbers
     */
    let web3 = getWeb3();
    let nativeTokenReward = web3.toBigNumber(options.nativeTokenReward);
    let reputationReward = web3.toBigNumber(options.reputationReward);
    let ethReward = web3.toBigNumber(options.ethReward);
    let externalTokenReward = web3.toBigNumber(options.externalTokenReward);

    if ((nativeTokenReward < 0) || (reputationReward < 0) || (ethReward < 0) || (externalTokenReward < 0))
    {
      throw new Error("rewards cannot be less than 0");
    }

    if (!((nativeTokenReward > 0) || (reputationReward > 0) || (ethReward > 0) || (externalTokenReward > 0)))
    {
      throw new Error("no reward amount was given");
    }

    if ((externalTokenReward > 0) && !options.externalToken)
    {
      throw new Error("external token reward is proposed but externalToken is not defined");
    }

    if (!options.beneficiary) {
      throw new Error("beneficiary is not defined");
    }

    // is the organization registered?
    // let msg = `This organization ${options.avatar} is not registered on the current scheme ${this.address}`;
    // assert.isOk(await this.isRegistered(options.avatar), msg);

    // TODO: Check if the fees are payable
    // check fees; first get the parameters
    // const avatarContract = await Avatar.at(options.avatar);
    // const controller = await Controller.at(await avatarContract.owner());
    // const paramsHash = await controller.getSchemeParameters(this.address);
    // const params = await this.contract.parameters(paramsHash);
    // params have these
    // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
    // bytes32 voteApproveParams;
    // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
    // BoolVoteInterface boolVote;
    // assert.equal(params[0].toNumber(), 0);
    // assert.equal(params[2].toNumber(), 0);

    // console.log(`********* options.avatar ${options.avatar} **********`);
    // console.log(`********* options.description ${options.description} **********`);
    // console.log(`********* options.nativeTokenReward ${options.nativeTokenReward} **********`);
    // console.log(`********* options.reputationReward ${options.reputationReward} **********`);
    // console.log(`********* options.ethReward ${options.ethReward} **********`);
    // console.log(`********* options.externalToken ${options.externalToken} **********`);
    // console.log(`********* options.externalTokenReward ${options.externalTokenReward} **********`);
    // console.log(`********* options.beneficiary ${options.beneficiary} **********`);

    const tx = await this.contract.submitContribution(
        options.avatar,
        options.description,
        nativeTokenReward,
        reputationReward,
        ethReward,
        options.externalToken,
        externalTokenReward,
        options.beneficiary
    );
    return tx;
  }

  async setParams(params) {
    return await this._setParameters(params.orgNativeTokenFee, params.schemeNativeTokenFee, params.voteParametersHash, params.votingMachine);
  }

  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000001';
  }
}

export { SimpleContributionScheme };
