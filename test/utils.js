"use strict";
import { ExtendTruffleContract } from '../lib/utils.js';

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
}


contract('ExtendTruffleContract', function() {

  it("Must have sane inheritance", async function(){
    let x;
    x = await SimpleContributionScheme.new();
    assert.isOk(x.nativeToken());
    assert.equal(x.foo(), 'bar');
    assert.equal(x.submitContribution(), 'abc');
    assert.equal(await x.nativeToken(), await x.contract.nativeToken());

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
