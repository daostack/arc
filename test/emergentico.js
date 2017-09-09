/* eslint no-console:  "off" */

import * as helpers from './helpers';
import { Organization } from '../lib/organization.js';

const EmergentICO = artifacts.require("./EmergentICO.sol");

// Vars
let accounts, org, newICO;
let admin, target, startBlock,periodDuration, minDonation, initialRate, rateFractionNumerator, rateFractionDenominator, batchSize;

const setupEmergentICO = async function(opts={}){

  accounts = web3.eth.accounts;

  admin = accounts[0];
  target = accounts[9];
  startBlock = opts.startBlock || web3.eth.blockNumber;
  periodDuration = opts.periodDuration || 10;
  minDonation =  web3.toWei(1, "ether");
  initialRate = 100;
  rateFractionNumerator = opts.rateFractionNumerator || 99;
  rateFractionDenominator = opts.rateFractionDenominator || 100;
  batchSize = web3.toWei(20, "ether");
  const founders = [
    {
      address: accounts[0],
      reputation: 30,
      tokens: 30,
    }];
  org = await Organization.new({
    orgName: 'AdamsOrg',
    tokenName: 'AdamCoin',
    tokenSymbol: 'ADM',
    founders,
  });
  newICO = await EmergentICO.new(org.controller.address, admin, target, startBlock, periodDuration, minDonation, initialRate, rateFractionNumerator, rateFractionDenominator, batchSize);
  const schemeRegistrar = await org.scheme('SchemeRegistrar');
  const token = org.token;
  // propose the ICO as a schme for the organization - in this case, the scheme is immediately accepted as the proposer has a majority
  await schemeRegistrar.proposeScheme(org.avatar.address, newICO.address, 0, false, token.address, 0, false);

};



