const helpers = require('./helpers');
var Web3Utils = require('web3-utils');

const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const UniversalSchemeMock = artifacts.require('./test/UniversalSchemeMock.sol');

var avatar,token,reputation,genesisScheme;
const setup = async function (accounts,founderToken,founderReputation) {
  genesisScheme = await GenesisScheme.deployed();
  var tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",[accounts[0]],[founderToken],[founderReputation]);
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await avatar.nativeToken();
  token = await DAOToken.at(tokenAddress);
  var reputationAddress = await avatar.nativeReputation();
  reputation = await Reputation.at(reputationAddress);
};

contract('GenesisScheme', function(accounts) {

    it("forgeOrg check avatar", async function() {
        await setup(accounts,10,10);
        var orgName = await avatar.orgName();
        assert.equal(Web3Utils.hexToUtf8(orgName),"testOrg");
    });

    it("forgeOrg check reputations and tokens to founders", async function() {
        await setup(accounts,10,10);
        var founderBalance = await token.balanceOf(accounts[0]);
        assert.equal(founderBalance,10);
        var founderReputation = await reputation.reputationOf(accounts[0]);
        assert.equal(founderReputation,10);
    });


    it("forgeOrg check transfer ownership", async function() {
        //check the forgeOrg transfer ownership to avatar ,reputation and token
        //to the controller contract
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var controllerAddress,controller;
        controllerAddress = await avatar.owner();
        controller = await Controller.at(controllerAddress);

        var controllerAvatarAddress = await controller.avatar();
        assert.equal(controllerAvatarAddress,avatar.address);
        var tokenAddress = await avatar.nativeToken();
        var token = await DAOToken.at(tokenAddress);
        controllerAddress = await token.owner();
        controller = await Controller.at(controllerAddress);
        var controllerTokenAddress = await controller.nativeToken();
        assert.equal(controllerTokenAddress,tokenAddress);

        var reputationAddress = await avatar.nativeReputation();
        var reputation = await Reputation.at(reputationAddress);
        controllerAddress = await reputation.owner();
        controller = await Controller.at(controllerAddress);
        var controllerReputationAddress = await controller.nativeReputation();
        assert.equal(controllerReputationAddress,reputationAddress);
    });

    it("setSchemes to none UniversalScheme", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var tx = await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "InitialSchemesSet");
        assert.equal(tx.logs[0].args._avatar, avatar.address);
      });

    it("setSchemes to UniversalScheme", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var standardTokenMock = await StandardTokenMock.new(avatar.address, 100);
        var universalSchemeMock = await UniversalSchemeMock.new(standardTokenMock.address,10,accounts[1]);
        var tx = await genesisScheme.setSchemes(avatar.address,[universalSchemeMock.address],[0],[true],["0x0000000F"]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "InitialSchemesSet");
        assert.equal(tx.logs[0].args._avatar, avatar.address);
    });

    it("setSchemes from account that does not hold the lock", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        try {
         await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"],{ from: accounts[1]});
         assert(false,"should fail because accounts[1] does not hold the lock");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
    });

    it("setSchemes increase approval for scheme and register org in scheme", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var standardTokenMock = await StandardTokenMock.new(avatar.address, 100);
        var universalSchemeMock = await UniversalSchemeMock.new(standardTokenMock.address,10,accounts[1]);
        var allowance = await standardTokenMock.allowance(avatar.address,universalSchemeMock.address);
        assert.equal(allowance,0);
        assert.equal(false,await universalSchemeMock.isRegistered(avatar.address));
        await genesisScheme.setSchemes(avatar.address,[universalSchemeMock.address],[0],[true],["0x0000000F"]);
        allowance = await standardTokenMock.allowance(avatar.address,universalSchemeMock.address);
        assert.equal(allowance,0);
        //check org registered in scheme
        assert.equal(true,await universalSchemeMock.isRegistered(avatar.address));
    });

    it("setSchemes increase approval for scheme without fee", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var standardTokenMock = await StandardTokenMock.new(accounts[0], 100);
        var allowance = await standardTokenMock.allowance(avatar.address,accounts[1]);
        assert.equal(allowance,0);

        await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"]);
        allowance = await standardTokenMock.allowance(avatar.address,accounts[1]);
        assert.equal(allowance,0);
    });

    it("setSchemes check register", async function() {
        var amountToMint = 10;
        var controllerAddress,controller;
        await setup(accounts,amountToMint,amountToMint);
        await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"]);
        controllerAddress = await avatar.owner();
        controller = await Controller.at(controllerAddress);
        var isSchemeRegistered = await controller.isSchemeRegistered(accounts[1]);
        assert.equal(isSchemeRegistered,true);
    });

    it("setSchemes check unregisterSelf", async function() {
        var amountToMint = 10;
        var controllerAddress,controller;
        await setup(accounts,amountToMint,amountToMint);
        controllerAddress = await avatar.owner();
        controller = await Controller.at(controllerAddress);
        var isSchemeRegistered = await controller.isSchemeRegistered(genesisScheme.address);
        assert.equal(isSchemeRegistered,true);
        await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"]);
        controllerAddress = await avatar.owner();
        controller = await Controller.at(controllerAddress);
        isSchemeRegistered = await controller.isSchemeRegistered(genesisScheme.address);
        assert.equal(isSchemeRegistered,false);
    });

    it("setSchemes delete lock", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"]);
        try {
         await genesisScheme.setSchemes(avatar.address,[accounts[1]],[0],[false],["0x0000000F"],{ from: accounts[1]});
         assert(false,"should fail because lock for account[0] suppose to be deleted by the first call");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
    });
});
