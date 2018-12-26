const helpers = require('./helpers');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const constants = require('./constants');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
var Auction4Reputation = artifacts.require("./Auction4Reputation.sol");


const setup = async function (accounts,
                             _auctionReputationReward = 100,
                             _auctionsStartTime = 0,
                             _auctionsEndTime = 3000,
                             _numberOfAuctions = 3,
                             _redeemEnableTime = 3000,
                             _initialize = true) {
   var testSetup = new helpers.TestSetup();
   testSetup.biddingToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});

   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.auctionsEndTime = (await web3.eth.getBlock("latest")).timestamp + _auctionsEndTime;
   testSetup.auctionsStartTime = (await web3.eth.getBlock("latest")).timestamp + _auctionsStartTime;
   testSetup.redeemEnableTime = (await web3.eth.getBlock("latest")).timestamp + _redeemEnableTime;
   testSetup.auction4Reputation = await Auction4Reputation.new();
   testSetup.auctionPeriod = (testSetup.auctionsEndTime - testSetup.auctionsStartTime)/3;
   if (_initialize === true ) {
     await testSetup.auction4Reputation.initialize(testSetup.org.avatar.address,
                                                     _auctionReputationReward,
                                                     testSetup.auctionsStartTime,
                                                     testSetup.auctionPeriod,
                                                     _numberOfAuctions,
                                                     testSetup.redeemEnableTime,
                                                     testSetup.biddingToken.address,
                                                     testSetup.org.avatar.address,
                                                     {gas : constants.ARC_GAS_LIMIT});
   }

   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.auction4Reputation.address],[web3.utils.asciiToHex("0")],[permissions]);
   await testSetup.biddingToken.approve(testSetup.auction4Reputation.address,web3.utils.toWei('100', "ether"));
   return testSetup;
};