contract("EmergentICO", function(accounts){
  before(function() {
    helpers.etherForEveryone();
  });

  // it("should log the LogDonationReceived event on donating", async function() {
  //
  // });
  // it("should log the LogPeriodAverageComputed event on canceling a porposal", async function() {
  //
  // });
  // it("should log the LogCancelProposal event on canceling a porposal", async function() {
  //
  // });
  //
  // it("Check rate function", async function(){
  //   await setupEmergentICO();
  //
  //   const frac = rateFractionNumerator/rateFractionDenominator;
  //
  //   const batch7Rate = Number(web3.toWei(initialRate*frac**7),"ether");
  //   // const batch7Rate = Number(web3.toWei(initialRate*frac**7, "ether"));
  //   const batch17Rate =  Number(web3.toWei(initialRate*frac**17),"ether");
  //
  //   // Checking rate is the same up to rounding error
  //   assert(Math.abs(batch7Rate - Number (await newICO.rate18Digits(7)))/batch7Rate < 10**(-8));
  //   assert(Math.abs(batch17Rate - Number (await newICO.rate18Digits(17)))/batch7Rate < 10**(-8));
  // });
  //

  it("Check average rate function", async function(){
    // fac = 0.9
    await setupEmergentICO();

    let frac = rateFractionNumerator/rateFractionDenominator;
    let start = 31;
    let end = 85;

    let averageRate = initialRate*(9*frac + 20*frac**2 + 20*frac**3 + 5*frac**4)/(end-start);
    let averageRateInWei = Number(web3.toWei(averageRate, "ether"));
    let averageRateInWeiCalculated = Number(await newICO.averageRateInWei(web3.toWei(start, "ether"), web3.toWei(end, "ether")));
    assert.equal(averageRateInWei,  averageRateInWei);
    // Checking rate is the same up to rounding error:
    assert(Math.abs(averageRateInWei - averageRateInWeiCalculated)/averageRateInWei < 10**(-8));
  });

  it("Only admin can halt and resume the ICO", async function(){

    await setupEmergentICO();

    await newICO.haltICO();
    // ICO should be inactive - Admin halted
    assert.equal(await newICO.isActive(), false);
    newICO.resumeICO();
    // ICO should be active - Admin resumed
    assert.equal(await newICO.isActive(), true);

    // only the admin can halt the ICO
    try {
        await newICO.haltICO({from: accounts[1]});
        throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }
    // ICO should be still active - The halt request sent from non admin account
    assert.equal(await newICO.isActive(), true);

    // Halting the ICO:
    await newICO.haltICO();
    // only the admin can resume the ICO
    try {
        await newICO.resumeICO({from: accounts[1]});
        throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }
    // ICO should still be halted:
    assert.equal(await newICO.isActive(), false);
  });

  it("Try donating when ICO is halted", async function(){
    await setupEmergentICO();

    // Halting the ICO:
    await newICO.haltICO();

    // Try to donate:
    try {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: newICO.address,
        value: web3.toWei(2, "ether"),
      });
      throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }

    // Checking contract variables:
    assert.equal(await newICO.totalReceived(), 0);
    assert.equal(await newICO.donationCounter(), 0);
  });

  it("Try donating below minimum", async function(){
    await setupEmergentICO();

    // Try to donate:
    try {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: newICO.address,
        value: web3.toWei(0.5, "ether"),
      });
      throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }

    // Checking contract variables:
    assert.equal(await newICO.totalReceived(), 0);
    assert.equal(await newICO.donationCounter(), 0);
  });

  it("Single regular donation", async function(){
    await setupEmergentICO();

    const donationInWei = web3.toWei(2, "ether");
    const targetOriginalBalance = await web3.eth.getBalance(target);

    // Regular small send:
    await web3.eth.sendTransaction({
      from: accounts[1],
      to: newICO.address,
      value: web3.toWei(2, "ether"),
      gas: 600000
    });
    // Checking contract variables:
    assert.equal(Number(await newICO.totalReceived()), donationInWei);
    assert.equal(Number(await newICO.totalDonated()), donationInWei);
    assert.equal(await newICO.donationCounter(), 1);
    assert.equal(Number(await web3.eth.getBalance(target)), Number(targetOriginalBalance) + Number(donationInWei));
  });

  it("Single donation with limit", async function(){
    await setupEmergentICO();

    const donationInWei = web3.toWei(2, "ether");
    const targetOriginalBalance = await web3.eth.getBalance(target);

    // Donating:
    await newICO.donate(accounts[2], web3.toWei(5,"ether"), {from: accounts[1], value: donationInWei});

    // Checking contract variables:
    assert.equal(Number(await newICO.totalReceived()), donationInWei);
    assert.equal(await newICO.totalDonated(), 0);
    assert.equal(await newICO.donationCounter(), 1);
    assert.equal(await Number(web3.eth.getBalance(target)), Number(targetOriginalBalance));
  });

  it("currentPeriodId should behave as expected", async function(){
    let expectedPeriodId, periodId;
    await setupEmergentICO();
    periodId = Number(await newICO.currentPeriodId());
    expectedPeriodId = Math.floor((web3.eth.blockNumber - startBlock)/periodDuration);
    assert.equal(periodId, expectedPeriodId);

    // it takesa bout 14 blocks to setup the ICO, so we expect the periodId here to be 0
    await setupEmergentICO({startBlock: web3.eth.blockNumber + 14});
    periodId = Number(await newICO.currentPeriodId());
    expectedPeriodId = Math.floor((web3.eth.blockNumber - startBlock)/periodDuration);
    assert.equal(periodId, expectedPeriodId);

    // put the startBlock far in the future
    await setupEmergentICO({startBlock: web3.eth.blockNumber + 10000});

    // currentPeriodId throws an error if the period is in the future
    try {
        await newICO.currentPeriodId();
        throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }

    // expectedPeriodId = Math.floor((web3.eth.blockNumber - startBlock)/periodDuration);
    assert.equal(await newICO.isActive(), false);
  });

  it("Full scenario 1", async function(){
    await setupEmergentICO();

    // Original data:
    const period = Number(await newICO.currentPeriodId());

    // Donating. First donation is without a limit on the price, the other three are.
    await newICO.donate(accounts[1], 0, {from: accounts[1], value: web3.toWei(15, "ether")});
    await newICO.donate(accounts[3], web3.toWei(99.95,"ether"), {from: accounts[3], value: web3.toWei(4, "ether")});
    await newICO.donate(accounts[4], web3.toWei(99,"ether"), {from: accounts[4], value: web3.toWei(12, "ether")});
    await newICO.donate(accounts[5], web3.toWei(98.5,"ether"), {from: accounts[5], value: web3.toWei(11, "ether")});

    // console.log(await newICO.averageRateInWei(web3.toWei(0, "ether"), web3.toWei(42, "ether")));

    // Mining blocks to end period:
    while(Number(await newICO.currentPeriodId()) == period) {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: accounts[1],
          value: web3.toWei(0.1,"ether")
        });
    }
    // we shoudl now be at the next period
    assert.equal(Number(await newICO.currentPeriodId()), period + 1);

    // Checking contract variables:
    // a total of 4 donataions was made
    assert.equal(await newICO.donationCounter(), 4);
    assert.equal(Number(await newICO.totalReceived()), Number(web3.toWei(15 + 4 + 12 + 11, "ether")));

    // only the first donation is counted for 'totalDonated'; the others specified a minimal rate and will only be counted later,
    assert.equal(await newICO.totalDonated(), Number(web3.toWei(15, "ether")));

    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<period; cnt++) {
      await newICO.setAverageAndTest(cnt, web3.toWei(initialRate), 0);
    }
    const periodInit = await newICO.getIsPeriodInitialized(period);
    assert.equal(periodInit, true);

    // Try a wrong average:
    const avgWrong = await newICO.averageRateInWei(0, web3.toWei(39,"ether"));
    await newICO.setAverageAndTest(period, avgWrong, 3);
    const periodPlus1InitFalse = await newICO.getIsPeriodInitialized(period+1);
    assert.equal(periodPlus1InitFalse, false);

    // Compute average and let contract test it:
    const avg = await newICO.averageRateInWei(0, web3.toWei(38,"ether"));
    await newICO.setAverageAndTest(period, avg, 1);
    await newICO.checkAverage(period, 2);
    const periodPlus1Init = await newICO.getIsPeriodInitialized(period+1);
    assert.equal(periodPlus1Init, true);

    // Retrieve ether:
    const gasPrice = await web3.eth.gasPrice;
    let account3EthBefore = await web3.eth.getBalance(accounts[3]);
    const account3BeforePlusDonation = Number(account3EthBefore) + Number(web3.toWei(4));
    let tx = await newICO.collectMyTokens(1, { from: accounts[3], gasPrice: gasPrice });
    let gasCost = Number(tx.receipt.gasUsed)*gasPrice;
    let account3EthAfter = await web3.eth.getBalance(accounts[3]);
    let account3AfterPlusGas = Number(account3EthAfter) + Number(gasCost);
    assert(Math.abs(account3BeforePlusDonation - account3AfterPlusGas)/account3AfterPlusGas < 10**(-8));

    // Try to retrieve ether twice:
    account3EthBefore = await web3.eth.getBalance(accounts[3]);

    tx = await newICO.collectMyTokens(1, { from: accounts[3], gasPrice: gasPrice });
    gasCost = Number(tx.receipt.gasUsed)*gasPrice;
    account3EthAfter = await web3.eth.getBalance(accounts[3]);
    account3AfterPlusGas = Number(account3EthAfter) + Number(gasCost);
    assert(Math.abs(Number(account3EthBefore) - account3AfterPlusGas)/account3AfterPlusGas < 10**(-8));

     // Collect tokens:
     const averageRateInWei = Number(await newICO.averageRateInWei(0, web3.toWei(38)));
     const tokensToBeCollected = averageRateInWei*11;
     const token = org.token;
     const initBalance5 = await token.balanceOf(accounts[5]);
     await newICO.collectMyTokens(3, { from: accounts[5] });
     const balance5 = await token.balanceOf(accounts[5]);
     const collectedTokens = Number(balance5) - Number(initBalance5);
     assert(Math.abs(collectedTokens - tokensToBeCollected)/tokensToBeCollected < 10**(-8));
  });

  // it("Full scenario 2", async function() {
  //   await setupEmergentICO();
  //
  //   // Original data:
  //   const period = Number(await newICO.currentPeriodId());
  //
  //   // Donating:
  //   await newICO.donate(accounts[1], 0, {from: accounts[1], value: web3.toWei(20, "ether")});
  //   await newICO.donate(accounts[3], web3.toWei(98,"ether"), {from: accounts[3], value: web3.toWei(10, "ether")});
  //   await newICO.donate(accounts[4], 0, {from: accounts[4], value: web3.toWei(12, "ether")});
  //   await newICO.donate(accounts[5], web3.toWei(97.5,"ether"), {from: accounts[5], value: web3.toWei(7, "ether")});
  //   await newICO.donate(accounts[5], web3.toWei(97.5,"ether"), {from: accounts[5], value: web3.toWei(7, "ether")});
  //
  //   // Mining blocks to end of the next period:
  //   while(Number(await newICO.currentPeriodId()) <= period + 1) {
  //       await web3.eth.sendTransaction({
  //         from: accounts[0],
  //         to: accounts[1],
  //         value: web3.toWei(0.1,"ether")
  //       });
  //   }
  //
  //   // Checking contract variables:
  //   assert.equal(Number(await newICO.totalReceived()), Number(web3.toWei(56, "ether")));
  //   assert.equal(await newICO.totalDonated(), Number(web3.toWei(32, "ether")));
  //   assert.equal(await newICO.donationCounter(), 5);
  //
  //   // Compute all previous periods, and initialize current period:
  //   for (let cnt=0; cnt<period; cnt++) {
  //     let avg = await newICO.averageRateInWei(0, web3.toWei(38,"ether"));
  //     await newICO.setAverageAndTest(cnt, web3.toWei(avg), 5);
  //   }
  //   const periodInit = await newICO.getIsPeriodInitialized(Number(await newICO.currentPeriodId()));
  //   assert.equal(periodInit, true);
  // });


  async function run_scenario(opts) {
    /*

      run_scenario({
        icoConfig:  {
          periodDuration: 50
        },
        donations: [{
          beneficiary: accounts[1],
          amount: 2,
          minRate: 0,
      }]
    })
    */
    await setupEmergentICO(opts.icoConfig);
    let donation;
    for (let i=0; i<opts.donations.length; i++) {
      donation = opts.donations[i];
      donation.from = donation.from || donation.beneficiary;
      donation.minRate = donation.minRate || 0;
      await newICO.donate(donation.beneficiary, web3.toWei(donation.minRate, "ether"), {from: donation.from, value: web3.toWei(donation.amount, "ether")});
    }

    // finish the currentPeriod
    const currentPeriod = Number(await newICO.currentPeriodId());
    // console.log(currentPeriod);
    // console.log('periodDuration:', Number(await newICO.periodDuration()));
    // Mine blocks to end of the next period:
    while(Number(await newICO.currentPeriodId()) <= currentPeriod + 1) {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: accounts[1],
          value: web3.toWei(0.1,"ether")
        });
    }

    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<currentPeriod; cnt++) {
      let avg = await newICO.averageRateInWei(0, web3.toWei(0,"ether"));
      await newICO.setAverageAndTest(cnt, web3.toWei(avg), 0);
    }
    const periodInit = await newICO.getIsPeriodInitialized(currentPeriod);
    assert.equal(periodInit, true);

    // compute all totals
    const avg = await newICO.averageRateInWei(0, web3.toWei(10,"ether"));
    await newICO.setAverageAndTest(currentPeriod, avg, 0);
    const periodPlus1Init = await newICO.getIsPeriodInitialized(currentPeriod+1);
    assert.equal(periodPlus1Init, true);


    // collect the tokens
    for(let i=0; i < opts.donations.length; i++) {
      await newICO.collectMyTokens(i, { from: opts.donations[i].beneficiary });
    }

    // check the results
    const token = org.token;
    assert.equal((await token.balanceOf(accounts[1])).toNumber(), web3.toWei(100*10, "ether"));

  }

  it("Full scenario (single donation)", async function() {
    await run_scenario({
      icoConfig: {
        periodDuration: 30, // set up so that all donaations are likely to fall within the same period
      },
      donations: [
        {
          beneficiary: accounts[1],
          amount: 10,
          minRate: 0
        },
      ],
      expected: {
        tokenDistribution: [{
          account: accounts[1],
          tokens: 100 * 10,
        }]
      }
    });
  });
});
