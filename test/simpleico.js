const helpers = require("./helpers");
const constants = require("./constants");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const SchemesFactory = artifacts.require("./SchemesFactory.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const Controller = artifacts.require("./Controller.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");

var daoFactory, actorsFactory, schemesFactory;

const setupFactories = async function() {
  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  daoFactory = await DAOFactory.new(
    controllerFactory.address,
    actorsFactory.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );

  var simpleICOLibrary = await SimpleICO.new({ gas: constants.ARC_GAS_LIMIT });

  schemesFactory = await SchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await schemesFactory.setSimpleICOLibraryAddress(simpleICOLibrary.address, {
    gas: constants.ARC_GAS_LIMIT
  });
};

const setupOrganization = async function(
  daoFactoryOwner,
  founderToken,
  founderReputation
) {
  var org = await helpers.setupOrganization(
    daoFactory,
    daoFactoryOwner,
    founderToken,
    founderReputation
  );
  return org;
};

const setup = async function(
  accounts,
  cap = 10000,
  price = 1,
  startBlock = 0,
  endBlock = 0
) {
  var testSetup = new helpers.TestSetup();

  testSetup.beneficiary = accounts[0];
  testSetup.fee = 10;
  testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1], 100);

  testSetup.org = await setupOrganization(accounts[0], 1000, 1000);

  if (startBlock === 0) {
    startBlock = await web3.eth.getBlockNumber();
  }

  if (endBlock === 0) {
    endBlock = (await web3.eth.getBlockNumber()) + 500;
  }

  testSetup.simpleICO = await SimpleICO.at(
    (await schemesFactory.createSimpleICO(
      testSetup.org.avatar.address,
      cap,
      price,
      startBlock,
      endBlock,
      testSetup.org.avatar.address
    )).logs[0].args._newSchemeAddress
  );

  await daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.simpleICO.address],
    ["0x8000000F"]
  );
  return testSetup;
};