contract('Auction4Reputation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);

      assert.equal(await testSetup.auction4Reputation.reputationRewardLeft(),300);
      assert.equal(await testSetup.auction4Reputation.auctionsEndTime(),testSetup.auctionsStartTime + testSetup.auctionPeriod*3);
      assert.equal(await testSetup.auction4Reputation.auctionsStartTime(),testSetup.auctionsStartTime);
      assert.equal(await testSetup.auction4Reputation.redeemEnableTime(),testSetup.redeemEnableTime);
      assert.equal(await testSetup.auction4Reputation.token(),testSetup.biddingToken.address);
      assert.equal(await testSetup.auction4Reputation.numberOfAuctions(),3);
      assert.equal(await testSetup.auction4Reputation.wallet(),testSetup.org.avatar.address);
      assert.equal(await testSetup.auction4Reputation.auctionPeriod(),testSetup.auctionPeriod);
    });

    it("initialize numberOfAuctions = 0  is not allowed", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               300,
                                               0,
                                               1000,
                                               0,
                                               3000,
                                              accounts[0],
                                              accounts[0],
                                              {gas :constants.ARC_GAS_LIMIT});
        assert(false, "numberOfAuctions = 0  is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("initialize auctionPeriod <= 15 seconds  is not allowed", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               300,
                                               0,
                                               15,
                                               3,
                                               3000,
                                              accounts[0],
                                              accounts[0],
                                              {gas :constants.ARC_GAS_LIMIT});
        assert(false, "numberOfAuctions = 0  is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("initialize _redeemEnableTime < auctionsEndTime is not allowed", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               100,
                                               0,
                                               1000,
                                               1,
                                               1000-1,
                                              accounts[0],
                                              accounts[0],
                                              {gas :constants.ARC_GAS_LIMIT});
        assert(false, "_redeemEnableTime < auctionsEndTime is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("initialize is onlyOwner", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               100,
                                               0,
                                               1000,
                                               1,
                                               1000,
                                              accounts[0],
                                              accounts[0],
                                              {gas :constants.ARC_GAS_LIMIT,from:accounts[1]});
        assert(false, "initialize is onlyOwner");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await auction4Reputation.initialize(accounts[0],
                                             100,
                                             0,
                                             1000,
                                             1,
                                             1000,
                                            accounts[0],
                                            accounts[0],
                                          {gas :constants.ARC_GAS_LIMIT,from:accounts[0]});
    });

    it("initialize auctionsEndTime = auctionsStartTime is not allowed", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               100,
                                               300,
                                               300,
                                               1,
                                               300,
                                              accounts[0],
                                              accounts[0]);
        assert(false, "auctionsEndTime = auctionsStartTime is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("initialize auctionsEndTime < auctionsStartTime is not allowed", async () => {
      var auction4Reputation = await Auction4Reputation.new();
      try {
        await auction4Reputation.initialize(accounts[0],
                                               100,
                                               200,
                                               100,
                                               1,
                                               100,
                                              accounts[0],
                                              accounts[0]);
        assert(false, "auctionsEndTime < auctionsStartTime is not allowed");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("bid", async () => {
      let testSetup = await setup(accounts);
      var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
      var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
      assert.equal(tx.logs.length,1);
      assert.equal(tx.logs[0].event,"Bid");
      assert.equal(tx.logs[0].args._auctionId,id);
      assert.equal(tx.logs[0].args._amount,web3.utils.toWei('1', "ether"));
      assert.equal(tx.logs[0].args._bidder,accounts[0]);
      //test the tokens moved to the wallet.
      assert.equal(await testSetup.biddingToken.balanceOf(testSetup.auction4Reputation.address),web3.utils.toWei('1', "ether"));
    });

    it("transferToWallet ", async () => {
      let testSetup = await setup(accounts);
      await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
      assert.equal(await testSetup.biddingToken.balanceOf(testSetup.auction4Reputation.address),web3.utils.toWei('1', "ether"));
      try {
        await testSetup.auction4Reputation.transferToWallet();
        assert(false, "cannot transferToWallet before auction end time");
      } catch(error) {
        helpers.assertVMException(error);
      }
      await helpers.increaseTime(3001);
      await testSetup.auction4Reputation.transferToWallet();
      assert.equal(await testSetup.biddingToken.balanceOf(testSetup.auction4Reputation.address),web3.utils.toWei('0', "ether"));
      assert.equal(await testSetup.biddingToken.balanceOf(testSetup.org.avatar.address),web3.utils.toWei('1', "ether"));

    });

    it("bid without initialize should fail", async () => {
      let testSetup = await setup(accounts,100,0,3000,3,3000,false);
      try {
        await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        assert(false, "bid without initialize should fail");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("bid with value == 0 should revert", async () => {
      let testSetup = await setup(accounts);
      try {
        await testSetup.auction4Reputation.bid(web3.utils.toWei('0', "ether"));
        assert(false, "bid with value == 0 should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("bid after _auctionEndTime should revert", async () => {
      let testSetup = await setup(accounts);
      await helpers.increaseTime(3001);
      try {
        await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        assert(false, "bid after _auctionEndTime should revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("redeem", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3001);
        var bid = await testSetup.auction4Reputation.getBid(accounts[0],id);
        assert.equal(bid,web3.utils.toWei('1', "ether"));
        tx = await testSetup.auction4Reputation.redeem(accounts[0],id);
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"Redeem");
        assert.equal(tx.logs[0].args._amount,100);
        assert.equal(tx.logs[0].args._beneficiary,accounts[0]);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+100);
    });

    it("redeem score ", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"),{from:accounts[0]});
        var id1 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await testSetup.biddingToken.transfer(accounts[1],web3.utils.toWei('3', "ether"));
        await testSetup.biddingToken.approve(testSetup.auction4Reputation.address,web3.utils.toWei('100', "ether"),{from:accounts[1]});
        tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('3', "ether"),{from:accounts[1]});
        var id2 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3001);
        await testSetup.auction4Reputation.redeem(accounts[0],id1);
        await testSetup.auction4Reputation.redeem(accounts[1],id2);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+25);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[1]),75);
    });

    it("redeem cannot redeem twice", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3001);
        await testSetup.auction4Reputation.redeem(accounts[0],id);
        try {
          await testSetup.auction4Reputation.redeem(accounts[0],id);
          assert(false, "cannot redeem twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("redeem before auctionEndTime should revert", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(50);
        try {
             await testSetup.auction4Reputation.redeem(accounts[0],id);
             assert(false, "redeem before auctionEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("redeem before redeemEnableTime should revert", async () => {
        let testSetup = await setup(accounts,100,0,3000,3,4000,true);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3500);
        try {
             await testSetup.auction4Reputation.redeem(accounts[0],id);
             assert(false, "redeem before auctionEndTime should revert");
           } catch(error) {
             helpers.assertVMException(error);
           }
        await helpers.increaseTime(501);
        await testSetup.auction4Reputation.redeem(accounts[0],id);
    });

    it("bid and redeem from all acutions", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id1 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(1001);
        tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id2 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(1001);
        tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id3 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3000);
        var totalBid1 = await testSetup.auction4Reputation.auctions(id1);
        var totalBid2 = await testSetup.auction4Reputation.auctions(id2);
        var totalBid3 = await testSetup.auction4Reputation.auctions(id3);
        assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid2)),true);
        assert.equal(web3.utils.BN(totalBid1).eq(web3.utils.BN(totalBid3)),true);
        assert.equal(totalBid1,web3.utils.toWei('1', "ether"));
        assert.equal(id1,0);
        assert.equal(id2,1);
        assert.equal(id3,2);
        await testSetup.auction4Reputation.redeem(accounts[0],id1);
        await testSetup.auction4Reputation.redeem(accounts[0],id2);
        await testSetup.auction4Reputation.redeem(accounts[0],id3);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000+300);
    });

    it("bid twice on the same auction", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id1 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id2 = await helpers.getValueFromLogs(tx, '_auctionId',1);
        assert.equal(id1.toNumber(),id2.toNumber());
        var bid = await testSetup.auction4Reputation.getBid(accounts[0],id1);
        assert.equal(bid,web3.utils.toWei('2', "ether"));
    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.auction4Reputation.initialize(accounts[0],
                                                              100,
                                                              200,
                                                              100,
                                                              1,
                                                              100,
                                                              accounts[0],
                                                              accounts[0]);
             assert(false, "cannot initialize twice");
           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("get earned reputation", async () => {
        let testSetup = await setup(accounts);
        var tx = await testSetup.auction4Reputation.bid(web3.utils.toWei('1', "ether"));
        var id = await helpers.getValueFromLogs(tx, '_auctionId',1);
        await helpers.increaseTime(3001);
        tx = await testSetup.auction4Reputation.redeem.call(accounts[0],id);
        const reputation = await testSetup.auction4Reputation.redeem.call(accounts[0], id);
        assert.equal(reputation,100);
        assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),1000);
    });
});
