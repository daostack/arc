const helpers = require("./helpers");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Controller = artifacts.require("./Controller.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const constants = require("./constants");
const StandardTokenMock = artifacts.require("./test/StandardTokenMock.sol");
var Auction4Reputation = artifacts.require("./Auction4Reputation.sol");
const BootstrapSchemesFactory = artifacts.require(
  "./BootstrapSchemesFactory.sol"
);

var bootstrapSchemesFactory;

const setup = async function(
  accounts,
  _repAllocation = 300,
  _auctionsStartTime = 0,
  _auctionsEndTime = 3000,
  _numberOfAuctions = 3
) {
  var testSetup = new helpers.TestSetup();

  var auction4ReputationLibrary = await Auction4Reputation.new({
    gas: constants.ARC_GAS_LIMIT
  });

  bootstrapSchemesFactory = await BootstrapSchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await bootstrapSchemesFactory.setAuction4ReputationLibraryAddress(
    auction4ReputationLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  testSetup.biddingToken = await StandardTokenMock.new(
    accounts[0],
    web3.utils.toWei("100", "ether")
  );

  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  var actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  testSetup.daoFactory = await DAOFactory.new(
    controllerFactory.address,
    actorsFactory.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );

  testSetup.org = await helpers.setupOrganization(
    testSetup.daoFactory,
    accounts[0],
    1000,
    1000
  );
  testSetup.auctionsEndTime =
    (await web3.eth.getBlock("latest")).timestamp + _auctionsEndTime;
  testSetup.auctionsStartTime =
    (await web3.eth.getBlock("latest")).timestamp + _auctionsStartTime;

  testSetup.auction4Reputation = await Auction4Reputation.at(
    (await bootstrapSchemesFactory.createAuction4Reputation(
      testSetup.org.avatar.address,
      _repAllocation,
      testSetup.auctionsStartTime,
      testSetup.auctionsEndTime,
      _numberOfAuctions,
      testSetup.biddingToken.address,
      testSetup.org.avatar.address,
      { gas: constants.ARC_GAS_LIMIT }
    )).logs[0].args._newSchemeAddress
  );

  var permissions = "0x00000000";
  await testSetup.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.auction4Reputation.address],
    [permissions]
  );
  await testSetup.biddingToken.approve(
    testSetup.auction4Reputation.address,
    web3.utils.toWei("100", "ether")
  );
  return testSetup;
};

