"use strict";
const dopts = require('default-options');

import { getDefaultAccount, ExtendTruffleContract, getValueFromLogs, requireContract } from './utils.js';

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

    const options = dopts(opts, defaults);

    let token;
    if (options.tokenAddress == null) {
        token = await DAOToken.new('schemeregistrartoken', 'STK');
      // TODO: or is it better to throw an error?
      // throw 'A tokenAddress must be provided';
    } else {
        token = await DAOToken.at(options.tokenAddress);
    }

    contract = await SoliditySimpleContributionScheme.new(token.address, options.fee, options.beneficiary);
    return new this(contract);
  }

  async submitContribution(opts={}) {
    const defaults = {
      avatar: undefined,
      description: undefined,
      nativeTokenReward: 0,
      reputationReward: 0,
      ethReward: 0,
      // TODO: This is an arbitrary address, which is no good.
      externalToken: '0x0008e8314d3f08fd072e06b6253d62ed526038a0',
      externalTokenReward: 0,
      beneficiary: undefined,
    };

    const options = dopts(opts, defaults);

    // is the organization registered?
    let msg = `This organization ${options.avatar} is not registered on the current scheme ${this.address}`;
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

    const tx = await this.contract.submitContribution(
        options.avatar, // Avatar _avatar,
        options.description, // string _contributionDesciption,
        options.nativeTokenReward, // uint _nativeTokenReward,
        options.reputationReward, // uint _reputationReward,
        options.ethReward, // uint _ethReward,
        options.externalToken, // StandardToken _externalToken,
        options.externalTokenReward, // uint _externalTokenReward,
        options.beneficiary // address _beneficiary
    );
    return getValueFromLogs(tx, '_proposalId');
  }

  async setParams(params) {
    return await this._setParameters(params.orgNativeTokenFee, params.schemeNativeTokenFee, params.voteParametersHash, params.votingMachine);
  }

  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000001';
  }
}

export { SimpleContributionScheme };