contract("SimpleICO", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("simpleICO init", async function() {
    var testSetup = await setup(accounts, 1000);

    var cap = await testSetup.simpleICO.cap.call();
    assert.equal(cap.toNumber(), 1000);
  });

  it("simpleICO with cap zero should revert", async function() {
    try {
      await setup(accounts, 0);
      assert(false, "simpleICO with cap zero should revert");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("simpleICO isActive", async function() {
    var testSetup = await setup(accounts);

    assert.equal(await testSetup.simpleICO.isActive(), true);
  });

  it("simpleICO isActive test start block", async function() {
    var testSetup = await setup(
      accounts,
      1000,
      1,
      (await web3.eth.getBlockNumber()) + 100,
      (await web3.eth.getBlockNumber()) + 100 + 500
    );

    assert.equal(await testSetup.simpleICO.isActive(), false);
  });

  it("simpleICO isActive test end block", async function() {
    var testSetup = await setup(
      accounts,
      1000,
      1,
      await web3.eth.getBlockNumber(),
      await web3.eth.getBlockNumber()
    );

    assert.equal(await testSetup.simpleICO.isActive(), false);
  });

  it("simpleICO isActive test cap", async function() {
    var cap = 2;
    var price = 1;

    var testSetup = await setup(accounts, cap, price);

    var donationEther = cap;
    await testSetup.simpleICO.donate(accounts[3], {
      value: donationEther
    });

    var isActive = await testSetup.simpleICO.isActive();

    assert.equal(isActive, false);
  });

  it("simpleICO pause/ unpause ICO", async function() {
    var testSetup = await setup(accounts);

    assert.equal(await testSetup.simpleICO.paused.call(), false);

    await testSetup.simpleICO.pause();

    assert.equal(await testSetup.simpleICO.paused.call(), true);

    await testSetup.simpleICO.unpause();

    assert.equal(await testSetup.simpleICO.paused.call(), false);

    try {
      await testSetup.simpleICO.pause({
        from: accounts[1]
      });
      assert(false, "pause ICO should fail - accounts[1] is not owner");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("simpleICO donate log", async function() {
    var price = 2;

    var testSetup = await setup(accounts, 1000, price);

    var donationEther = 3;

    var tx = await testSetup.simpleICO.donate(accounts[3], {
      value: donationEther
    });

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "DonationReceived");

    var _beneficiary = await helpers.getValueFromLogs(tx, "_beneficiary", 1);
    assert.equal(_beneficiary, accounts[3]);

    var _incomingEther = await helpers.getValueFromLogs(tx, "_incomingEther");
    assert.equal(_incomingEther, donationEther);

    var _tokensAmount = await helpers.getValueFromLogs(tx, "_tokensAmount", 1);
    assert.equal(_tokensAmount.toNumber(), price * donationEther);
  });

  it("simpleICO donate zero eth should fail", async function() {
    var testSetup = await setup(accounts, 1000);

    try {
      //do not send ether ..just call donate.
      await testSetup.simpleICO.donate(accounts[3]);
      assert(false, "donating zero eth should fail");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("simpleICO donate check transfer", async function() {
    var price = 2;
    var testSetup = await setup(accounts, 1000, price);

    var donationEther = 3;

    await testSetup.simpleICO.donate(accounts[3], { value: donationEther });

    var balance = await testSetup.org.token.balanceOf(accounts[3]);
    assert.equal(balance.toNumber(), price * donationEther);
  });

  it("simpleICO donate check update totalEthRaised", async function() {
    var price = 2;
    var testSetup = await setup(accounts, 1000, price);

    var donationEther = 3;
    await testSetup.simpleICO.donate(accounts[3], { value: donationEther });

    var totalEthRaised = await testSetup.simpleICO.totalEthRaised.call();

    assert.equal(totalEthRaised.toNumber(), donationEther);
  });

  it("simpleICO donate check isActive", async function() {
    var price = 2;
    var testSetup = await setup(
      accounts,
      1000,
      price,
      (await web3.eth.getBlockNumber()) + 100,
      (await web3.eth.getBlockNumber()) + 100 + 500
    );

    var donationEther = 3;

    try {
      await testSetup.simpleICO.donate(accounts[3], { value: donationEther });

      assert(false, "donate should  fail - ico is not active");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("simpleICO donate check if paused", async function() {
    var price = 2;
    var testSetup = await setup(accounts, 1000, price);

    await testSetup.simpleICO.pause();

    var donationEther = 3;

    try {
      await testSetup.simpleICO.donate(accounts[3], { value: donationEther });
      assert(false, "donate should fail when ICO is paused");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("simpleICO donate check change back", async function() {
    var price = 2;
    var cap = 3;
    var testSetup = await setup(accounts, cap, price);

    var donationEther = cap + 10;

    let otherAvatar = await Avatar.at(
      (await actorsFactory.createAvatar(
        "otheravatar",
        helpers.NULL_ADDRESS,
        helpers.NULL_ADDRESS
      )).logs[0].args.newAvatarAddress
    );

    var beneficiaryBalance = await web3.eth.getBalance(otherAvatar.address);

    assert.equal(beneficiaryBalance, 0);

    await testSetup.simpleICO.donate(otherAvatar.address, {
      value: donationEther
    });

    var balance = await testSetup.org.token.balanceOf(otherAvatar.address);
    assert.equal(balance.toNumber(), price * cap);

    beneficiaryBalance = await web3.eth.getBalance(otherAvatar.address);
    assert.equal(beneficiaryBalance, 10);
  });

  it("simpleICO donate from fallback function", async function() {
    var price = 2;
    var cap = 3;

    var testSetup = await setup(accounts, cap, price);

    let otherAvatar = await Avatar.at(
      (await actorsFactory.createAvatar(
        "otheravatar",
        helpers.NULL_ADDRESS,
        helpers.NULL_ADDRESS
      )).logs[0].args.newAvatarAddress
    );

    var beneficiaryBalance = await web3.eth.getBalance(otherAvatar.address);
    assert.equal(beneficiaryBalance, 0);

    await web3.eth.sendTransaction({
      from: accounts[3],
      to: testSetup.simpleICO.address,
      value: 2,
      gas: 900000
    });

    var balance = await testSetup.org.token.balanceOf(accounts[3]);
    assert.equal(balance.toNumber(), price * 2);
  });

  it("simpleICO should not accept donation from fallback when paused", async function() {
    var price = 2;
    var cap = 3;

    var testSetup = await setup(accounts, cap, price);

    await testSetup.simpleICO.pause();

    try {
      await web3.eth.sendTransaction({
        from: accounts[3],
        to: testSetup.simpleICO.address,
        value: 2,
        gas: 900000
      });

      assert(
        false,
        "simpleICO failed - should not accept donation from fallback when paused"
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });
});
