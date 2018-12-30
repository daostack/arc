const helpers = require('./helpers');
const Avatar = artifacts.require("./Avatar.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const ActionMock = artifacts.require('./test/ActionMock.sol');
const UniversalSchemeMock = artifacts.require('./test/UniversalSchemeMock.sol');

let avatar;

const setup = async function (accounts) {
  avatar = await Avatar.new("0x1234", accounts[0], accounts[1]);
  return avatar;
};

contract('Avatar',  accounts =>  {

    it("genericCall no owner", async () => {
        avatar = await setup(accounts);
        let actionMock = await ActionMock.new();
        var scheme = await UniversalSchemeMock.new();
        let a = 7;
        let b = actionMock.address;
        let c = "0x1234";
        try{
         await scheme.genericCallDirect.call(avatar.address,actionMock.address,a,b,c,{from :accounts[1]});
         assert(false, "genericAction should fail due to wrong owner");
         } catch (ex) {
             helpers.assertVMException(ex);
         }
    });

    it("generic call", async () => {
        avatar = await setup(accounts);
        let actionMock = await ActionMock.new();
        var scheme = await UniversalSchemeMock.new();
        await avatar.transferOwnership(scheme.address);
        let a = 7;
        let b = actionMock.address;
        let c = "0x1234";
        var result = await scheme.genericCallDirect.call(avatar.address,actionMock.address,a,b,c);
        assert.equal(result[1],a*2);
    });

    it("generic call should not revert if action revert", async () => {
        avatar = await setup(accounts);
        let actionMock = await ActionMock.new();
        var scheme = await UniversalSchemeMock.new();
        await avatar.transferOwnership(scheme.address);
        let a = 7;
        let b = actionMock.address;
        let c = "0x4567"; //the action test function require 0x1234
        await scheme.genericCallDirect.call(avatar.address,actionMock.address,a,b,c);
    });

    it("pay ether to avatar", async () => {
        avatar = await setup(accounts);
        await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('1', "ether")});
        var avatarBalance =  await web3.eth.getBalance(avatar.address)/web3.utils.toWei('1', "ether");
        assert.equal(avatarBalance,1);
    });

    it("sendEther from ", async () => {
        avatar = await setup(accounts);
        let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
        await web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.utils.toWei('1', "ether")});
        var avatarBalance =  await web3.eth.getBalance(avatar.address)/web3.utils.toWei('1', "ether");
        assert.equal(avatarBalance,1);
        var tx = await avatar.sendEther(web3.utils.toWei('1', "ether"),otherAvatar.address);
        assert.equal(tx.logs.length, 2);
        assert.equal(tx.logs[1].event, "SendEther");
        avatarBalance =await web3.eth.getBalance(avatar.address)/web3.utils.toWei('1', "ether");
        assert.equal(avatarBalance,0);
        var otherAvatarBalance = await web3.eth.getBalance(otherAvatar.address)/web3.utils.toWei('1', "ether");
        assert.equal(otherAvatarBalance,1);
    });

    it("externalTokenTransfer  ", async () => {
      avatar = await setup(accounts);
      var standardToken = await ERC20Mock.new(avatar.address, 100);
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

    it("externalTokenTransferFrom & externalTokenApproval", async () => {
      var tx;
      var to   = accounts[1];
      avatar = await setup(accounts);
      var standardToken = await ERC20Mock.new(avatar.address, 100);
      tx = await avatar.externalTokenApproval(standardToken.address,avatar.address,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenApproval");
      tx = await avatar.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
      let balanceAvatar = await standardToken.balanceOf(avatar.address);
      assert.equal(balanceAvatar, 50);
      let balanceTo = await standardToken.balanceOf(to);
      assert.equal(balanceTo, 50);
    });
});
