import * as helpers from "./helpers";
const DAOToken = artifacts.require("./DAOToken.sol");
const TokenCapConstraint = artifacts.require("./TokenCapConstraint.sol");
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ConstraintsFactory = artifacts.require("./ConstraintsFactory.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
var constants = require("../test/constants");

let reputation,
  avatar,
  token,
  controller,
  actorsFactory,
  tokenCapConstraint,
  constraintsFactory;
const setup = async function(permission = "0") {
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

  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  if (permission !== "0") {
    _controller = await Controller.at(
      (await controllerFactory.createController(avatar.address, {
        from: accounts[1],
        gas: constants.ARC_GAS_LIMIT
      })).logs[0].args.newControllerAddress
    );
    await _controller.registerScheme(accounts[0], permission, {
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

  tokenCapConstraint = await TokenCapConstraint.at(
    (await constraintsFactory.createTokenCapConstraint(token.address, 100))
      .logs[0].args._newConstraintAddress
  );
  return _controller;
};

contract("TokenCapConstraint", accounts => {
  before(async function() {
    var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
    var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

    actorsFactory = await ActorsFactory.new(
      avatarLibrary.address,
      daoTokenLibrary.address,
      { gas: constants.ARC_GAS_LIMIT }
    );

    var tokenCapLibrary = await TokenCapConstraint.new();

    constraintsFactory = await ConstraintsFactory.new();

    await constraintsFactory.setTokenCapConstraintLibraryAddress(
      tokenCapLibrary.address
    );
  });

  it("pre and post", async () => {
    var post, pre;

    var token = await DAOToken.at(
      (await actorsFactory.createDAOToken("TEST", "TST", 0)).logs[0].args
        .newTokenAddress
    );

    var tokenCapConstraint = await TokenCapConstraint.at(
      (await constraintsFactory.createTokenCapConstraint(token.address, 100))
        .logs[0].args._newConstraintAddress
    );

    pre = await tokenCapConstraint.pre(token.address, helpers.NULL_HASH);
    assert.equal(pre, true);
    post = await tokenCapConstraint.post(token.address, helpers.NULL_HASH);
    //token total supply is 0
    assert.equal(post, true);
    //increase the total supply
    await token.mint(accounts[2], 101);
    post = await tokenCapConstraint.post(token.address, helpers.NULL_HASH);
    //token total supply is 101
    assert.equal(post, false);
  });

  it("mintTokens check", async () => {
    controller = await setup();

    await controller.addConstraint(tokenCapConstraint.address);

    await token.transferOwnership(controller.address);
    await controller.mintTokens(50, accounts[0]);
    try {
      await controller.mintTokens(51, accounts[0]);
      assert(false, "mint tokens should fail due to the tokenCap constraint ");
    } catch (ex) {
      helpers.assertVMException(ex);
    }
  });
});
