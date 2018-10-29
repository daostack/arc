const helpers = require("./helpers");
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const ConstraintMock = artifacts.require("./test/ConstraintMock.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const ActionMock = artifacts.require("./test/ActionMock.sol");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
var constants = require("../test/constants");

var uint32 = require("uint32");
let reputation, avatar, token, controller;
var amountToMint = 10;

var actorsFactory;
var controllerFactory;

const setupFactories = async function() {
  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });
};

const setup = async function(
  accounts,
  permission = "0",
  registerScheme = accounts[0]
) {
  var _controller;

  // set up a reputation system
  reputation = await Reputation.new();

  token = await DAOToken.at(
    (await actorsFactory.createDAOToken("TEST", "TST", 0)).logs[0].args
      .newTokenAddress
  );

  avatar = await Avatar.at(
    (await actorsFactory.createAvatar(
      "name",
      token.address,
      reputation.address
    )).logs[0].args.newAvatarAddress
  );

  if (permission !== "0") {
    _controller = await Controller.at(
      (await controllerFactory.createController(avatar.address, {
        from: accounts[1],
        gas: constants.ARC_GAS_LIMIT
      })).logs[0].args.newControllerAddress
    );
    await _controller.registerScheme(registerScheme, permission, {
      from: accounts[1]
    });
    await _controller.unregisterSelf({ from: accounts[1] });
  } else {
    _controller = await Controller.at(
      (await controllerFactory.createController(avatar.address, {
        gas: constants.ARC_GAS_LIMIT
      })).logs[0].args.newControllerAddress
    );
  }
  controller = _controller;
  return _controller;
};

const constraint = async function(pre = false, post = false) {
  var constraints = await ConstraintMock.new();
  let constraintsCountOrig = await controller.constraintsCount();
  await constraints.setConstraint(pre, post);
  await controller.addConstraint(constraints.address);
  let constraintsCount = await controller.constraintsCount();
  assert.equal(
    constraintsCount.toNumber(),
    constraintsCountOrig.toNumber() + (pre ? 0 : 1)
  );
  assert.equal(
    constraintsCount.toNumber(),
    constraintsCountOrig.toNumber() + (post ? 0 : 1)
  );
  return constraints;
};

