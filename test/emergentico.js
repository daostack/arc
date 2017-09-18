/* eslint no-console:  "off" */

import * as helpers from './helpers';
import { Organization } from '../lib/organization.js';
import { getValueFromLogs } from '../lib/utils.js';
const EmergentICO = artifacts.require("./EmergentICO.sol");

// Vars
let accounts, org, newICO;
let admin, beneficiary, startBlock,periodDuration, minDonation, initialRate, rateFractionNumerator, rateFractionDenominator, batchSize;

const setupEmergentICO = async function(opts={}){

  accounts = web3.eth.accounts;

  admin = accounts[0];
  beneficiary = accounts[4];
  startBlock = opts.startBlock || web3.eth.blockNumber;
  periodDuration = opts.periodDuration || 30;
  minDonation =  web3.toWei(1, "ether");
  initialRate = opts.initialRate || 100;
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
  newICO = await EmergentICO.new(
    org.controller.address,
    admin,
    beneficiary,
    startBlock,
    periodDuration,
    minDonation,
    initialRate,
    rateFractionNumerator,
    rateFractionDenominator,
    batchSize
  );
  const schemeRegistrar = await org.scheme('SchemeRegistrar');
  const token = org.token;
  // propose the ICO as a schme for the organization - in this case, the scheme is immediately accepted as the proposer has a majority
  await schemeRegistrar.proposeScheme(org.avatar.address, newICO.address, 0, false, token.address, 0, false);
};


