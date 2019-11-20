const helpers = require('./helpers');
const constants = require('./constants');
const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const Controller = artifacts.require("./Controller.sol");
const SchemeMock = artifacts.require('./test/SchemeMock.sol');
const Wallet = artifacts.require('./test/Wallet.sol');

var avatar;
var daoToken;
var reputation;
var nativeTokenData;
var registration;

const setup = async function (accounts,founderToken,founderReputation,cap=0) {
  registration = await helpers.registerImplementation();
  nativeTokenData = await new web3.eth.Contract(registration.daoToken.abi)
                        .methods
                        .initialize("TEST","TST",cap,registration.daoFactory.address)
                        .encodeABI();

  var tx = await registration.daoFactory.forgeOrg("testOrg",nativeTokenData,[accounts[0]],[founderToken],[founderReputation],[0,0,0],{gas:constants.ARC_GAS_LIMIT});
  assert.equal(tx.logs.length, 5);
  assert.equal(tx.logs[4].event, "NewOrg");
  var avatarAddress = tx.logs[4].args._avatar;
  avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await avatar.nativeToken({from:accounts[1]});
  daoToken = await DAOToken.at(tokenAddress);
  var reputationAddress = await avatar.nativeReputation({from:accounts[1]});
  reputation = await Reputation.at(reputationAddress);
};

