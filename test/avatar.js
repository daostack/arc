const helpers = require('./helpers');
const Avatar = artifacts.require("./Avatar.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const ActionMock = artifacts.require('./test/ActionMock.sol');


let avatar,accounts;

const setup = async function () {
  accounts = web3.eth.accounts;
  avatar = await Avatar.new(0x1234, accounts[0], accounts[1]);
  return avatar;
};

contract('Avatar', function (accounts)  {

    it("genericAction no owner", async () => {
        avatar = await setup();
        let action = await ActionMock.new();
        try{
         await avatar.genericAction(action.address,[0],{ from: accounts[1] });
         assert(false, "genericAction should fail due to wrong owner");
         } catch (ex) {
             helpers.assertVMException(ex);
         }
    });

    it("generic call", async () => {
        avatar = await setup();
        let action = await ActionMock.new();
        await avatar.transferOwnership(action.address);
        var tx = await action.genericAction(avatar.address,[0x4567]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "Action");
        assert.equal(tx.logs[0].args._param, "0x4567000000000000000000000000000000000000000000000000000000000000");
    });

    it("generic call should revert if action revert", async () => {
        avatar = await setup();
        let action = await ActionMock.new();
        await avatar.transferOwnership(action.address);
        try{
           await action.genericAction(avatar.address,[0x1234]);
           assert(false,"generic call should revert if action revert ");
          }
          catch(ex){
          helpers.assertVMException(ex);
        }
    });

    it("pay ether to avatar", async () => {
        avatar = await setup();
        web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});
        var avatarBalance =  web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
        assert.equal(avatarBalance,1);
    });

    it("sendEther from ", async () => {
        avatar = await setup();
        let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
         web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});
        var avatarBalance =  web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
        assert.equal(avatarBalance,1);
        var tx = await avatar.sendEther(web3.toWei('1', "ether"),otherAvatar.address);
        assert.equal(tx.logs.length, 2);
        assert.equal(tx.logs[1].event, "SendEther");
        avatarBalance = web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
        assert.equal(avatarBalance,0);
        var otherAvatarBalance =  web3.eth.getBalance(otherAvatar.address)/web3.toWei('1', "ether");
        assert.equal(otherAvatarBalance,1);
    });

    it("externalTokenTransfer  ", async () => {
      avatar = await setup();
      var standardToken = await StandardTokenMock.new(avatar.address, 100);
      let balanceAvatar = await standardToken.balanceOf(avatar.address);
      assert.equal(balanceAvatar, 100);
      var tx = await avatar.externalTokenTransfer(standardToken.address,accounts[1],50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenTransfer");
      balanceAvatar = await standardToken.balanceOf(avatar.address);
      assert.equal(balanceAvatar, 50);
      let balance1 = await standardToken.balanceOf(accounts[1]);
      assert.equal(balance1, 50);
    });

    it("externalTokenTransferFrom & externalTokenIncreaseApproval", async () => {
      var tx;
      var to   = accounts[1];
      avatar = await setup();
      var standardToken = await StandardTokenMock.new(avatar.address, 100);
      tx = await avatar.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenIncreaseApproval");
      tx = await avatar.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
      let balanceAvatar = await standardToken.balanceOf(avatar.address);
      assert.equal(balanceAvatar, 50);
      let balanceTo = await standardToken.balanceOf(to);
      assert.equal(balanceTo, 50);
    });

    it("externalTokenTransferFrom & externalTokenDecreaseApproval", async () => {
      var tx;
      var to   = accounts[1];
      avatar = await setup();
      var standardToken = await StandardTokenMock.new(avatar.address, 100);
      tx = await avatar.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
      tx = await avatar.externalTokenDecreaseApproval(standardToken.address,avatar.address,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenDecreaseApproval");
      try{
         await avatar.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
         assert(false,"externalTokenTransferFrom should fail due to decrease approval ");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
      tx = await avatar.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
      tx = await avatar.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
      let balanceAvatar = await standardToken.balanceOf(avatar.address);
      assert.equal(balanceAvatar, 50);
      let balanceTo = await standardToken.balanceOf(to);
      assert.equal(balanceTo, 50);
    });

});
