"use strict";
const SoliditySimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");

// export class SimpleContributionScheme extends SoliditySimpleContributionScheme {
export class Test {
  tmp() {
    return 'xx';
  }

}
export class SimpleContributionScheme {

  tmp() {
    return 'THIS IS THE DERIVED CLASS';
  }
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
    console.log('xxxx');
    return;
    options.avatar = avatar;
    options.contributionDesciption = contributionDesciption;
    options.nativeTokenReward = nativeTokenReward;
    options.reputationReward = reputationReward;
    options.ethReward = ethReward;
    options.externalToken = externalToken;
    options.externalTokenReward = externalTokenReward;
    options.beneficiary = beneficiary;

    assert.isOk(await scheme.isRegistered(options.avatar));

    return super.submitContribution(
        options.avatar,
        options.contributionDesciption,
        options.nativeTokenReward,
        options.reputationReward,
        options.ethReward,
        options.externalToken,
        options.externalTokenReward,
        options.beneficiary
    );
  }
}