contract('DaoFactory', function(accounts) {

    it("forgeOrg check avatar", async function() {
        await setup(accounts,10,10);
        assert.equal(await avatar.orgName({from:accounts[1]}),"testOrg");
    });

    it("forgeOrg check reputations and tokens to founders", async function() {
        await setup(accounts,10,10);
        var founderBalance = await daoToken.balanceOf(accounts[0],{from:accounts[1]});
        assert.equal(founderBalance,10);
        var founderReputation = await reputation.balanceOf(accounts[0],{from:accounts[1]});
        assert.equal(founderReputation,10);
    });


    it("forgeOrg check transfer ownership", async function() {
        //check the forgeOrg transfer ownership to avatar ,reputation and token
        //to the controller contract
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var controllerAddress,controller;
        controllerAddress = await avatar.owner({from:accounts[1]});
        controller = await Controller.at(controllerAddress);

        var controllerAvatarAddress = await controller.avatar({from:accounts[1]});
        assert.equal(controllerAvatarAddress,avatar.address);
        var tokenAddress = await avatar.nativeToken({from:accounts[1]});
        var token = await DAOToken.at(tokenAddress);
        controllerAddress = await token.owner({from:accounts[1]});
        controller = await Controller.at(controllerAddress);
        var controllerTokenAddress = await controller.nativeToken({from:accounts[1]});
        assert.equal(controllerTokenAddress,tokenAddress);

        var reputationAddress = await avatar.nativeReputation({from:accounts[1]});
        var reputation = await Reputation.at(reputationAddress);
        controllerAddress = await reputation.owner({from:accounts[1]});
        controller = await Controller.at(controllerAddress);
        var controllerReputationAddress = await controller.nativeReputation({from:accounts[1]});
        assert.equal(controllerReputationAddress,reputationAddress);
    });

      it("setSchemes", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();

        var schemeMockData2 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,2)
                              .encodeABI();
        var walletData = await new web3.eth.Contract(registration.wallet.abi)
                                                    .methods
                                                    .initialize(avatar.address)
                                                    .encodeABI();

        var tx = await registration.daoFactory.setSchemes(
                    avatar.address,
                    [web3.utils.fromAscii("Wallet"),
                    web3.utils.fromAscii("SchemeMock"),
                    web3.utils.fromAscii("SchemeMock")],
                    helpers.concatBytes(helpers.concatBytes(walletData,schemeMockData1),schemeMockData2),
                    [helpers.getBytesLength(walletData), helpers.getBytesLength(schemeMockData1),helpers.getBytesLength(schemeMockData2)],
                    ["0x0000000F","0x0000000F","0x0000000F"],
                    "metaData");
        assert.equal(tx.logs.length, 5);
        assert.equal(tx.logs[4].event, "InitialSchemesSet");
        assert.equal(tx.logs[4].args._avatar, avatar.address);

        assert.equal(tx.logs[1].event, "SchemeInstance");
        var scheme1Instance =  new SchemeMock(tx.logs[1].args._scheme);
        var scheme2Instance =  new SchemeMock(tx.logs[3].args._scheme);
        assert.equal(await scheme1Instance.testData({from:accounts[1]}), 1);
        assert.equal(await scheme2Instance.testData({from:accounts[1]}), 2);
        assert.equal(await walletInstance.owner({from:accounts[1]}), avatar.address);

      });


    it("setSchemes from account that does not hold the lock", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();
        var schemeMockData2 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,2)
                              .encodeABI();

        try {
          await registration.daoFactory.setSchemes(
                      avatar.address,
                      [web3.utils.fromAscii("SchemeMock"),web3.utils.fromAscii("SchemeMock")],
                      helpers.concatBytes(schemeMockData1, schemeMockData2),
                      [helpers.getBytesLength(schemeMockData1), helpers.getBytesLength(schemeMockData2)],
                      ["0x0000000F","0x0000000F"],
                      "metaData",{from:accounts[1]});
         assert(false,"should fail because accounts[1] does not hold the lock");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
    });

    it("setSchemes check register", async function() {
        var amountToMint = 10;
        var controllerAddress,controller;
        await setup(accounts,amountToMint,amountToMint);
        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();

        var tx = await registration.daoFactory.setSchemes(
                                avatar.address,
                                [web3.utils.fromAscii("SchemeMock")],
                                schemeMockData1,
                                [helpers.getBytesLength(schemeMockData1)],
                                ["0x0000000F"],
                                "metaData");
        controllerAddress = await avatar.owner({from:accounts[1]});
        controller = await Controller.at(controllerAddress);
        var isSchemeRegistered = await controller.isSchemeRegistered(tx.logs[1].args._scheme,{from:accounts[1]});
        assert.equal(isSchemeRegistered,true);
    });

    it("setSchemes check unregisterSelf", async function() {
        var amountToMint = 10;
        var controllerAddress,controller;
        await setup(accounts,amountToMint,amountToMint);
        controllerAddress = await avatar.owner({from:accounts[1]});
        controller = await Controller.at(controllerAddress);
        var isSchemeRegistered = await controller.isSchemeRegistered(registration.daoFactory.address,{from:accounts[1]});
        assert.equal(isSchemeRegistered,true);

        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();

        await registration.daoFactory.setSchemes(
                                avatar.address,
                                [web3.utils.fromAscii("SchemeMock")],
                                schemeMockData1,
                                [helpers.getBytesLength(schemeMockData1)],
                                ["0x0000000F"],
                                "metaData");
        isSchemeRegistered = await controller.isSchemeRegistered(registration.daoFactory.address,{from:accounts[1]});
        assert.equal(isSchemeRegistered,false);
    });

    it("setSchemes delete lock", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();

         await registration.daoFactory.setSchemes(
                                avatar.address,
                                [web3.utils.fromAscii("SchemeMock")],
                                schemeMockData1,
                                [helpers.getBytesLength(schemeMockData1)],
                                ["0x0000000F"],
                                "metaData");
        try {
          await registration.daoFactory.setSchemes(
                                  avatar.address,
                                  [web3.utils.fromAscii("SchemeMock")],
                                  schemeMockData1,
                                  [helpers.getBytesLength(schemeMockData1)],
                                  ["0x0000000F"],
                                  "metaData");
         assert(false,"should fail because lock for account[0] suppose to be deleted by the first call");
        }
        catch(ex){
          helpers.assertVMException(ex);
        }
    });

    it("forgeOrg with different params length should revert", async function() {
       var amountToMint = 10;
       await setup(accounts,amountToMint,amountToMint);

       try {
        await registration.daoFactory.forgeOrg("testOrg",nativeTokenData,[accounts[0]],[11],[],[0,0,0],{gas:constants.ARC_GAS_LIMIT});
        assert(false,"should revert  because reputation array size is 0");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }

       try {
        await registration.daoFactory.forgeOrg("testOrg",
                       nativeTokenData,[accounts[0],
                       helpers.NULL_ADDRESS],
                       [amountToMint,amountToMint],
                       [amountToMint,amountToMint],
                       [0,0,0],
                       {gas:constants.ARC_GAS_LIMIT});
        assert(false,"should revert  because account is 0");
       }
       catch(ex){
         helpers.assertVMException(ex);
       }
   });
    it("setSchemes to SchemeMock and addFounders", async function() {
        var amountToMint = 10;
        await setup(accounts,amountToMint,amountToMint);
        var foundersArray = [];
        var founderReputation = [];
        var founderToken = [];
        var i;
        var numberOfFounders = 60;
        for (i=0;i<numberOfFounders;i++) {
          foundersArray[i] = accounts[1];
          founderReputation[i] = 1;
          founderToken[i] = 1;

        }
        try {
              await registration.daoFactory.addFounders(avatar.address,foundersArray,founderReputation,founderToken,{from:accounts[1],gas:constants.ARC_GAS_LIMIT});
              assert(false,"should revert  because account is lock for account 0");
            }
            catch(ex){
              helpers.assertVMException(ex);
            }

        await registration.daoFactory.addFounders(avatar.address,foundersArray,founderReputation,founderToken,{gas:constants.ARC_GAS_LIMIT});
        var rep = await reputation.balanceOf(accounts[1],{from:accounts[1]});
        assert.equal(rep.toNumber(),numberOfFounders);
        var founderBalance = await daoToken.balanceOf(accounts[1],{from:accounts[1]});
        assert.equal(founderBalance.toNumber(),numberOfFounders);

        var schemeMockData1 = await new web3.eth.Contract(registration.schemeMock.abi)
                              .methods
                              .initialize(avatar.address,1)
                              .encodeABI();

        var tx = await registration.daoFactory.setSchemes(
                                avatar.address,
                                [web3.utils.fromAscii("SchemeMock")],
                                schemeMockData1,
                                [helpers.getBytesLength(schemeMockData1)],
                                ["0x0000000F"],
                                "metaData");
        assert.equal(tx.logs.length, 3);
        assert.equal(tx.logs[2].event, "InitialSchemesSet");
        assert.equal(tx.logs[2].args._avatar, avatar.address);
      });

      it("forgeOrg different version", async function() {
          var amountToMint = 10;
          await setup(accounts,amountToMint,amountToMint);
          var newVer = [0,2,0];
          await helpers.registrationAddVersionToPackege(registration,newVer);
          nativeTokenData = await new web3.eth.Contract(registration.daoToken.abi)
                                .methods
                                .initialize("TEST","TST",0,registration.daoFactory.address)
                                .encodeABI();

          var tx = await registration.daoFactory.forgeOrg("testOrg",nativeTokenData,[accounts[0]],[amountToMint],[amountToMint],[0,1,0],{gas:constants.ARC_GAS_LIMIT});
          assert.equal(tx.logs.length, 5);
          var avatarAddress = tx.logs[4].args._avatar;
          assert.equal(tx.logs[2].event, "ProxyCreated");
          assert.equal(tx.logs[2].args._proxy, avatarAddress);
          assert.equal(tx.logs[2].args._version[1].toNumber(),1);

          tx = await registration.daoFactory.forgeOrg("testOrg",nativeTokenData,[accounts[0]],[amountToMint],[amountToMint],[0,0,0],{gas:constants.ARC_GAS_LIMIT});
          assert.equal(tx.logs.length, 5);
          avatarAddress = tx.logs[4].args._avatar;
          assert.equal(tx.logs[2].event, "ProxyCreated");
          assert.equal(tx.logs[2].args._proxy, avatarAddress);
          assert.equal(tx.logs[2].args._version[1].toNumber(),2);

        });

});
