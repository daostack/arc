const helpers = require("./helpers");
const constants = require("./constants");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const Reputation = artifacts.require("./Reputation.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Avatar = artifacts.require("./Avatar.sol");
const UController = artifacts.require("./UController.sol");

const opts = {gas: constants.ARC_GAS_LIMIT};

const setup = async function () {
  var testSetup = new helpers.TestSetup();
  testSetup.daoTracker = await DAOTracker.new(opts);
  testSetup.daoToken = await DAOToken.new("test", "test", 0, opts);
  testSetup.reputation = await Reputation.new(opts);
  testSetup.avatar = await Avatar.new(
    "test", testSetup.daoToken.address, testSetup.reputation.address, opts,
  );
  testSetup.controller = await UController.new(opts);
  return testSetup;
};

contract("DAOTracker", accounts => {

  it("track", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const daoToken = testSetup.daoToken.address;
    const reputation = testSetup.reputation.address;
    const controller = testSetup.controller.address;

    const tx = await testSetup.daoTracker.track(
      avatar, controller, opts
    );

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "TrackDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._controller, controller);
    assert.equal(tx.logs[0].args._reputation, reputation);
    assert.equal(tx.logs[0].args._daoToken, daoToken);

    // Verify Storage
    const trackingInfo = await testSetup.daoTracker.tracking(avatar);

    assert.equal(trackingInfo.nativeToken, daoToken);
    assert.equal(trackingInfo.nativeReputation, reputation);
    assert.equal(trackingInfo.controller, controller);
    assert.equal(trackingInfo.blacklist, false);
  });

  it("track onlyAvatarOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const controller = testSetup.controller.address;

    try {
      await testSetup.daoTracker.track(
        avatar, controller, {gas: opts.gas, from: accounts[1]}
      );
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("track null Avatar", async () => {
    const testSetup = await setup();
    const controller = testSetup.controller.address;

    try {
      await testSetup.daoTracker.track(
        "0x0000000000000000000000000000000000000000", controller, opts
      );
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("track null Controller", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    try {
      await testSetup.daoTracker.track(
        avatar, "0x0000000000000000000000000000000000000000", opts
      );
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("blacklist", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    let trackingInfo = await testSetup.daoTracker.tracking(avatar);
    assert.equal(trackingInfo.blacklist, false);

    const tx = await testSetup.daoTracker.blacklist(avatar, "TEST", opts);

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "BlacklistDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._explanationHash, "TEST");

    // Verify Storage
    trackingInfo = await testSetup.daoTracker.tracking(avatar);
    assert.equal(trackingInfo.blacklist, true);
  });

  it("blacklist onlyOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    try {
      await testSetup.daoTracker.blacklist(avatar, "TEST", {gas: opts.gas, from: accounts[1]});
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("blacklist null Avatar", async () => {
    const testSetup = await setup();

    try {
      await testSetup.daoTracker.blacklist("0x0000000000000000000000000000000000000000", "TEST", opts);
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("reset", async () => { 
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const daoToken = testSetup.daoToken.address;
    const reputation = testSetup.reputation.address;
    const controller = testSetup.controller.address;

    await testSetup.daoTracker.track(
      avatar, controller, opts
    );

    let trackingInfo = await testSetup.daoTracker.tracking(avatar);
    assert.equal(trackingInfo.nativeToken, daoToken);
    assert.equal(trackingInfo.nativeReputation, reputation);
    assert.equal(trackingInfo.controller, controller);
    assert.equal(trackingInfo.blacklist, false);

    await testSetup.daoTracker.blacklist(avatar, "TEST", opts);

    trackingInfo = await testSetup.daoTracker.tracking(avatar);
    assert.equal(trackingInfo.blacklist, true);

    const tx = await testSetup.daoTracker.reset(avatar, "TEST", opts);

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ResetDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._explanationHash, "TEST");

    // Verify Storage
    trackingInfo = await testSetup.daoTracker.tracking(avatar);
    assert.equal(trackingInfo.nativeToken, "0x0000000000000000000000000000000000000000");
    assert.equal(trackingInfo.nativeReputation, "0x0000000000000000000000000000000000000000");
    assert.equal(trackingInfo.controller, "0x0000000000000000000000000000000000000000");
    assert.equal(trackingInfo.blacklist, false);
  });

  it("reset onlyOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    try {
      await testSetup.daoTracker.reset(avatar, "TEST", {gas: opts.gas, from: accounts[1]});
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });
});
