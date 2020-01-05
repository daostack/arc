const helpers = require('./helpers');
const DAO = artifacts.require("./DAO.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const ActionMock = artifacts.require('./test/ActionMock.sol');
const SchemeMock = artifacts.require('./test/SchemeMock.sol');

const ActorsRegistry = artifacts.require('./ActorsRegistry.sol');
const AssetsRegistery = artifacts.require('./AssetsRegistery.sol');

const setup = async function (accounts) {
  var testSetup = new helpers.TestSetup();
  testSetup.dao = await DAO.new();
  testSetup.actorsRegistry = await ActorsRegistry.new();
  await testSetup.actorsRegistry.initialize(testSetup.dao.address);
  testSetup.assetsRegistery = await AssetsRegistery.new();
  await testSetup.assetsRegistery.initialize(testSetup.dao.address);

  await testSetup.dao.initialize("0x1234",
                                 testSetup.actorsRegistry.address,
                                 testSetup.assetsRegistery.address,
                                 accounts[0]);
  return testSetup;
};

const registerActorDataCall = async function(_actorsRegistry,_actor) {
  return await new web3.eth.Contract(_actorsRegistry.abi).methods.register(_actor).encodeABI();
};

const registerAssetDataCall = async function(_assetsRegistery, _name, _address) {
  return await new web3.eth.Contract(_assetsRegistery.abi).methods.register(_name, _address).encodeABI();
};

contract('DAO',  accounts =>  {

    it("generic call", async () => {
        var testSetup = await setup(accounts);
        let actionMock = await ActionMock.new();
        var registerAssetEncodedABI = await registerAssetDataCall(testSetup.assetsRegistery,"ActionMock", actionMock.address);
        await testSetup.dao.genericCall("AssetsRegistery",registerAssetEncodedABI,0);

        var scheme = await SchemeMock.new();
        //register scheme as an actor to the dao.
        var registerActorEncodedABI = await registerActorDataCall(testSetup.actorsRegistry,scheme.address)
        await testSetup.dao.genericCall("ActorsRegistry",registerActorEncodedABI,0);
        let a = 7;
        let b = actionMock.address;
        let c = "0x1234";
        //await web3.eth.sendTransaction({from:accounts[0],to:testSetup.dao.address, value: web3.utils.toWei('1', "ether")});
        var result = await scheme.genericCall.call(testSetup.dao.address,"ActionMock",a,b,c,0);
        assert.equal(result[1],a*2);
        await scheme.genericCall(testSetup.dao.address,"ActionMock",a,b,c,0);
        // assert.equal(await web3.eth.getBalance(actionMock.address),0);

    });

    // it("generic call should not revert if action revert", async () => {
    //     dao = await setup(accounts);
    //     let actionMock = await ActionMock.new();
    //     var scheme = await SchemeMock.new();
    //     await dao.transferOwnership(scheme.address);
    //     let a = 7;
    //     let b = actionMock.address;
    //     let c = "0x4567"; //the action test function require 0x1234
    //     await scheme.genericCallDirect.call(dao.address,actionMock.address,a,b,c,0);
    // });

    // it("pay ether to dao", async () => {
    //     dao = await setup(accounts);
    //     await web3.eth.sendTransaction({from:accounts[0],to:dao.address, value: web3.utils.toWei('1', "ether")});
    //     var daoBalance =  await web3.eth.getBalance(dao.address)/web3.utils.toWei('1', "ether");
    //     assert.equal(daoBalance,1);
    // });
    //
    // it("sendEther from ", async () => {
    //     dao = await setup(accounts);
    //     let otherDAO = await DAO.new('otherdao', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
    //     await web3.eth.sendTransaction({from:accounts[0],to:dao.address, value: web3.utils.toWei('1', "ether")});
    //     var daoBalance =  await web3.eth.getBalance(dao.address)/web3.utils.toWei('1', "ether");
    //     assert.equal(daoBalance,1);
    //     var tx = await dao.sendEther(web3.utils.toWei('1', "ether"),otherDAO.address);
    //     assert.equal(tx.logs.length, 2);
    //     assert.equal(tx.logs[1].event, "SendEther");
    //     daoBalance =await web3.eth.getBalance(dao.address)/web3.utils.toWei('1', "ether");
    //     assert.equal(daoBalance,0);
    //     var otherDAOBalance = await web3.eth.getBalance(otherDAO.address)/web3.utils.toWei('1', "ether");
    //     assert.equal(otherDAOBalance,1);
    // });
    //
    // it("externalTokenTransfer  ", async () => {
    //   dao = await setup(accounts);
    //   var standardToken = await ERC20Mock.new(dao.address, 100);
    //   let balanceDAO = await standardToken.balanceOf(dao.address);
    //   assert.equal(balanceDAO, 100);
    //   var tx = await dao.externalTokenTransfer(standardToken.address,accounts[1],50);
    //   assert.equal(tx.logs.length, 1);
    //   assert.equal(tx.logs[0].event, "ExternalTokenTransfer");
    //   balanceDAO = await standardToken.balanceOf(dao.address);
    //   assert.equal(balanceDAO, 50);
    //   let balance1 = await standardToken.balanceOf(accounts[1]);
    //   assert.equal(balance1, 50);
    // });
    //
    // it("externalTokenTransferFrom & externalTokenApproval", async () => {
    //   var tx;
    //   var to   = accounts[1];
    //   dao = await setup(accounts);
    //   var standardToken = await ERC20Mock.new(dao.address, 100);
    //   tx = await dao.externalTokenApproval(standardToken.address,dao.address,50);
    //   assert.equal(tx.logs.length, 1);
    //   assert.equal(tx.logs[0].event, "ExternalTokenApproval");
    //   tx = await dao.externalTokenTransferFrom(standardToken.address,dao.address,to,50);
    //   assert.equal(tx.logs.length, 1);
    //   assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
    //   let balanceDAO = await standardToken.balanceOf(dao.address);
    //   assert.equal(balanceDAO, 50);
    //   let balanceTo = await standardToken.balanceOf(to);
    //   assert.equal(balanceTo, 50);
    // });
    //
    // it("metaData event", async () => {
    //     dao = await setup(accounts);
    //     let tx = await dao.metaData(helpers.SOME_HASH);
    //     assert.equal(tx.logs.length, 1);
    //     assert.equal(tx.logs[0].event, "MetaData");
    //     assert.equal(tx.logs[0].args["_metaData"], helpers.SOME_HASH);
    // });
});
