const helpers = require("./helpers");
const constants = require("./constants");
const Reputation = artifacts.require("./Reputation.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
const SchemeMock = artifacts.require("./test/SchemeMock.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");

var avatar,
  token,
  reputation,
  daoFactory,
  controllerFactory,
  avatarLibrary,
  daoTokenLibrary,
  actorsFactory;

const setup = async function(
  accounts,
  founderToken,
  founderReputation,
  cap = 0
) {
  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });
  avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

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

  var tx = await daoFactory.forgeOrg(
    "testOrg",
    "TEST",
    "TST",
    [accounts[0]],
    [founderToken],
    [founderReputation],
    cap,
    { gas: constants.ARC_GAS_LIMIT }
  );
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await avatar.nativeToken();
  token = await DAOToken.at(tokenAddress);
  var reputationAddress = await avatar.nativeReputation();
  reputation = await Reputation.at(reputationAddress);
};

contract("DAOFactory", function(accounts) {
  it("forgeOrg check avatar", async function() {
    await setup(accounts, 10, 10);
    assert.equal(await avatar.orgName(), "testOrg");
  });

  it("forgeOrg check reputations and tokens to founders", async function() {
    await setup(accounts, 10, 10);
    var founderBalance = await token.balanceOf(accounts[0]);
    assert.equal(founderBalance, 10);
    var founderReputation = await reputation.balanceOf(accounts[0]);
    assert.equal(founderReputation, 10);
  });

  it("forgeOrg check transfer ownership", async function() {
    //check the forgeOrg transfer ownership to avatar ,reputation and token
    //to the controller contract
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var controllerAddress, controller;
    controllerAddress = await avatar.owner();
    controller = await Controller.at(controllerAddress);

    var controllerAvatarAddress = await controller.avatar();
    assert.equal(controllerAvatarAddress, avatar.address);
    var tokenAddress = await avatar.nativeToken();
    var token = await DAOToken.at(tokenAddress);
    controllerAddress = await token.owner();
    controller = await Controller.at(controllerAddress);
    var controllerTokenAddress = await controller.nativeToken();
    assert.equal(controllerTokenAddress, tokenAddress);

    var reputationAddress = await avatar.nativeReputation();
    var reputation = await Reputation.at(reputationAddress);
    controllerAddress = await reputation.owner();
    controller = await Controller.at(controllerAddress);
    var controllerReputationAddress = await controller.nativeReputation();
    assert.equal(controllerReputationAddress, reputationAddress);
  });

  it("setSchemes to none Scheme", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var tx = await daoFactory.setSchemes(
      avatar.address,
      [accounts[1]],
      ["0x0000000F"]
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "InitialSchemesSet");
    assert.equal(tx.logs[0].args._avatar, avatar.address);
  });

  it("setSchemes to Scheme", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var schemeMock = await SchemeMock.new();
    var tx = await daoFactory.setSchemes(
      avatar.address,
      [schemeMock.address],
      ["0x8000000F"]
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "InitialSchemesSet");
    assert.equal(tx.logs[0].args._avatar, avatar.address);
  });

  it("setSchemes from account that does not hold the lock", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    try {
      await daoFactory.setSchemes(
        avatar.address,
        [accounts[1]],
        ["0x0000000F"],
        { from: accounts[1] }
      );
      assert(false, "should fail because accounts[1] does not hold the lock");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("setSchemes increase approval for scheme and register org in scheme", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var standardTokenMock = await StandardTokenMock.new(avatar.address, 100);
    var schemeMock = await SchemeMock.new();
    var allowance = await standardTokenMock.allowance(
      avatar.address,
      schemeMock.address
    );
    assert.equal(allowance, 0);
    await daoFactory.setSchemes(
      avatar.address,
      [schemeMock.address],
      ["0x8000000F"]
    );
    allowance = await standardTokenMock.allowance(
      avatar.address,
      schemeMock.address
    );
    assert.equal(allowance, 0);
  });

  it("setSchemes increase approval for scheme without fee", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var standardTokenMock = await StandardTokenMock.new(accounts[0], 100);
    var allowance = await standardTokenMock.allowance(
      avatar.address,
      accounts[1]
    );
    assert.equal(allowance, 0);

    await daoFactory.setSchemes(avatar.address, [accounts[1]], ["0x0000000F"]);
    allowance = await standardTokenMock.allowance(avatar.address, accounts[1]);
    assert.equal(allowance, 0);
  });

  it("setSchemes check register", async function() {
    var amountToMint = 10;
    var controllerAddress, controller;
    await setup(accounts, amountToMint, amountToMint);
    await daoFactory.setSchemes(avatar.address, [accounts[1]], ["0x0000000F"]);
    controllerAddress = await avatar.owner();
    controller = await Controller.at(controllerAddress);
    var isSchemeRegistered = await controller.isSchemeRegistered(accounts[1]);
    assert.equal(isSchemeRegistered, true);
  });

  it("setSchemes check unregisterSelf", async function() {
    var amountToMint = 10;
    var controllerAddress, controller;
    await setup(accounts, amountToMint, amountToMint);
    controllerAddress = await avatar.owner();
    controller = await Controller.at(controllerAddress);
    var isSchemeRegistered = await controller.isSchemeRegistered(
      daoFactory.address
    );
    assert.equal(isSchemeRegistered, true);
    await daoFactory.setSchemes(avatar.address, [accounts[1]], ["0x0000000F"]);
    controllerAddress = await avatar.owner();
    controller = await Controller.at(controllerAddress);
    isSchemeRegistered = await controller.isSchemeRegistered(
      daoFactory.address
    );
    assert.equal(isSchemeRegistered, false);
  });

  it("setSchemes delete lock", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    await daoFactory.setSchemes(avatar.address, [accounts[1]], ["0x0000000F"]);
    try {
      await daoFactory.setSchemes(
        avatar.address,
        [accounts[1]],
        ["0x0000000F"],
        { from: accounts[1] }
      );
      assert(
        false,
        "should fail because lock for account[0] suppose to be deleted by the first call"
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("forgeOrg with different params length should revert", async function() {
    var amountToMint = 10;

    avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
    daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

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

    try {
      await daoFactory.forgeOrg(
        "testOrg",
        "TEST",
        "TST",
        [accounts[0]],
        [amountToMint],
        [],
        0,
        { gas: constants.ARC_GAS_LIMIT }
      );
      assert(false, "should revert  because reputation array size is 0");
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    try {
      await daoFactory.forgeOrg(
        "testOrg",
        "TEST",
        "TST",
        [accounts[0], 0],
        [amountToMint, amountToMint],
        [amountToMint, amountToMint],
        0,
        { gas: constants.ARC_GAS_LIMIT }
      );
      assert(false, "should revert  because account is 0");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });
  it("setSchemes to none Scheme and addFounders", async function() {
    var amountToMint = 10;
    await setup(accounts, amountToMint, amountToMint);
    var foundersArray = [];
    var founderReputation = [];
    var founderToken = [];
    var i;
    var numberOfFounders = 60;
    for (i = 0; i < numberOfFounders; i++) {
      foundersArray[i] = accounts[1];
      founderReputation[i] = 1;
      founderToken[i] = 1;
    }
    try {
      await daoFactory.addFounders(
        avatar.address,
        foundersArray,
        founderReputation,
        founderToken,
        { from: accounts[1], gas: constants.ARC_GAS_LIMIT }
      );
      assert(false, "should revert  because account is lock for account 0");
    } catch (ex) {
      helpers.assertVMException(ex);
    }

    await daoFactory.addFounders(
      avatar.address,
      foundersArray,
      founderReputation,
      founderToken,
      { gas: constants.ARC_GAS_LIMIT }
    );
    var rep = await reputation.balanceOf(accounts[1]);
    assert.equal(rep.toNumber(), numberOfFounders);
    var founderBalance = await token.balanceOf(accounts[1]);
    assert.equal(founderBalance.toNumber(), numberOfFounders);
    var tx = await daoFactory.setSchemes(
      avatar.address,
      [accounts[1]],
      ["0x0000000F"]
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "InitialSchemesSet");
    assert.equal(tx.logs[0].args._avatar, avatar.address);
  });
});
