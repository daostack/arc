const helpers = require('./helpers')
const Controller = artifacts.require("./Controller.sol");

const EmergentICO = artifacts.require("./EmergentICO.sol");

// Vars
let accounts, newController, newICO;
let admin, target, startBlock,clearancePeriodDuration, minDonation, initialRate, rateFractionNumerator, rateFractionDenominator, batchSize;

const setupEmergantICO = async function(){

  accounts = web3.eth.accounts;

  admin = accounts[0];
  target = admin;
  startBlock = 1;
  clearancePeriodDuration = 12;
  minDonation = 0;
  initialRate = 100;
  rateFractionNumerator = 99;
  rateFractionDenominator = 100;
  batchSize = web3.toWei(10000, "ether");
  newController = await Controller.new(null, null, null, [], [], []);
  newICO = await EmergentICO.new(newController.address, admin, target, startBlock, clearancePeriodDuration, minDonation, initialRate, rateFractionNumerator, rateFractionDenominator, batchSize);
}

contract("EmergantICO", function(accounts){
  before(function() {
    helpers.etherForEveryone();
  });

  it("Only admin can halt and resume the ICO", async function(){

    await setupEmergantICO();

    newICO.haltICO();
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

    newICO.haltICO();
    // only the admin can resume the ICO
    try {
        await newICO.resumeICO({from: accounts[1]});
        throw 'an error'; // make sure that an error is thrown
    } catch(error) {
        helpers.assertVMException(error);
    }
    // ICO should be still active - The halt request sent from non admin account
    assert.equal(await newICO.isActive(), false);
  });

  // it("Check if partLeftOfCurrentBatch is decreasing over time", async function(){
  //
  //   await setupEmergantICO();
  //
  //   // Send 2 naked donation to the ICO address
  //   let ICOAddress = newICO.address;
  //   await web3.eth.sendTransaction({to: ICOAddress, from: accounts[0], value: web3.toWei(2, "ether")});
  //   await web3.eth.sendTransaction({to: ICOAddress, from: accounts[3], value: web3.toWei(0.05, "ether")});
  //   console.log(newICO.partLeftOfCurrentBatch);
  //
  //
  // });

});