contract("Controller", accounts => {
  before(async function() {
    helpers.etherForEveryone(accounts);
    await setupFactories();
  });

  it("mint reputation via controller", async () => {
    controller = await setup(accounts);
    await reputation.transferOwnership(controller.address);
    let tx = await controller.mintReputation(amountToMint, accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "MintReputation");
    assert.equal(tx.logs[0].args._amount, amountToMint);
    assert.equal(tx.logs[0].args._to, accounts[0]);
    let rep = await reputation.balanceOf(accounts[0]);
    assert.equal(rep, amountToMint);
  });

  it("burn reputation via controller", async () => {
    controller = await setup(accounts);
    await reputation.transferOwnership(controller.address);
    await controller.mintReputation(amountToMint, accounts[0]);
    let tx = await controller.burnReputation(amountToMint - 1, accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "BurnReputation");
    assert.equal(tx.logs[0].args._amount, amountToMint - 1);
    assert.equal(tx.logs[0].args._from, accounts[0]);
    let rep = await reputation.balanceOf(accounts[0]);
    assert.equal(rep, 1);
  });

  it("mint tokens via controller", async () => {
    controller = await setup(accounts);
    await token.transferOwnership(controller.address);
    let tx = await controller.mintTokens(amountToMint, accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "MintTokens");
    assert.equal(tx.logs[0].args._amount, amountToMint);
    let balance = await token.balanceOf(accounts[0]);
    assert.equal(balance, amountToMint);
  });

  it("register schemes", async () => {
    controller = await setup(accounts);
    let tx = await controller.registerScheme(accounts[1], "0x00000000");
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");
  });

  it("register schemes - check permissions for register new scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    var i, j;
    //  controller;
    for (j = 0; j <= 15; j++) {
      //registered scheme has already permission to register(2)
      controller = await setup("0x" + uint32.toHex(j | 2));
      var register;
      for (i = 0; i <= 15; i++) {
        register = true;
        try {
          await controller.registerScheme(accounts[1], "0x" + uint32.toHex(i));
        } catch (ex) {
          //registered scheme has already permission to register(2) and is register(1).
          assert.notEqual(i & (~(j | 3), 0));
          register = false;
        }
        if (register) {
          await controller.unregisterScheme(accounts[1]);
          register = false;
        }
      }
    }
  });

  it("register schemes - check permissions for updating existing scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    controller = await setup(accounts, "0x0000000F");
    // scheme with permission 0x0000000F should be able to register scheme with permission 0x00000001
    let tx = await controller.registerScheme(accounts[0], "0x00000001");
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");

    controller = await setup(accounts, "0x00000001");
    try {
      await controller.registerScheme(accounts[0], "0x00000002");
      assert(
        false,
        "scheme with permission 0x00000001 should not be able to register scheme with permission 0x00000002"
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("unregister schemes", async () => {
    controller = await setup(accounts);
    let tx = await controller.unregisterScheme(accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UnregisterScheme");
  });
  it("unregister none registered scheme", async () => {
    controller = await setup(accounts);
    let tx = await controller.unregisterScheme(accounts[1]);
    assert.equal(tx.logs.length, 0);
  });

  it("unregister schemes - check permissions unregister scheme", async () => {
    // Check scheme has at least the permissions it is changing, and at least the current permissions.
    //1. setup
    controller = await setup(accounts);
    //2. account[0] register schemes ,on account[1] with variables permissions which could unregister other schemes.
    var i, j;
    var tx;
    var registeredScheme = accounts[1];
    var unregisteredScheme = accounts[2];
    for (i = 0; i <= 15; i++) {
      //registered scheme has already permission to register(2)
      tx = await controller.registerScheme(
        registeredScheme,
        "0x" + uint32.toHex(i | 3)
      );
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RegisterScheme");
      for (j = 0; j <= 15; j++) {
        tx = await controller.registerScheme(
          unregisteredScheme,
          "0x" + uint32.toHex(j)
        );
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
        //try to unregisterScheme
        if (j & ~(i | 3)) {
          //unregister should fail
          try {
            await controller.unregisterScheme(unregisteredScheme, {
              from: registeredScheme
            });
            assert(
              false,
              "scheme with permission " +
                uint32.toHex(i | 3) +
                " should not be able to unregister scheme with permission" +
                uint32.toHex(j)
            );
          } catch (ex) {
            helpers.assertVMException(ex);
          }
        } else {
          //unregister should success
          tx = await controller.unregisterScheme(unregisteredScheme, {
            from: registeredScheme
          });
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "UnregisterScheme");
        }
      }
    }
  });

  it("unregister self", async () => {
    var tx;
    controller = await setup(accounts, "0x00000000");
    tx = await controller.unregisterSelf({ from: accounts[1] });
    assert.equal(tx.logs.length, 0); // scheme was not registered

    tx = await controller.unregisterSelf();
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UnregisterScheme");
  });

  it("isSchemeRegistered ", async () => {
    var isSchemeRegistered;
    controller = await setup(accounts, "0x00000000");
    isSchemeRegistered = await controller.isSchemeRegistered(accounts[1]);
    assert.equal(isSchemeRegistered, false);
    isSchemeRegistered = await controller.isSchemeRegistered(accounts[0]);
    assert.equal(isSchemeRegistered, true);
  });

  it("addConstraint ", async () => {
    controller = await setup(accounts);
    var constraints = await constraint();
    assert.equal(
      await controller.isConstraintRegistered(constraints.address),
      true
    );
    var count = await controller.constraintsCount();
    assert.equal(count.toNumber(), 1);
  });

  it("removeConstraint ", async () => {
    controller = await setup(accounts);
    var constraints = await ConstraintMock.new();
    await constraints.setConstraint(false, false);
    var constraints1 = await ConstraintMock.new();
    await constraints1.setConstraint(false, false);
    var constraints2 = await ConstraintMock.new();
    await constraints2.setConstraint(false, false);
    var constraints3 = await ConstraintMock.new();
    await constraints3.setConstraint(false, false);
    var constraints4 = await ConstraintMock.new();
    await constraints4.setConstraint(false, false);

    assert.equal(
      await controller.isConstraintRegistered(constraints.address),
      false
    );
    await controller.addConstraint(constraints.address);
    await controller.addConstraint(constraints1.address);
    await controller.addConstraint(constraints2.address);
    await controller.addConstraint(constraints3.address);
    await controller.addConstraint(constraints4.address);
    var tx = await controller.removeConstraint(constraints2.address);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RemoveConstraint");
    assert.equal(
      await controller.isConstraintRegistered(constraints.address),
      true
    );
    assert.equal(
      await controller.isConstraintRegistered(constraints1.address),
      true
    );
    assert.equal(
      await controller.isConstraintRegistered(constraints2.address),
      false
    );
    assert.equal(
      await controller.isConstraintRegistered(constraints3.address),
      true
    );
    assert.equal(
      await controller.isConstraintRegistered(constraints4.address),
      true
    );

    let constraintCount = await controller.constraintsCount();

    assert.equal(constraintCount, 4);

    await controller.removeConstraint(constraints4.address);
    assert.equal(
      await controller.isConstraintRegistered(constraints4.address),
      false
    );
    constraintCount = await controller.constraintsCount();
    assert.equal(constraintCount, 3);
  });

  it("upgrade controller ", async () => {
    controller = await setup(accounts);
    await reputation.transferOwnership(controller.address);
    await token.transferOwnership(controller.address);
    await avatar.transferOwnership(controller.address);
    var tx = await controller.upgradeController(accounts[1]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UpgradeController");
  });

  it("upgrade controller check permission", async () => {
    controller = await setup(accounts, "0x00000007");
    await reputation.transferOwnership(controller.address);
    await token.transferOwnership(controller.address);
    await avatar.transferOwnership(controller.address);
    try {
      await controller.upgradeController(accounts[1]);
      assert(
        false,
        "scheme with permission 0x00000007 is not allowed to upgrade "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });

  it("generic call log", async () => {
    controller = await setup(accounts, "0x00000010");
    await avatar.transferOwnership(controller.address);
    let actionMock = await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods
      .test(a, b, c)
      .encodeABI();
    var tx = await controller.genericCall(actionMock.address, encodeABI);
    await avatar
      .getPastEvents("GenericCall", {
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "GenericCall");
        assert.equal(events[0].args._contract, actionMock.address);
      });
  });

  it("generic call", async () => {
    controller = await setup(accounts, "0x00000010");
    await avatar.transferOwnership(controller.address);
    let actionMock = await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods
      .test(a, b, c)
      .encodeABI();
    var result = await controller.genericCall.call(
      actionMock.address,
      encodeABI
    );
    assert.equal(result, 14);
  });

  it("generic call withoutReturnValue", async () => {
    controller = await setup(accounts, "0x00000010");
    await avatar.transferOwnership(controller.address);
    let actionMock = await ActionMock.new();

    const actionMockContract = await new web3.eth.Contract(actionMock.abi);
    const encodeABI = actionMockContract.methods
      .withoutReturnValue(avatar.address)
      .encodeABI();
    var tx = await controller.genericCall(actionMock.address, encodeABI);
    await actionMock
      .getPastEvents("WithoutReturnValue", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "WithoutReturnValue");
      });
  });
  it("sendEther", async () => {
    controller = await setup(accounts);
    let otherAvatar = await Avatar.at(
      (await actorsFactory.createAvatar(
        "otheravatar",
        helpers.NULL_ADDRESS,
        avatar.address
      )).logs[0].args.newAvatarAddress
    );
    await avatar.transferOwnership(controller.address);
    //send some ether to the avatar
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: avatar.address,
      value: web3.utils.toWei("1", "ether")
    });
    //send some ether from an organization's avatar to the otherAvatar
    var tx = await controller.sendEther(
      web3.utils.toWei("1", "ether"),
      otherAvatar.address
    );
    await avatar
      .getPastEvents("SendEther", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "SendEther");
      });
    var avatarBalance =
      (await web3.eth.getBalance(avatar.address)) /
      web3.utils.toWei("1", "ether");
    assert.equal(avatarBalance, 0);
    var otherAvatarBalance =
      (await web3.eth.getBalance(otherAvatar.address)) /
      web3.utils.toWei("1", "ether");
    assert.equal(otherAvatarBalance, 1);
  });

  it("externalTokenTransfer", async () => {
    //External transfer token from avatar contract to other address
    controller = await setup(accounts);
    var standardToken = await StandardTokenMock.new(avatar.address, 100);
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 100);
    await avatar.transferOwnership(controller.address);
    var tx = await controller.externalTokenTransfer(
      standardToken.address,
      accounts[1],
      50
    );
    await avatar
      .getPastEvents("ExternalTokenTransfer", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "ExternalTokenTransfer");
      });
    balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 50);
    let balance1 = await standardToken.balanceOf(accounts[1]);
    assert.equal(balance1, 50);
  });

  it("externalTokenTransferFrom & ExternalTokenIncreaseApproval", async () => {
    var tx;
    var to = accounts[1];
    controller = await setup(accounts);
    var standardToken = await StandardTokenMock.new(avatar.address, 100);
    await avatar.transferOwnership(controller.address);
    tx = await controller.externalTokenIncreaseApproval(
      standardToken.address,
      avatar.address,
      50
    );
    await avatar
      .getPastEvents("ExternalTokenIncreaseApproval", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "ExternalTokenIncreaseApproval");
      });
    tx = await controller.externalTokenTransferFrom(
      standardToken.address,
      avatar.address,
      to,
      50
    );
    await avatar
      .getPastEvents("ExternalTokenTransferFrom", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "ExternalTokenTransferFrom");
      });
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 50);
    let balanceTo = await standardToken.balanceOf(to);
    assert.equal(balanceTo, 50);
  });

  it("externalTokenTransferFrom & externalTokenDecreaseApproval", async () => {
    var tx;
    var to = accounts[1];
    controller = await setup(accounts);
    var standardToken = await StandardTokenMock.new(avatar.address, 100);
    await avatar.transferOwnership(controller.address);
    await controller.externalTokenIncreaseApproval(
      standardToken.address,
      avatar.address,
      50
    );
    tx = await controller.externalTokenDecreaseApproval(
      standardToken.address,
      avatar.address,
      50
    );
    await avatar
      .getPastEvents("ExternalTokenDecreaseApproval", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "ExternalTokenDecreaseApproval");
      });
    try {
      await controller.externalTokenTransferFrom(
        standardToken.address,
        avatar.address,
        to,
        50
      );
      assert(
        false,
        "externalTokenTransferFrom should fail due to decrease approval "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.externalTokenIncreaseApproval(
      standardToken.address,
      avatar.address,
      50
    );
    tx = await controller.externalTokenTransferFrom(
      standardToken.address,
      avatar.address,
      to,
      50
    );
    await avatar
      .getPastEvents("ExternalTokenTransferFrom", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "ExternalTokenTransferFrom");
      });
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 50);
    let balanceTo = await standardToken.balanceOf(to);
    assert.equal(balanceTo, 50);
  });

  it("getNativeReputation", async () => {
    controller = await setup(accounts);
    var nativeReputation = await controller.getNativeReputation();
    assert.equal(nativeReputation, reputation.address);
  });
});
