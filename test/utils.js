"use strict";
import { ExtendTruffleContract } from '../lib/utils.js';
import * as helpers from './helpers';

const SoliditySimpleContributionScheme = artifacts.require("./SimpleContributionScheme.sol");

class SimpleContributionScheme extends ExtendTruffleContract(SoliditySimpleContributionScheme) {

  foo() {
    // console.log('foo() called');
    return 'bar';
  }

  submitContribution() {
    // console.log('submitContribution() called');
    return 'abc';
  }


  async setParams(params) {
    return await this._setParameters(params.orgNativeTokenFee, params.schemeNativeTokenFee, params.voteParametersHash, params.votingMachine);
   }

  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000009';
  }

}


contract('ExtendTruffleContract', function() {

  it("Must have sane inheritance", async function(){
    let x;
    x = await SimpleContributionScheme.new();
    assert.isOk(x.nativeToken());
    assert.equal(x.foo(), 'bar');
    assert.equal(x.submitContribution(), 'abc');
    assert.equal(await x.nativeToken(), await x.contract.nativeToken());
    assert.equal(await x.setParams({ orgNativeTokenFee: 0, schemeNativeTokenFee: 0, voteParametersHash: helpers.SOME_HASH, votingMachine: helpers.SOME_ADDRESS }), '0xb6660b30e997e8e19cd58699fbf81c41450f200dbcb9f6a85c07b08483c86ee9');
    assert.equal(x.getDefaultPermissions(), '0x00000009');

    x = await SimpleContributionScheme.at((await SoliditySimpleContributionScheme.deployed()).address);
    assert.isOk(x.nativeToken());
    assert.equal(x.foo(), 'bar');
    assert.equal(x.submitContribution(), 'abc');
    assert.equal(await x.nativeToken(), await x.contract.nativeToken());

    x = await SimpleContributionScheme.at((await SoliditySimpleContributionScheme.deployed()).address);
    assert.isOk(x.nativeToken());
    assert.equal(x.foo(), 'bar');
    assert.equal(x.submitContribution(), 'abc');
    assert.equal(await x.nativeToken(), await x.contract.nativeToken());

  });
});
