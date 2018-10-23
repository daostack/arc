const helpers = require("./helpers");
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const GlobalConstraintMock = artifacts.require(
  "./test/GlobalConstraintMock.sol"
);
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
    await _controller.registerScheme(
      registerScheme,
      "0x0000000000000000000000000000000000000000",
      permission,
      { from: accounts[1] }
    );
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

const constraint = async function(method, pre = false, post = false) {
  var globalConstraints = await GlobalConstraintMock.new();
  let globalConstraintsCountOrig = await controller.globalConstraintsCount();
  await globalConstraints.setConstraint(
    web3.utils.asciiToHex(method),
    pre,
    post
  );
  await controller.addGlobalConstraint(
    globalConstraints.address,
    web3.utils.asciiToHex("0")
  );
  let globalConstraintsCount = await controller.globalConstraintsCount();
  assert.equal(
    globalConstraintsCount[0].toNumber(),
    globalConstraintsCountOrig[0].toNumber() + (pre ? 0 : 1)
  );
  assert.equal(
    globalConstraintsCount[1].toNumber(),
    globalConstraintsCountOrig[1].toNumber() + (post ? 0 : 1)
  );
  return globalConstraints;
};

contract("Controller", accounts => {
  it("getGlobalConstraintParameters", async () => {
    // Should be called once at start. Sets up the factories.
    await setupFactories();

    controller = await setup(accounts);
    // separate cases for pre and post
    var globalConstraints = await constraint("gcParams1", true);
    await controller.addGlobalConstraint(globalConstraints.address, "0x1235");
    var paramsHash = await controller.getGlobalConstraintParameters(
      globalConstraints.address
    );

    assert.equal(
      paramsHash,
      "0x1235000000000000000000000000000000000000000000000000000000000000"
    );
    globalConstraints = await constraint("gcParams2", false, true);

    await controller.addGlobalConstraint(globalConstraints.address, "0x1236");

    paramsHash = await controller.getGlobalConstraintParameters(
      globalConstraints.address
    );

    assert.equal(
      paramsHash,
      "0x1236000000000000000000000000000000000000000000000000000000000000"
    );
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
    let tx = await controller.registerScheme(
      accounts[1],
      web3.utils.asciiToHex("0"),
      "0x00000000"
    );
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
          await controller.registerScheme(
            accounts[1],
            0,
            "0x" + uint32.toHex(i)
          );
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
    let tx = await controller.registerScheme(
      accounts[0],
      "0x0000000000000000000000000000000000000000",
      "0x00000001"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");

    controller = await setup(accounts, "0x00000001");
    try {
      await controller.registerScheme(
        accounts[0],
        "0x0000000000000000000000000000000000000000",
        "0x00000002"
      );
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
        "0x0000000000000000000000000000000000000000",
        "0x" + uint32.toHex(i | 3)
      );
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RegisterScheme");
      for (j = 0; j <= 15; j++) {
        tx = await controller.registerScheme(
          unregisteredScheme,
          "0x0000000000000000000000000000000000000000",
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

  it("addGlobalConstraint ", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint(0);
    var tx = await controller.addGlobalConstraint(
      globalConstraints.address,
      "0x0000000000000000000000000000000000000000"
    );
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints.address),
      true
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "AddGlobalConstraint");
    var count = await controller.globalConstraintsCount();
    assert.equal(count[0], 1); //pre
    assert.equal(count[1], 1); //post
  });

  it("removeGlobalConstraint ", async () => {
    const zeroBytes32 = "0x0000000000000000000000000000000000000000";
    controller = await setup(accounts);
    var globalConstraints = await GlobalConstraintMock.new();
    await globalConstraints.setConstraint(zeroBytes32, false, false);
    var globalConstraints1 = await GlobalConstraintMock.new();
    await globalConstraints1.setConstraint(
      web3.utils.asciiToHex("method"),
      false,
      false
    );
    var globalConstraints2 = await GlobalConstraintMock.new();
    await globalConstraints2.setConstraint(
      web3.utils.asciiToHex("method"),
      false,
      false
    );
    var globalConstraints3 = await GlobalConstraintMock.new();
    await globalConstraints3.setConstraint(
      web3.utils.asciiToHex("method"),
      false,
      false
    );
    var globalConstraints4 = await GlobalConstraintMock.new();
    await globalConstraints4.setConstraint(
      web3.utils.asciiToHex("method"),
      false,
      false
    );

    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints.address),
      false
    );
    await controller.addGlobalConstraint(
      globalConstraints.address,
      zeroBytes32
    );
    await controller.addGlobalConstraint(
      globalConstraints1.address,
      zeroBytes32
    );
    await controller.addGlobalConstraint(
      globalConstraints2.address,
      zeroBytes32
    );
    await controller.addGlobalConstraint(
      globalConstraints3.address,
      zeroBytes32
    );
    await controller.addGlobalConstraint(
      globalConstraints4.address,
      zeroBytes32
    );
    var tx = await controller.removeGlobalConstraint(
      globalConstraints2.address
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RemoveGlobalConstraint");
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints.address),
      true
    );
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints1.address),
      true
    );
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints2.address),
      false
    );
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints3.address),
      true
    );
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints4.address),
      true
    );

    let gcCount = await controller.globalConstraintsCount();

    assert.equal(gcCount[0], 4);
    assert.equal(gcCount[1], 4);

    await controller.removeGlobalConstraint(globalConstraints4.address);
    assert.equal(
      await controller.isGlobalConstraintRegistered(globalConstraints4.address),
      false
    );
    gcCount = await controller.globalConstraintsCount();
    assert.equal(gcCount[0], 3);
    assert.equal(gcCount[1], 3);
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

  it("globalConstraints mintReputation add & remove", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint("mintReputation");
    await reputation.transferOwnership(controller.address);
    try {
      await controller.mintReputation(amountToMint, accounts[0]);
      assert(
        false,
        "mint reputation should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
    assert.equal(globalConstraintsCount[1], 0);
    let tx = await controller.mintReputation(amountToMint, accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "MintReputation");
    assert.equal(tx.logs[0].args._amount, amountToMint);
    assert.equal(tx.logs[0].args._to, accounts[0]);
    let rep = await reputation.balanceOf(accounts[0]);
    assert.equal(rep, amountToMint);
  });

  it("globalConstraints register schemes add & remove", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint("registerScheme");
    try {
      await controller.registerScheme(
        accounts[1],
        helpers.NULL_HASH,
        "0x00000000"
      );
      assert(false, "registerScheme should fail due to the global constraint ");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
    assert.equal(globalConstraintsCount[1], 0);
    let tx = await controller.registerScheme(
      accounts[1],
      helpers.NULL_HASH,
      "0x00000000"
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterScheme");
  });

  it("globalConstraints unregister schemes add & remove", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint("registerScheme");
    try {
      await controller.unregisterScheme(accounts[0]);
      assert(
        false,
        "unregisterScheme should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
    assert.equal(globalConstraintsCount[1], 0);
    let tx = await controller.unregisterScheme(accounts[0]);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "UnregisterScheme");
  });
  it("globalConstraints generic call  add & remove", async () => {
    controller = await setup(accounts, "0x00000014");
    var globalConstraints = await constraint("genericCall");
    await avatar.transferOwnership(controller.address);
    let actionMock = await ActionMock.new();
    let a = 7;
    let b = actionMock.address;
    let c = "0x1234";
    const encodeABI = await new web3.eth.Contract(actionMock.abi).methods
      .test(a, b, c)
      .encodeABI();
    try {
      await controller.genericCall.call(actionMock.address, encodeABI);
      assert(false, "genericCall should fail due to the global constraint ");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
    assert.equal(globalConstraintsCount[1], 0);
    var tx = await controller.genericCall(actionMock.address, encodeABI);
    await avatar
      .getPastEvents("GenericCall", {
        filter: { _addr: avatar.address }, // Using an array means OR: e.g. 20 or 23
        fromBlock: tx.blockNumber,
        toBlock: "latest"
      })
      .then(function(events) {
        assert.equal(events[0].event, "GenericCall");
      });
  });

  it("globalConstraints sendEther  add & remove", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint("sendEther");
    let otherAvatar = await Avatar.at(
      (await actorsFactory.createAvatar(
        "otheravatar",
        helpers.NULL_ADDRESS,
        avatar.address
      )).logs[0].args.newAvatarAddress
    );
    await avatar.transferOwnership(controller.address);
    web3.eth.sendTransaction({
      from: accounts[0],
      to: avatar.address,
      value: web3.utils.toWei("1", "ether")
    });

    try {
      await controller.sendEther(
        web3.utils.toWei("1", "ether"),
        otherAvatar.address
      );
      assert(false, "sendEther should fail due to the global constraint ");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
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

  it("globalConstraints externalTokenTransfer  add & remove", async () => {
    controller = await setup(accounts);
    var globalConstraints = await constraint("externalTokenTransfer");
    var standardToken = await StandardTokenMock.new(avatar.address, 100);
    let balanceAvatar = await standardToken.balanceOf(avatar.address);
    assert.equal(balanceAvatar, 100);
    await avatar.transferOwnership(controller.address);

    try {
      await controller.externalTokenTransfer(
        standardToken.address,
        accounts[1],
        50
      );
      assert(
        false,
        "externalTokenTransfer should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);
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

  it("getNativeReputation", async () => {
    controller = await setup(accounts);
    var nativeReputation = await controller.getNativeReputation();
    assert.equal(nativeReputation, reputation.address);
  });

  it("globalConstraints externalTokenTransferFrom , externalTokenIncreaseApproval , externalTokenDecreaseApproval", async () => {
    var tx;
    var to = accounts[1];
    controller = await setup(accounts);
    var globalConstraints = await constraint("externalTokenIncreaseApproval");
    var standardToken = await StandardTokenMock.new(avatar.address, 100);
    await avatar.transferOwnership(controller.address);

    try {
      await controller.externalTokenIncreaseApproval(
        standardToken.address,
        avatar.address,
        50
      );
      assert(
        false,
        "externalTokenIncreaseApproval should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    var globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);

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
    globalConstraints = await constraint("externalTokenTransferFrom");
    try {
      await controller.externalTokenTransferFrom(
        standardToken.address,
        avatar.address,
        to,
        50
      );
      assert(
        false,
        "externalTokenTransferFrom should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    globalConstraintsCount = await controller.globalConstraintsCount();
    assert.equal(globalConstraintsCount[0], 0);

    globalConstraints = await constraint("externalTokenDecreaseApproval");
    try {
      await controller.externalTokenDecreaseApproval(
        standardToken.address,
        avatar.address,
        50
      );
      assert(
        false,
        "externalTokenDecreaseApproval should fail due to the global constraint "
      );
    } catch (ex) {
      helpers.assertVMException(ex);
    }
    await controller.removeGlobalConstraint(globalConstraints.address);
    await controller.externalTokenDecreaseApproval(
      standardToken.address,
      avatar.address,
      50
    );
    try {
      await await controller.externalTokenTransferFrom(
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
});
