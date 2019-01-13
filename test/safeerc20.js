const helpers = require('./helpers');
const SafeERC20Mock = artifacts.require('./test/SafeERC20Mock.sol');
const BadERC20 = artifacts.require('./test/BadERC20.sol');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');


contract('safe erc 20', accounts => {

    it("transfer bad token", async () => {
      var badERC20 = await BadERC20.new();
      var safeERC20Mock = await SafeERC20Mock.new(badERC20.address);
      assert.equal(await safeERC20Mock.transferWithFix.call(accounts[1],123),true);
      await safeERC20Mock.transferWithFix(accounts[1],123);
      assert.equal(await badERC20.balances(accounts[1]),123);
    });

    it("transfer bad token without the fix revert", async () => {
      var badERC20 = await BadERC20.new();
      var safeERC20Mock = await SafeERC20Mock.new(badERC20.address);
      try {
        await safeERC20Mock.transfer(accounts[1],123);
        assert(false, "transfer bad token without the fix revert");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("transfer good token", async () => {
      var goodToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
      var safeERC20Mock = await SafeERC20Mock.new(goodToken.address);
      await goodToken.transfer(safeERC20Mock.address,123);
      assert.equal(await safeERC20Mock.transferWithFix.call(accounts[1],123,{from:accounts[0]}),true);
      await safeERC20Mock.transferWithFix(accounts[1],123,{from:accounts[0]});
      assert.equal(await goodToken.balanceOf(accounts[1]),123);
    });


    it("transferFrom bad token", async () => {
      var badERC20 = await BadERC20.new();
      var safeERC20Mock = await SafeERC20Mock.new(badERC20.address);
      assert.equal(await safeERC20Mock.transferFromWithFix.call(accounts[0],accounts[1],123),true);
      await safeERC20Mock.transferFromWithFix(accounts[0],accounts[1],123);
      assert.equal(await badERC20.balances(accounts[1]),123);
    });


    it("transferFrom good token", async () => {
      var goodToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
      var safeERC20Mock = await SafeERC20Mock.new(goodToken.address);
      await goodToken.approve(safeERC20Mock.address,123);
      assert.equal(await safeERC20Mock.transferFromWithFix.call(accounts[0],accounts[1],123,{from:accounts[0]}),true);
      await safeERC20Mock.transferFromWithFix(accounts[0],accounts[1],123,{from:accounts[0]});
      assert.equal(await goodToken.balanceOf(accounts[1]),123);
    });

    it("approve bad token", async () => {
      var badERC20 = await BadERC20.new();
      var safeERC20Mock = await SafeERC20Mock.new(badERC20.address);
      assert.equal(await safeERC20Mock.approveWithFix.call(accounts[0],123),true);
      await safeERC20Mock.approveWithFix(accounts[0],123);
      assert.equal(await badERC20.allowance(safeERC20Mock.address,accounts[0]),123);
    });


    it("approve good token", async () => {
      var goodToken = await ERC20Mock.new(accounts[0], web3.utils.toWei('100', "ether"));
      var safeERC20Mock = await SafeERC20Mock.new(goodToken.address);
      assert.equal(await safeERC20Mock.approveWithFix.call(accounts[0],123),true);
      await safeERC20Mock.approveWithFix(accounts[0],123);
      assert.equal(await goodToken.allowance(safeERC20Mock.address,accounts[0]),123);
    });
});