contract("EmergentICO", function(accounts){
  before(function() {
    helpers.etherForEveryone();
  });
  // /***********************
  it("should log the LogDonationReceived event on donating", async function() {
    await setupEmergentICO();
    let tx = await newICO.donate(accounts[1], 0, {from: accounts[1], value: web3.toWei(15, "ether")});
    assert.equal(getValueFromLogs(tx, '_value', 'LogDonationReceived'), Number(web3.toWei(15, "ether")))
  });

  it("should log the LogPeriodAverageComputed event when computation is finished", async function() {
    await setupEmergentICO();

    const currentPeriod = Number(await newICO.currentPeriodId());
    await finishPeriod()

    await newICO.donate(accounts[1], 0, {from: accounts[1], value: web3.toWei(15, "ether")})
    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<currentPeriod; cnt++) {
      await newICO.initAverageComputation(cnt, 0, 0);
    }
    // await newICO.initAverageComputation(currentPeriod, 0, 10);
    let tx = await newICO.initAverageComputation(currentPeriod, web3.toWei(15, "ether"), 10);
    assert.equal(getValueFromLogs(tx, '_periodId', 'LogPeriodAverageComputed'), currentPeriod);

  });
  // ******************/
  it("should log the LogCollect event on collection [TODO]", async function() {
    await setupEmergentICO();

    await newICO.donate(accounts[0], 0, {from: accounts[0], value: web3.toWei(15, "ether")});

    const currentPeriod = Number(await newICO.currentPeriodId());
    await finishPeriod();
    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<currentPeriod; cnt++) {
      await newICO.initAverageComputation(cnt, 0, 0);
    }
    // await newICO.initAverageComputation(currentPeriod, 0, 10);
    await newICO.initAverageComputation(currentPeriod, web3.toWei(15, "ether"), 10);
    let tx = await newICO.collectMyTokens(0, { from: accounts[0] });
    assert.equal(Number(getValueFromLogs(tx, '_donation', 'LogCollect')), 0);
    assert.equal(Number(getValueFromLogs(tx, '_tokens', 'LogCollect')), 15 * 100 * 10 ** 18);
    assert.equal(getValueFromLogs(tx, '_ether', 'LogCollect'), 0);
  });

  // /***************************
  it("Check rate function", async function(){
    await setupEmergentICO();

    const frac = rateFractionNumerator/rateFractionDenominator;

    const batch7Rate = Number(web3.toWei(initialRate*frac**7),"ether");
    const batch17Rate =  Number(web3.toWei(initialRate*frac**17),"ether");

    assert.equal(Number(web3.toWei(initialRate)), Number(await newICO.rateInWei(0)));
    // assert(Math.abs(batch7Rate - Number (await newICO.rateInWei(7)))/batch7Rate < 10**(-8));
    assert.equal(batch7Rate, Number(await newICO.rateInWei(7)));

    // we have rounding errors, so testing for strict equality fails
    // assert.equal(batch17Rate, Number(await newICO.rateInWei(17)));
    assert(Math.abs(batch17Rate - Number (await newICO.rateInWei(17)))/batch17Rate < 10**(-8));
  });

  it("Check average rate function", async function(){
    await setupEmergentICO();
    let frac = rateFractionNumerator/rateFractionDenominator;

    let start = 31;
    let end = 85;
    let averageRate = initialRate*(9*frac + 20*frac**2 + 20*frac**3 + 5*frac**4)/(end-start);
    let averageRateInWei = Number(web3.toWei(averageRate, "ether"));
    let averageRateInWeiCalculated = Number(await newICO.averageRateInWei(web3.toWei(start, "ether"), web3.toWei(end, "ether")));
    // Checking rate is the same up to rounding error:
    assert.isOk(Math.abs(averageRateInWei - averageRateInWeiCalculated)/averageRateInWei < 10**(-8));

    start = 10;
    end = 11;
    averageRate = initialRate;
    averageRateInWei = Number(web3.toWei(averageRate, "ether"));
    averageRateInWeiCalculated = Number(await newICO.averageRateInWei(web3.toWei(start, "ether"), web3.toWei(end, "ether")));
    // Checking rate is the same up to rounding error:
    assert.isOk(Math.abs(averageRateInWei - averageRateInWeiCalculated)/averageRateInWei < 10**(-8));

    // Check for limit cases
    start = 0;
    end = 0;
    averageRate = initialRate;
    averageRateInWei = Number(web3.toWei(averageRate, "ether"));
    averageRateInWeiCalculated = Number(await newICO.averageRateInWei(web3.toWei(start, "ether"), web3.toWei(end, "ether")));
    // Checking rate is the same up to rounding error:
    assert.isOk(Math.abs(averageRateInWei - averageRateInWeiCalculated)/averageRateInWei < 10**(-8));

    // Check for limit cases
    start = 20;
    end = 21;
    averageRate = initialRate * (1 * frac);
    averageRateInWei = Number(web3.toWei(averageRate, "ether"));
    averageRateInWeiCalculated = Number(await newICO.averageRateInWei(web3.toWei(start, "ether"), web3.toWei(end, "ether")));
    // Checking rate is the same up to rounding error:
    let msg = `Expected ${Number(averageRateInWeiCalculated)} to be (almost) equal to ${averageRateInWei}`
    assert.isOk(Math.abs(averageRateInWei - averageRateInWeiCalculated)/averageRateInWei < 10**(-8), msg);


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

    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<period; cnt++) {
      await newICO.initAverageComputation(cnt, 0, 0);
    }
    const periodInit = await newICO.getIsPeriodInitialized(period);
    assert.equal(periodInit, true);

    // Try a wrong (too low) average:
    // let avgWrong
    let periodPlus1InitFalse;
    // avgWrong = await newICO.averageRateInWei(0, web3.toWei(37,"ether"));
    await newICO.initAverageComputation(period, web3.toWei(37), 3);
    periodPlus1InitFalse = await newICO.getIsPeriodInitialized(period+1);
    assert.equal(periodPlus1InitFalse, false);

    // Compute average and let contract test it:
    // const avg = await newICO.averageRateInWei(0, web3.toWei(38,"ether"));
    await newICO.initAverageComputation(period,web3.toWei(38,"ether"), 1);
    await newICO.computeAverage(period, 2);
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
  //   assert.equal(await newICO.donationCounter(), 5);
  //
  //   // Compute all previous periods, and initialize current period:
  //   for (let cnt=0; cnt<period; cnt++) {
  //     let avg = await newICO.averageRateInWei(0, web3.toWei(38,"ether"));
  //     await newICO.initAverageComputation(cnt, web3.toWei(avg), 5);
  //   }
  //   const periodInit = await newICO.getIsPeriodInitialized(Number(await newICO.currentPeriodId()));
  //   assert.equal(periodInit, true);
  // });

  it("Donations below minimum throw an exception", async function(){
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

  it("Single regular donation transferring ETH directly to the ICO contract", async function(){
    await setupEmergentICO();

    const donationInWei = web3.toWei(2, "ether");
    const beneficiaryOriginalBalance = await web3.eth.getBalance(beneficiary);

    // Regular small send:
    await web3.eth.sendTransaction({
      from: accounts[1],
      to: newICO.address,
      value: web3.toWei(2, "ether"),
      gas: 600000
    });
    // Checking contract variables:
    assert.equal(Number(await newICO.totalReceived()), donationInWei);
    assert.equal(await newICO.donationCounter(), 1);
    assert.equal(Number(await web3.eth.getBalance(beneficiary)), Number(beneficiaryOriginalBalance) + Number(donationInWei));
  });


  it("Single donation with limit", async function(){
    await run_scenario({
      donations: [
        {
          beneficiary: accounts[1],
          amount: 2,
          minRate: 5
        },
      ],
      expected: {
        totalRaised: 2,
        tokenDistribution: [{
          account: accounts[1],
          tokens: 100 * 2,
          amountSpent: 2,
        }]
      }
    });
  });

  it("Run Scenario (single donation)", async function() {
    await run_scenario({
      icoConfig: {
      },
      donations: [
        {
          beneficiary: accounts[1],
          amount: 42,
          minRate: 0
        },
      ],
      expected: {
        totalRaised: 42,
        tokenDistribution: [{
          account: accounts[1],
          tokens: 100 * 20 + 100 * .99 * 20  + 100 * (.99**2) * 2,
          amountSpent: 42,
        }]
      }
    });
  });

  it("Run Scenario (some donations without limit within a single period)", async function() {
    // in the next scenario, 50ETH is donated without any limit
    // this fills up the 2.5 batches (of 20 ETH each)
    // - each order will be fullfilled
    // - the rate that each person pays is: (1 * 1 + 1 * .99 + .5 * .99**2) * 100/2.5
    let averageRate = (1 + .99 + .5 * .99**2) * 100/2.5;

    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 50, // (can be omitted)
      donations: [
        {
          beneficiary: accounts[1],
          amount: 10,
        },
        {
          beneficiary: accounts[2],
          amount: 20,
        },
        {
          beneficiary: accounts[3],
          amount: 10,
        },
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
        totalRaised: 50,
        tokenDistribution: [
          {
            account: accounts[1],
            tokens: 10 * averageRate,
            etherSpent: 10,
          },
          {
            account: accounts[2],
            tokens: 30 * averageRate,
            etherSpent: 30,
          },
          {
            account: accounts[3],
            tokens: 10 * averageRate,
            etherSpent: 10,
          },
        ]
      }
    });
  });

  it("Run Scenario (one partially filled donation)", async function() {

    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 20,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 10,
        },
        {
          beneficiary: accounts[2],
          amount: 20,
          minRate: 100,
        },
      ],
      expected: {
        totalRaised: 20,
        tokenDistribution: [
          {
            account: accounts[1],
            tokens: 10 * 100,
            etherSpent: 10,
          },
          {
            account: accounts[2],
            tokens: 10 * 100,
            etherSpent: 10,
          },
          {
            account: accounts[3],
            tokens: 0,
            etherSpent: 0,
          },
        ]
      }
    });
  });

  it("Run Scenario (two donations with minRate)", async function() {
    let averageRate = 199/2;
    await run_scenario({
      // hintRate: averageRate,
      // hintDonationsWithMinRateEqualToRateToInclude: 30,
      hintTotalDonatedInThisPeriodInThisPeriod: 40,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 10,
        },
        {
          beneficiary: accounts[2],
          amount: 30,
          minRate: 199/2,
        },
      ],
      expected: {
        totalRaised: 40,
        tokenDistribution: [
          {
            account: accounts[1],
            tokens: 10 * averageRate,
            etherSpent: 10,
          },
          {
            account: accounts[2],
            tokens: 30 * averageRate,
            etherSpent: 30,
          },
          {
            account: accounts[3],
            tokens: 0,
          },
        ]
      }
    });
  });

  it("Run Scenario - try to break the calculations", async function() {
    //
    // if we make two donations
    //    10ETH - no limit
    //    30ETH - limit 199/2 (= rate if 2 batches are included)
    // then we have two "fixed pints":
    //    a: accept only the first donation, sell 10ETH of tokens for rate = 100
    //    b: accept both donations: sell 40 ETH of tokens for rate = 199/2
    // of course, only the second rate should be accepted
    //
    // a computation with an excpected sale of 20 ETH (just the first batch) should fail,
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 20,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 30,
          minRate: 199/2,
        },
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
          computationWillFail: true,
      }
    });

    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 20,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 30,
          minRate: 199/2 - 0.1,
        },
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
          computationWillFail: true,
      }
    });

    // a computation with an excped sale of 30 ETH should fail,
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 30,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 30,
          minRate: 199/2,
        },
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
          computationWillFail: true,
      }
    });
    //
    // a computation with an excped sale of 39.99999999999999999999999999ETH (almost 40, which is the right answer) should fail
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 39.99999999999999999999999,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 30,
          minRate: 199/2,
        },
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
          computationWillFail: false,
      }
    });

    // a computation with an excped sale of 40 ETH (the right answer) should be ok,
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 40,
      donations: [
        {
          beneficiary: accounts[1],
          amount: 10,
          minRate: 199/2,
        },
        {
          beneficiary: accounts[2],
          amount: 30,
        },
      ],
      expected: {
          computationWillFail: false,
      }
    });
  });

  it("A compution with an expected sale of 0 should fail if donations are available", async function() {
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 0,
      donations: [
        {
          beneficiary: accounts[2],
          amount: 10,
        },
      ],
      expected: {
          computationWillFail: true,
      }
    });
  });

  it("A compution with an expected sale of 0 should succeed if no donations were made", async function() {
    await run_scenario({
      hintTotalDonatedInThisPeriodInThisPeriod: 0,
      donations: [],
      expected: {
          computationWillFail: false,
      }
    });
  });

  // *************************/
  async function run_scenario(opts) {

    /*
    run_scenario({
        hintTotalDonatedInThisPeriodInThisPeriod: 1234,
        icoConfig:  {
          periodDuration: 50
        },
        donations: [{
          beneficiary: accounts[1],
          amount: 2,
          minRate: 0,
        }],
        excepted: {
          computationWillFail: false, // if this is true, we expect the calcuation to fail (i.e. because the hintTotalDonatedInThisPeriodInThisPeriod will be wrong)
          tokenDistribution: [ // the excpeted tokend istribution after the period is over
            {
              account: accounts[1],
              tokens: 10, // the amount of tokens this account has received after the scenario finished
              etherSpent: 5.4 // the amout of ether this account has spent for these tokens
            },
            ....
          ]
        }
      }
    })
    */

    await setupEmergentICO(opts.icoConfig);

    const tokenDistribution = opts.expected && opts.expected.tokenDistribution || []
    let beneficiary = opts.icoConfig && opts.icoConfig.beneficiary || accounts[4]
    let beneficiaryBalanceBeforeSale = await web3.eth.getBalance(beneficiary)
    for(let i = 0; i < tokenDistribution.length; i ++ ) {
      tokenDistribution[i].balanceBeforeSale = await web3.eth.getBalance(tokenDistribution[i].account)
    }

    let donation;
    for (let i=0; i<opts.donations.length; i++) {
      donation = opts.donations[i];
      donation.from = donation.from || donation.beneficiary;
      donation.minRate = donation.minRate || 0;
      await newICO.donate(donation.beneficiary, web3.toWei(donation.minRate, "ether"), {from: donation.from, value: web3.toWei(donation.amount, "ether")});
    }

    const currentPeriod = Number(await newICO.currentPeriodId());
    await finishPeriod()

    // Compute all previous periods, and initialize current period:
    for (let cnt=0; cnt<currentPeriod; cnt++) {
      // let avg = await newICO.averageRateInWei(0, web3.toWei(0,"ether"));
      await newICO.initAverageComputation(cnt, 0, 0);
    }
    const periodInit = await newICO.getIsPeriodInitialized(currentPeriod);
    assert.equal(periodInit, true);
    // compute all totals
    let hintTotalDonatedInThisPeriodInThisPeriod;
    if (opts.hintTotalDonatedInThisPeriodInThisPeriod !== undefined) {
      hintTotalDonatedInThisPeriodInThisPeriod = web3.toWei(opts.hintTotalDonatedInThisPeriodInThisPeriod);
    } else {
      hintTotalDonatedInThisPeriodInThisPeriod = await newICO.totalReceived();
    }
    await newICO.initAverageComputation(currentPeriod, hintTotalDonatedInThisPeriodInThisPeriod, 10);

    // check if indeed this rates where computed
    const computationOK = await newICO.getIsPeriodInitialized(currentPeriod+1);
    let computationWillFail = opts.expected && opts.expected.computationWillFail && true || false
    if (!computationWillFail) {
      assert.equal(computationOK, true);
    } else {
      assert.equal(computationOK, false);
      return true;
    }

    // for(let i = 0; i < tokenDistribution.length; i ++ ) {
    //   console.log('actual diff for account right before collection', tokenDistribution[i].account, 'is: ', Number(tokenDistribution[i].balanceBeforeSale.minus(await web3.eth.getBalance(tokenDistribution[i].account))))
    // }
    // collect the tokens
    if (opts.donations) {
      for(let i=0; i < opts.donations.length; i++) {
        await newICO.collectMyTokens(i, { from: opts.donations[i].beneficiary });
      }
    }

    // check the results
    // for(let i = 0; i < tokenDistribution.length; i ++ ) {
    //   console.log('actual diff for account right after collection', tokenDistribution[i].account, 'is: ', Number(tokenDistribution[i].balanceBeforeSale.minus(await web3.eth.getBalance(tokenDistribution[i].account))))
    // }
    const token = org.token;

    if (tokenDistribution) {
      for(let i = 0; i < tokenDistribution.length; i ++ ) {
        if (tokenDistribution[i].tokens) {
          let msg = 'Expected amount of tokens actually received to be equal to the expected amount, for ' + tokenDistribution[i];
          assert.equal((await token.balanceOf(tokenDistribution[i].account)).toNumber(), web3.toWei(tokenDistribution[i].tokens, "ether"), msg);
        }

        if (tokenDistribution[i].etherSpent) {
          let actuallySpent = tokenDistribution[i].balanceBeforeSale.minus(await web3.eth.getBalance(tokenDistribution[i].account))
          let diff = Number(actuallySpent) - (tokenDistribution[i].etherSpent * 10 ** 18)
          let msg = `Expected ${Number(actuallySpent)} to be (almost) equal to ${tokenDistribution[i].etherSpent * 10 ** 18}, but the diff is ${diff}`
          assert.isOk(Math.abs(diff) < 0.1 * 10**18, msg)
        }
      }
    }

    if (opts.expected && opts.expected.totalRaised) {
      let actuallyRaised = (await web3.eth.getBalance(beneficiary)).minus(beneficiaryBalanceBeforeSale)
      let diff = Number(actuallyRaised) - (opts.expected.totalRaised * 10 ** 18)
      let msg = `Expected the amountof ETH actually raised ${Number(actuallyRaised)} to be (almost) equal to ${opts.expected.totalRaised * 10 ** 18}, but the diff is ${diff}`
      assert.isOk(Math.abs(diff) < 0.1 * 10**18, msg)
    }

  }
  async function finishPeriod() {
    // finish the currentPeriod
    const currentPeriod = Number(await newICO.currentPeriodId());
    // Mine blocks to end of the next period:
    while(Number(await newICO.currentPeriodId()) <= currentPeriod + 1) {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: accounts[1],
          value: 1, // 1 wei
        });
    }
  }

});
