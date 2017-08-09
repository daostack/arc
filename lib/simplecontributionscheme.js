"use strict";
import { ExtendTruffleContract } from './utils.js';

const SoliditySimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");
const Controller = artifacts.require("./Controller.sol");
const Avatar = artifacts.require("./Avatar.sol");

class SimpleContributionScheme extends ExtendTruffleContract(SoliditySimpleContributionScheme) {

  async submitContribution(
      avatar,
      contributionDesciption,
      nativeTokenReward,
      reputationReward,
      ethReward,
      externalToken,
      externalTokenReward,
      beneficiary
  ) {
    let options = {};
    options.avatar = avatar;
    options.contributionDesciption = contributionDesciption;
    options.nativeTokenReward = nativeTokenReward;
    options.reputationReward = reputationReward;
    options.ethReward = ethReward;
    options.externalToken = externalToken;
    options.externalTokenReward = externalTokenReward;
    options.beneficiary = beneficiary;

    // is the organization registered?
    assert.isOk(await this.isRegistered(options.avatar));

    // check fees; first get the parameters
    const avatarContract = await Avatar.at(options.avatar);
    const controller = await Controller.at(await avatarContract.owner());
    const paramsHash = await controller.getSchemeParameters(this.address);
    const params = await this.contract.parameters(paramsHash);

    // params have these
    // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
    // bytes32 voteApproveParams;
    // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
    // BoolVoteInterface boolVote;
    // XXX: Check if the fees are payable
    // assert.equal(params[0].toNumber(), 0);
    // assert.equal(params[2].toNumber(), 0);

    return this.contract.submitContribution(
        options.avatar,
        options.contributionDesciption,
        options.nativeTokenReward,
        options.reputationReward,
        options.ethReward,
        options.externalToken,
        options.externalTokenReward,
        options.beneficiary
    );
  };
}

export { SimpleContributionScheme };
