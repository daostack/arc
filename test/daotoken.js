const helpers = require("./helpers");
const constants = require("./constants");

const DAOToken = artifacts.require("./DAOToken.sol");
const Avatar = artifacts.require("./Avatar.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");

var actorsFactory;
contract("DAOToken", accounts => {
  const testTokenName = "DAOstack";
  const testTokenSymbol = "STACK";
  it("should put 0 Coins in the first account", async () => {
    var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
    var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

    actorsFactory = await ActorsFactory.new(
      avatarLibrary.address,
      daoTokenLibrary.address,
      { gas: constants.ARC_GAS_LIMIT }
    );

    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );
    let balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.valueOf(), 0);
  });

  it("should be owned by its creator", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );
    let owner = await token.owner();
    assert.equal(owner, accounts[0]);
  });

  it("should mint tokens to owner account", async () => {
    await helpers.etherForEveryone(accounts);

    let owner, totalSupply, userSupply;
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );
    totalSupply = await token.totalSupply();
    owner = await token.owner();
    userSupply = await token.balanceOf(owner);
    assert.equal(totalSupply, 0);
    assert.equal(userSupply, 0);

    await token.mint(owner, 1000);
    totalSupply = await token.totalSupply();
    userSupply = await token.balanceOf(owner);
    assert.equal(totalSupply, 1000);
    assert.equal(userSupply, 1000);

    await token.mint(accounts[2], 1300);
    totalSupply = await token.totalSupply();
    userSupply = await token.balanceOf(accounts[2]);
    assert.equal(totalSupply, 2300);
    assert.equal(userSupply, 1300);
  });

  it("should allow minting tokens only by owner", async () => {
    await helpers.etherForEveryone(accounts);
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );
    let owner = await token.owner();
    let totalSupply = await token.totalSupply();

    // calling 'mint' as a non-owner throws an error
    try {
      await token.mint(owner, 1000, { from: accounts[1] });
      throw "an error";
    } catch (error) {
      helpers.assertVMException(error);
    }

    // and so the supply of tokens should remain unchanged
    let newSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), newSupply.toNumber());
  });

  it("log the Mint event on mint", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );

    const tx = await token.mint(accounts[1], 1000, { from: accounts[0] });

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "Mint");
    assert.equal(tx.logs[0].args.to, accounts[1]);
    assert.equal(tx.logs[0].args.amount.toNumber(), 1000);
  });

  it("mint should be reflected in totalSupply", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );

    await token.mint(accounts[1], 1000, { from: accounts[0] });
    let amount = await token.totalSupply();

    assert.equal(amount, 1000);

    await token.mint(accounts[2], 500, { from: accounts[0] });
    amount = await token.totalSupply();

    assert.equal(amount.toNumber(), 1500);
  });

  it("mint should be reflected in balances", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );

    await token.mint(accounts[1], 1000, { from: accounts[0] });

    const amount = await token.balanceOf(accounts[1]);

    assert.equal(amount.toNumber(), 1000);
  });

  it("totalSupply is 0 on init", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );

    const totalSupply = await token.totalSupply();

    assert.equal(totalSupply.toNumber(), 0);
  });

  it("burn", async () => {
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
        .logs[0].args.newTokenAddress
    );

    await token.mint(accounts[1], 1000, { from: accounts[0] });

    var amount = await token.balanceOf(accounts[1]);

    assert.equal(amount.toNumber(), 1000);

    await token.burn(100, { from: accounts[1] });

    amount = await token.balanceOf(accounts[1]);

    assert.equal(amount.toNumber(), 900);

    const totalSupply = await token.totalSupply();

    assert.equal(totalSupply.toNumber(), 900);
  });

  it("CappedToken ", async () => {
    let cap = 100000000;
    const token = await DAOToken.at(
      (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, cap))
        .logs[0].args.newTokenAddress
    );

    await token.mint(accounts[1], cap);

    var amount = await token.balanceOf(accounts[1]);

    assert.equal(amount.toNumber(), cap);

    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply.toNumber(), cap);

    try {
      await token.mint(accounts[1], 1);
      throw "an error";
    } catch (error) {
      helpers.assertVMException(error);
    }

    totalSupply = await token.totalSupply();

    assert.equal(totalSupply.toNumber(), cap);
  });

  describe("onlyOwner", () => {
    it("mint by owner", async () => {
      const token = await DAOToken.at(
        (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
          .logs[0].args.newTokenAddress
      );
      try {
        await token.mint(accounts[1], 10, { from: accounts[0] });
      } catch (ex) {
        assert(false, "owner could not mint");
      }
    });

    it("mint by not owner", async () => {
      const token = await DAOToken.at(
        (await actorsFactory.createDAOToken(testTokenName, testTokenSymbol, 0))
          .logs[0].args.newTokenAddress
      );

      try {
        await token.mint(accounts[1], 10, { from: accounts[1] });
      } catch (ex) {
        return;
      }

      assert(false, "non-owner was able to mint");
    });
  });
});