contract("Auction4Reputation", accounts => {
  it("initialize", async () => {
    let testSetup = await setup(accounts);

    assert.equal(
      await testSetup.auction4Reputation.reputationRewardLeft(),
      300
    );
    assert.equal(
      await testSetup.auction4Reputation.auctionsEndTime(),
      testSetup.auctionsEndTime
    );
    assert.equal(
      await testSetup.auction4Reputation.auctionsStartTime(),
      testSetup.auctionsStartTime
    );
    assert.equal(
      await testSetup.auction4Reputation.token(),
      testSetup.biddingToken.address
    );
    assert.equal(await testSetup.auction4Reputation.numberOfAuctions(), 3);
    assert.equal(
      await testSetup.auction4Reputation.wallet(),
      testSetup.org.avatar.address
    );
    assert.equal(
      await testSetup.auction4Reputation.auctionPeriod(),
      (testSetup.auctionsEndTime - testSetup.auctionsStartTime) / 3
    );
  });

  it("initialize numberOfAuctions = 0  is not allowed", async () => {
    try {
      await bootstrapSchemesFactory.createAuction4Reputation(
        accounts[0],
        300,
        0,
        3000,
        0,
        accounts[0],
        accounts[0],
        { gas: constants.ARC_GAS_LIMIT }
      );

      assert(false, "numberOfAuctions = 0  is not allowed");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("initialize auctionsEndTime = auctionsStartTime is not allowed", async () => {
    try {
      await bootstrapSchemesFactory.createAuction4Reputation(
        accounts[0],
        300,
        300,
        300,
        1,
        accounts[0],
        accounts[0]
      );

      assert(false, "auctionsEndTime = auctionsStartTime is not allowed");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("initialize auctionsEndTime < auctionsStartTime is not allowed", async () => {
    try {
      await bootstrapSchemesFactory.createAuction4Reputation(
        accounts[0],
        300,
        200,
        100,
        1,
        accounts[0],
        accounts[0]
      );

      assert(false, "auctionsEndTime < auctionsStartTime is not allowed");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("bid", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Bid");
    assert.equal(tx.logs[0].args._auctionId, id);
    assert.equal(tx.logs[0].args._amount, web3.utils.toWei("1", "ether"));
    assert.equal(tx.logs[0].args._bidder, accounts[0]);
    //test the tokens moved to the wallet.
    assert.equal(
      await testSetup.biddingToken.balanceOf(testSetup.org.avatar.address),
      web3.utils.toWei("1", "ether")
    );
  });

  it("bid with value == 0 should revert", async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.auction4Reputation.bid(web3.utils.toWei("0", "ether"));
      assert(false, "bid with value == 0 should revert");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("bid after _auctionEndTime should revert", async () => {
    let testSetup = await setup(accounts);
    await helpers.increaseTime(3001);
    try {
      await testSetup.auction4Reputation.bid(web3.utils.toWei("1", "ether"));
      assert(false, "bid after _auctionEndTime should revert");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("redeem", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(3001);
    var bid = await testSetup.auction4Reputation.getBid(accounts[0], id);
    assert.equal(bid, web3.utils.toWei("1", "ether"));
    tx = await testSetup.auction4Reputation.redeem(accounts[0], id);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._amount, 100);
    assert.equal(tx.logs[0].args._beneficiary, accounts[0]);
    assert.equal(
      await testSetup.org.reputation.balanceOf(accounts[0]),
      1000 + 100
    );
  });

  it("redeem score ", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether"),
      { from: accounts[0] }
    );
    var id1 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await testSetup.biddingToken.transfer(
      accounts[1],
      web3.utils.toWei("3", "ether")
    );
    await testSetup.biddingToken.approve(
      testSetup.auction4Reputation.address,
      web3.utils.toWei("100", "ether"),
      { from: accounts[1] }
    );
    tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("3", "ether"),
      { from: accounts[1] }
    );
    var id2 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(3001);
    await testSetup.auction4Reputation.redeem(accounts[0], id1);
    await testSetup.auction4Reputation.redeem(accounts[1], id2);
    assert.equal(
      await testSetup.org.reputation.balanceOf(accounts[0]),
      1000 + 25
    );
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]), 75);
  });

  it("redeem cannot redeem twice", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(3001);
    await testSetup.auction4Reputation.redeem(accounts[0], id);
    try {
      await testSetup.auction4Reputation.redeem(accounts[0], id);
      assert(false, "cannot redeem twice");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("redeem before auctionEndTime should revert", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(50);
    try {
      await testSetup.auction4Reputation.redeem(accounts[0], id);
      assert(false, "redeem before auctionEndTime should revert");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("bid and redeem from all acutions", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id1 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(1001);
    tx = await testSetup.auction4Reputation.bid(web3.utils.toWei("1", "ether"));
    var id2 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(1001);
    tx = await testSetup.auction4Reputation.bid(web3.utils.toWei("1", "ether"));
    var id3 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    await helpers.increaseTime(3000);
    var totalBid1 = await testSetup.auction4Reputation.auctions(id1);
    var totalBid2 = await testSetup.auction4Reputation.auctions(id2);
    var totalBid3 = await testSetup.auction4Reputation.auctions(id3);
    assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid2)), true);
    assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid3)), true);
    assert.equal(totalBid1, web3.utils.toWei("1", "ether"));
    assert.equal(id1, 0);
    assert.equal(id2, 1);
    assert.equal(id3, 2);
    await testSetup.auction4Reputation.redeem(accounts[0], id1);
    await testSetup.auction4Reputation.redeem(accounts[0], id2);
    await testSetup.auction4Reputation.redeem(accounts[0], id3);
    assert.equal(
      await testSetup.org.reputation.balanceOf(accounts[0]),
      1000 + 300
    );
  });

  it("bid twice on the same auction", async () => {
    let testSetup = await setup(accounts);
    var tx = await testSetup.auction4Reputation.bid(
      web3.utils.toWei("1", "ether")
    );
    var id1 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    tx = await testSetup.auction4Reputation.bid(web3.utils.toWei("1", "ether"));
    var id2 = await helpers.getValueFromLogs(tx, "_auctionId", 1);
    assert.equal(id1.toNumber(), id2.toNumber());
    var bid = await testSetup.auction4Reputation.getBid(accounts[0], id1);
    assert.equal(bid, web3.utils.toWei("2", "ether"));
  });

  it("cannot initialize twice", async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.auction4Reputation.init(
        accounts[0],
        300,
        200,
        100,
        1,
        accounts[0],
        accounts[0]
      );
      assert(false, "cannot initialize twice");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });
});
