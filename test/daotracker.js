const helpers = require("./helpers");

const DAOTracker = artifacts.require("./DAOTracker.sol");
const Reputation = artifacts.require("./Reputation.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");



const setup = async function () {
  var testSetup = new helpers.TestSetup();
  testSetup.daoTracker = await DAOTracker.new();
  testSetup.daoToken = await DAOToken.new("test", "test", 0);
  testSetup.reputation = await Reputation.new();
  testSetup.avatar = await Avatar.new(
    "test", testSetup.daoToken.address, testSetup.reputation.address
  );
  testSetup.controller = await Controller.new(testSetup.avatar.address);
  return testSetup;
};

contract("DAOTracker", accounts => {

  const arcVersionStub = "v0.0";

  it("track", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const daoToken = testSetup.daoToken.address;
    const reputation = testSetup.reputation.address;
    const controller = testSetup.controller.address;

    const tx = await testSetup.daoTracker.track(
      avatar, controller, arcVersionStub
    );

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "TrackDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._controller, controller);
    assert.equal(tx.logs[0].args._reputation, reputation);
    assert.equal(tx.logs[0].args._daoToken, daoToken);
    assert.equal(tx.logs[0].args._sender, accounts[0]);
    assert.equal(tx.logs[0].args._arcVersion, arcVersionStub);

    // Verify Storage
    const blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, false);
  });

  it("track onlyAvatarOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const controller = testSetup.controller.address;

    try {
      await testSetup.daoTracker.track(
        avatar, controller, arcVersionStub, { from: accounts[1]}
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
        "0x0000000000000000000000000000000000000000", controller, arcVersionStub
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
        avatar, "0x0000000000000000000000000000000000000000", arcVersionStub
      );
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("blacklist", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    let blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, false);

    const tx = await testSetup.daoTracker.blacklist(avatar, "TEST");

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "BlacklistDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._explanationHash, "TEST");

    // Verify Storage
    blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, true);
  });

  it("blacklist onlyOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    try {
      await testSetup.daoTracker.blacklist(avatar, "TEST", { from: accounts[1]});
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("blacklist null Avatar", async () => {
    const testSetup = await setup();

    try {
      await testSetup.daoTracker.blacklist("0x0000000000000000000000000000000000000000", "TEST");
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });

  it("reset", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;
    const controller = testSetup.controller.address;

    await testSetup.daoTracker.track(
      avatar, controller, arcVersionStub
    );

    let blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, false);

    await testSetup.daoTracker.blacklist(avatar, "TEST");

    blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, true);

    const tx = await testSetup.daoTracker.reset(avatar, "TEST");

    // Verify Event
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ResetDAO");
    assert.equal(tx.logs[0].args._avatar, avatar);
    assert.equal(tx.logs[0].args._explanationHash, "TEST");

    // Verify Storage
    blacklisted = await testSetup.daoTracker.blacklisted(avatar);
    assert.equal(blacklisted, false);
  });

  it("reset onlyOwner", async () => {
    const testSetup = await setup();
    const avatar = testSetup.avatar.address;

    try {
      await testSetup.daoTracker.reset(avatar, "TEST", {from: accounts[1]});
      assert.fail("This should never happen.");
    } catch (e) {
      return;
    }
  });
});
