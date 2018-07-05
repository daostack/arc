const helpers = require('./helpers');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const StandardTokenMock = artifacts.require('./StandardTokenMock.sol');
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
const ActionMock = artifacts.require('./test/ActionMock.sol');
const UniversalSchemeMock = artifacts.require('./test/UniversalSchemeMock.sol');
var constants = require('../test/constants');


var uint32 = require('uint32');
let accounts = web3.eth.accounts;
let reputation, avatar,token,controller;
var amountToMint = 10;

const setup = async function (permission='0',registerScheme = accounts[0]) {
  var _controller;
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();

  avatar = await Avatar.new('name', token.address, reputation.address);
  if (permission !== '0') {
    _controller = await Controller.new(avatar.address,{from:accounts[1],gas: constants.ARC_GAS_LIMIT});
    await _controller.registerScheme(registerScheme,0,permission,avatar.address,{from:accounts[1]});
    await _controller.unregisterSelf(avatar.address,{from:accounts[1]});
  }
  else {
    _controller = await Controller.new(avatar.address,{gas: constants.ARC_GAS_LIMIT});
  }
  controller = _controller;
  return _controller;
};

const constraint = async function (method, pre=false, post=false) {
  var globalConstraints = await GlobalConstraintMock.new();
  let globalConstraintsCountOrig = await controller.globalConstraintsCount(avatar.address);
  await globalConstraints.setConstraint(method,pre,post);
  await controller.addGlobalConstraint(globalConstraints.address,0,avatar.address);
  let globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
  assert.equal(globalConstraintsCount[0].toNumber(),globalConstraintsCountOrig[0].toNumber() + (pre ? 0 : 1));
  assert.equal(globalConstraintsCount[1].toNumber(),globalConstraintsCountOrig[1].toNumber() + (post ? 0 : 1));
  return globalConstraints;
};

contract('Controller', function (accounts)  {

   it("getGlobalConstraintParameters", async function() {
        controller = await setup();
        // separate cases for pre and post
        var globalConstraints = await constraint("gcParams1", true);
        await controller.addGlobalConstraint(globalConstraints.address,"0x1235",avatar.address);

        var paramsHash = await controller.getGlobalConstraintParameters(globalConstraints.address, avatar.address);

        assert.equal(paramsHash,"0x1235000000000000000000000000000000000000000000000000000000000000");

        globalConstraints = await constraint("gcParams2", false, true);
        await controller.addGlobalConstraint(globalConstraints.address,"0x1236",avatar.address);

        paramsHash = await controller.getGlobalConstraintParameters(globalConstraints.address, avatar.address);

        assert.equal(paramsHash,"0x1236000000000000000000000000000000000000000000000000000000000000");
    });

    it("mint reputation via controller", async () => {
        controller = await setup();
        await reputation.transferOwnership(controller.address);
        let tx =  await controller.mintReputation(amountToMint,accounts[0],avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "MintReputation");
        assert.equal(tx.logs[0].args._amount, amountToMint);
        assert.equal(tx.logs[0].args._to, accounts[0]);
        let rep = await reputation.reputationOf(accounts[0]);
        assert.equal(rep,amountToMint);
    });

    it("burn reputation via controller", async () => {
        controller = await setup();
        await reputation.transferOwnership(controller.address);
        await controller.mintReputation(amountToMint,accounts[0],avatar.address);
        let tx =  await controller.burnReputation(amountToMint-1,accounts[0],avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "BurnReputation");
        assert.equal(tx.logs[0].args._amount, amountToMint-1);
        assert.equal(tx.logs[0].args._from, accounts[0]);
        let rep = await reputation.reputationOf(accounts[0]);
        assert.equal(rep,1);
    });

    it("mint tokens via controller", async () => {
        controller = await setup();
        await token.transferOwnership(controller.address);
        let tx =  await controller.mintTokens(amountToMint,accounts[0],avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "MintTokens");
        assert.equal(tx.logs[0].args._amount, amountToMint);
        let balance =  await token.balanceOf(accounts[0]);
        assert.equal(balance,amountToMint);
    });

    it("register schemes", async () => {
        controller = await setup();
        let tx =  await controller.registerScheme(accounts[1], 0,0,avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
    });

    it("register schemes - check permissions for register new scheme", async () => {
      // Check scheme has at least the permissions it is changing, and at least the current permissions.
      var i,j;
    //  controller;
      for(j = 0; j <= 15; j++ ){
        //registered scheme has already permission to register(2)
        controller = await setup('0x'+uint32.toHex(j|2));
        var  register;
        for(i = 0; i <= 15; i++ ){
          register = true;
          try {
                await controller.registerScheme(accounts[1],0,'0x'+uint32.toHex(i),avatar.address);
              } catch (ex) {
                //registered scheme has already permission to register(2) and is register(1).
                assert.notEqual(i&(~(j|3),0));
                register = false;
              }
              if (register){
                await controller.unregisterScheme(accounts[1],avatar.address);
                register= false;
              }
            }
        }
    });

    it("register schemes - check permissions for updating existing scheme", async () => {
      // Check scheme has at least the permissions it is changing, and at least the current permissions.
      controller = await setup('0x0000000F');
       // scheme with permission 0x0000000F should be able to register scheme with permission 0x00000001
        let tx = await controller.registerScheme(accounts[0],0,'0x'+uint32.toHex(1),avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");

        controller = await setup('0x00000001');
        try {
          await controller.registerScheme(accounts[0],0,'0x'+uint32.toHex(2),avatar.address);
          assert(false, 'scheme with permission 0x00000001 should not be able to register scheme with permission 0x00000002');
        } catch (ex) {
          helpers.assertVMException(ex);
        }
    });

    it("unregister schemes", async () => {
        controller = await setup();
        let tx =  await controller.unregisterScheme(accounts[0],avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "UnregisterScheme");
    });
    it("unregister none registered scheme", async () => {
        controller = await setup();
        let tx =  await controller.unregisterScheme(accounts[1],avatar.address);
        assert.equal(tx.logs.length, 0);
    });

    it("unregister schemes - check permissions unregister scheme", async () => {
      // Check scheme has at least the permissions it is changing, and at least the current permissions.
      //1. setup
      controller = await setup();
      //2. account[0] register schemes ,on account[1] with variables permissions which could unregister other schemes.
      var i,j;
      var tx;
      var registeredScheme = accounts[1];
      var unregisteredScheme = accounts[2];
      for(i = 0; i <= 15; i++ ){
        //registered scheme has already permission to register(2)
        tx = await controller.registerScheme(registeredScheme,0,'0x'+uint32.toHex(i|3),avatar.address);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
        for(j = 0; j <= 15; j++ ){
          tx = await controller.registerScheme(unregisteredScheme,0,'0x'+uint32.toHex(j),avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "RegisterScheme");
          //try to unregisterScheme
          if (j&(~(i|3))) {
            //unregister should fail
            try {
             await controller.unregisterScheme(unregisteredScheme,avatar.address,{ from: registeredScheme });
             assert(false, "scheme with permission " +uint32.toHex(i|3)+ " should not be able to unregister scheme with permission"+uint32.toHex(j));
              } catch (ex) {
                  helpers.assertVMException(ex);
              }
           }else{
             //unregister should success
            tx = await controller.unregisterScheme(unregisteredScheme,avatar.address,{ from: registeredScheme });
            assert.equal(tx.logs.length, 1);
            assert.equal(tx.logs[0].event, "UnregisterScheme");
           }
         }
       }
     });

     it("call with none valid avatar should revert", async () => {
       controller = await setup();
       var registeredScheme = accounts[1];
       try {
           await controller.registerScheme(registeredScheme,0,'0x'+uint32.toHex(1|3),0);
           assert(false, "call with none valid avatar should revert");
         } catch (ex) {
             helpers.assertVMException(ex);
         }
      });

     it("unregister self", async () => {
       var tx;
       controller = await setup("0x00000000");
       tx = await controller.unregisterSelf(avatar.address,{ from: accounts[1]});
       assert.equal(tx.logs.length, 0); // scheme was not registered

       tx = await controller.unregisterSelf(avatar.address);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "UnregisterScheme");
      });

      it("isSchemeRegistered ", async () => {
        var isSchemeRegistered;
        controller = await setup("0x00000000");
        isSchemeRegistered = await controller.isSchemeRegistered(accounts[1],avatar.address);
        assert.equal(isSchemeRegistered, false);
        isSchemeRegistered = await controller.isSchemeRegistered(accounts[0],avatar.address);
        assert.equal(isSchemeRegistered, true);
       });

      it("addGlobalConstraint ", async () => {
        controller = await setup();
        var globalConstraints = await constraint("0");
        var tx = await controller.addGlobalConstraint(globalConstraints.address,0,avatar.address);
        assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),true);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "AddGlobalConstraint");
        var count = await controller.globalConstraintsCount(avatar.address);
        assert.equal(count[0], 1); //pre
        assert.equal(count[1], 1); //post
       });
       it("removeGlobalConstraint ", async () => {
         controller = await setup();
         var globalConstraints = await GlobalConstraintMock.new();
         await globalConstraints.setConstraint("0",false,false);
         var globalConstraints1 = await GlobalConstraintMock.new();
         await globalConstraints1.setConstraint("method",false,false);
         var globalConstraints2 = await GlobalConstraintMock.new();
         await globalConstraints2.setConstraint("method",false,false);
         var globalConstraints3 = await GlobalConstraintMock.new();
         await globalConstraints3.setConstraint("method",false,false);
         var globalConstraints4 = await GlobalConstraintMock.new();
         await globalConstraints4.setConstraint("method",false,false);

         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),false);
         await controller.addGlobalConstraint(globalConstraints.address,0,avatar.address);
         await controller.addGlobalConstraint(globalConstraints1.address,0,avatar.address);
         await controller.addGlobalConstraint(globalConstraints2.address,0,avatar.address);
         await controller.addGlobalConstraint(globalConstraints3.address,0,avatar.address);
         await controller.addGlobalConstraint(globalConstraints4.address,0,avatar.address);
         var tx = await controller.removeGlobalConstraint(globalConstraints2.address,avatar.address);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveGlobalConstraint");
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints.address,avatar.address),true);
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints1.address,avatar.address),true);
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints2.address,avatar.address),false);
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints3.address,avatar.address),true);
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints4.address,avatar.address),true);

         let gcCount = await controller.globalConstraintsCount(avatar.address);

         assert.equal(gcCount[0],4);
         assert.equal(gcCount[1],4);

         await controller.removeGlobalConstraint(globalConstraints4.address,avatar.address);
         assert.equal(await controller.isGlobalConstraintRegistered(globalConstraints4.address,avatar.address),false);
         gcCount = await controller.globalConstraintsCount(avatar.address);
         assert.equal(gcCount[0],3);
         assert.equal(gcCount[1],3);
        });

        it("upgrade controller ", async () => {
          controller = await setup();
          await reputation.transferOwnership(controller.address);
          await token.transferOwnership(controller.address);
          await avatar.transferOwnership(controller.address);
          var tx = await controller.upgradeController(accounts[1],avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "UpgradeController");
        });

        it("upgrade controller check permission", async () => {
          controller = await setup('0x00000007');
          await reputation.transferOwnership(controller.address);
          await token.transferOwnership(controller.address);
          await avatar.transferOwnership(controller.address);
          try{
            await controller.upgradeController(accounts[1],avatar.address);
            assert(false,"scheme with permission 0x00000007 is not allowed to upgrade ");
          } catch (ex) {
            helpers.assertVMException(ex);
          }
        });

        it("generic call log", async () => {
          controller = await setup('0x00000010');
          await avatar.transferOwnership(controller.address);
          let actionMock =  await ActionMock.new();
          let a = 7;
          let b = actionMock.address;
          let c = 0x1234;
          const extraData = await actionMock.test.request(a,b,c);
          var tx = await controller.genericCall(actionMock.address,extraData.params[0].data,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "GenericCall");

        });

        it("generic call", async () => {
          controller = await setup('0x00000010');
          await avatar.transferOwnership(controller.address);
          let actionMock =  await ActionMock.new();
          let a = 7;
          let b = actionMock.address;
          let c = 0x1234;
          const extraData = await actionMock.test.request(a,b,c);
          var result = await controller.genericCall.call(actionMock.address,extraData.params[0].data,avatar.address);
          assert.equal(result, 14);

        });

        it("generic call via contract scheme", async () => {
          var scheme = await UniversalSchemeMock.new();
          controller = await setup('0x00000010',scheme.address);
          await avatar.transferOwnership(controller.address);
          let actionMock =  await ActionMock.new();
          let a = 7;
          let b = actionMock.address;
          let c = 0x1234;
          let result = await scheme.genericCall.call(avatar.address,actionMock.address, a,b,c);
          assert.equal(result, 14);

        });

        it("sendEther", async () => {
          controller = await setup();
          let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, avatar.address);
          await avatar.transferOwnership(controller.address);
          //send some ether to the avatar
          web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});
          //send some ether from an organization's avatar to the otherAvatar
          var tx = await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "SendEther");
          var avatarBalance = web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
          assert.equal(avatarBalance, 0);
          var otherAvatarBalance = web3.eth.getBalance(otherAvatar.address)/web3.toWei('1', "ether");
          assert.equal(otherAvatarBalance, 1);
        });

        it("externalTokenTransfer", async () => {
          //External transfer token from avatar contract to other address
          controller = await setup();
          var standardToken = await StandardTokenMock.new(avatar.address, 100);
          let balanceAvatar = await standardToken.balanceOf(avatar.address);
          assert.equal(balanceAvatar, 100);
          await avatar.transferOwnership(controller.address);
          var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenTransfer");
          balanceAvatar = await standardToken.balanceOf(avatar.address);
          assert.equal(balanceAvatar, 50);
          let balance1 = await standardToken.balanceOf(accounts[1]);
          assert.equal(balance1, 50);
        });

        it("externalTokenTransferFrom & ExternalTokenIncreaseApproval", async () => {
          var tx;
          var to   = accounts[1];
          controller = await setup();
          var standardToken = await StandardTokenMock.new(avatar.address, 100);
          await avatar.transferOwnership(controller.address);
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenIncreaseApproval");
          tx = await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
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
          controller = await setup();
          var standardToken = await StandardTokenMock.new(avatar.address, 100);
          await avatar.transferOwnership(controller.address);
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
          tx = await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenDecreaseApproval");
          try{
             await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
             assert(false,"externalTokenTransferFrom should fail due to decrease approval ");
            }
            catch(ex){
              helpers.assertVMException(ex);
            }
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
          tx=  await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
          let balanceAvatar = await standardToken.balanceOf(avatar.address);
          assert.equal(balanceAvatar, 50);
          let balanceTo = await standardToken.balanceOf(to);
          assert.equal(balanceTo, 50);
        });

        it("globalConstraints mintReputation add & remove", async () => {
          await setup();
          var globalConstraints = await constraint("mintReputation");
          await reputation.transferOwnership(controller.address);
          try {
          await controller.mintReputation(amountToMint,accounts[0],avatar.address);
          assert(false,"mint reputation should fail due to the global constraint ");
          }
          catch(ex){
            helpers.assertVMException(ex);
          }
          await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
          var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
          assert.equal(globalConstraintsCount[0],0);
          assert.equal(globalConstraintsCount[1],0);
          let tx = await controller.mintReputation(amountToMint,accounts[0],avatar.address);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "MintReputation");
          assert.equal(tx.logs[0].args._amount, amountToMint);
          assert.equal(tx.logs[0].args._to, accounts[0]);
          let rep = await reputation.reputationOf(accounts[0]);
          assert.equal(rep,amountToMint);
          });

          it("globalConstraints mintTokens add & remove", async () => {

            controller = await setup();
            var globalConstraints = await constraint("mintTokens");
            await token.transferOwnership(controller.address);
            try {
            await controller.mintTokens(amountToMint,accounts[0],avatar.address);
            assert(false,"mint tokens should fail due to the global constraint ");
            }
            catch(ex){
              helpers.assertVMException(ex);
            }
            await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
            var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
            assert.equal(globalConstraintsCount[0],0);
            assert.equal(globalConstraintsCount[1],0);
            let tx =  await controller.mintTokens(amountToMint,accounts[0],avatar.address);
            assert.equal(tx.logs.length, 1);
            assert.equal(tx.logs[0].event, "MintTokens");
            assert.equal(tx.logs[0].args._amount, amountToMint);
            let balance =  await token.balanceOf(accounts[0]);
            assert.equal(balance,amountToMint);
            });

           it("globalConstraints register schemes add & remove", async () => {
              controller = await setup();
              var globalConstraints = await constraint("registerScheme");
              try {
              await controller.registerScheme(accounts[1], 0,0,avatar.address);
              assert(false,"registerScheme should fail due to the global constraint ");
              }
              catch(ex){
                helpers.assertVMException(ex);
              }
              await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
              var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
              assert.equal(globalConstraintsCount[0],0);
              assert.equal(globalConstraintsCount[1],0);
              let tx =  await controller.registerScheme(accounts[1], 0,0,avatar.address);
              assert.equal(tx.logs.length, 1);
              assert.equal(tx.logs[0].event, "RegisterScheme");
              });

              it("globalConstraints unregister schemes add & remove", async () => {
                 controller = await setup();
                 var globalConstraints = await constraint("registerScheme");
                 try {
                 await controller.unregisterScheme(accounts[0],avatar.address);
                 assert(false,"unregisterScheme should fail due to the global constraint ");
                 }
                 catch(ex){
                   helpers.assertVMException(ex);
                 }
                 await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                 var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                 assert.equal(globalConstraintsCount[0],0);
                 assert.equal(globalConstraintsCount[1],0);
                 let tx =  await controller.unregisterScheme(accounts[0],avatar.address);
                 assert.equal(tx.logs.length, 1);
                 assert.equal(tx.logs[0].event, "UnregisterScheme");
                 });

                 it("globalConstraints generic call  add & remove", async () => {
                    controller = await setup('0x00000014');
                    var globalConstraints = await constraint("genericCall");
                    await avatar.transferOwnership(controller.address);
                    let actionMock =  await ActionMock.new();
                    let a = 7;
                    let b = actionMock.address;
                    let c = 0x1234;
                    const extraData = await actionMock.test.request(a,b,c);
                    try {
                    await controller.genericCall.call(actionMock.address,extraData.params[0].data,avatar.address);
                    assert(false,"genericCall should fail due to the global constraint ");
                    }
                    catch(ex){
                      helpers.assertVMException(ex);
                    }
                    await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                    var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                    assert.equal(globalConstraintsCount[0],0);
                    assert.equal(globalConstraintsCount[1],0);
                    var tx =  await controller.genericCall(actionMock.address,extraData.params[0].data,avatar.address);
                    assert.equal(tx.logs.length, 1);
                    assert.equal(tx.logs[0].event, "GenericCall");
                    });

                    it("globalConstraints sendEther  add & remove", async () => {
                       controller = await setup();
                       var globalConstraints = await constraint("sendEther");
                       let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, avatar.address);
                       await avatar.transferOwnership(controller.address);
                       web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});

                       try {
                        await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address,avatar.address);
                        assert(false,"sendEther should fail due to the global constraint ");
                       }
                       catch(ex){
                         helpers.assertVMException(ex);
                       }
                       await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                       var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                       assert.equal(globalConstraintsCount[0],0);
                       var tx = await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address,avatar.address);
                       assert.equal(tx.logs.length, 1);
                       assert.equal(tx.logs[0].event, "SendEther");
                       var avatarBalance = web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
                       assert.equal(avatarBalance, 0);
                       var otherAvatarBalance = web3.eth.getBalance(otherAvatar.address)/web3.toWei('1', "ether");
                       assert.equal(otherAvatarBalance, 1);
                       });

                       it("globalConstraints externalTokenTransfer  add & remove", async () => {
                          controller = await setup();
                          var globalConstraints = await constraint("externalTokenTransfer");
                          var standardToken = await StandardTokenMock.new(avatar.address, 100);
                          let balanceAvatar = await standardToken.balanceOf(avatar.address);
                          assert.equal(balanceAvatar, 100);
                          await avatar.transferOwnership(controller.address);

                          try {
                           await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
                           assert(false,"externalTokenTransfer should fail due to the global constraint ");
                          }
                          catch(ex){
                            helpers.assertVMException(ex);
                          }
                          await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                          var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                          assert.equal(globalConstraintsCount[0],0);
                          var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
                          assert.equal(tx.logs.length, 1);
                          assert.equal(tx.logs[0].event, "ExternalTokenTransfer");
                          balanceAvatar = await standardToken.balanceOf(avatar.address);
                          assert.equal(balanceAvatar, 50);
                          let balance1 = await standardToken.balanceOf(accounts[1]);
                          assert.equal(balance1, 50);
                          });

                          it("globalConstraints externalTokenTransferFrom , externalTokenIncreaseApproval , externalTokenDecreaseApproval", async () => {
                             var tx;
                             var to   = accounts[1];
                             controller = await setup();
                             var globalConstraints = await constraint("externalTokenIncreaseApproval");
                             var standardToken = await StandardTokenMock.new(avatar.address, 100);
                             await avatar.transferOwnership(controller.address);

                             try {
                              await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
                              assert(false,"externalTokenIncreaseApproval should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                             var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                             assert.equal(globalConstraintsCount[0],0);

                             tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
                             assert.equal(tx.logs.length, 1);
                             assert.equal(tx.logs[0].event, "ExternalTokenIncreaseApproval");
                             globalConstraints = await constraint("externalTokenTransferFrom");
                             try {
                              await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
                              assert(false,"externalTokenTransferFrom should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                             globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                             assert.equal(globalConstraintsCount[0],0);



                             globalConstraints = await constraint("externalTokenDecreaseApproval");
                             try {
                              await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50,avatar.address);
                              assert(false,"externalTokenDecreaseApproval should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                             await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50,avatar.address);
                             try {
                              await await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
                              assert(false,"externalTokenTransferFrom should fail due to decrease approval ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }

                             await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50,avatar.address);
                             tx = await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50,avatar.address);
                             assert.equal(tx.logs.length, 1);
                             assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
                             let balanceAvatar = await standardToken.balanceOf(avatar.address);
                             assert.equal(balanceAvatar, 50);
                             let balanceTo = await standardToken.balanceOf(to);
                             assert.equal(balanceTo, 50);
                             });

                             it("globalConstraints externalTokenTransfer  add & remove", async () => {
                                controller = await setup();
                                var globalConstraints = await constraint("externalTokenTransfer");
                                var standardToken = await StandardTokenMock.new(avatar.address, 100);
                                let balanceAvatar = await standardToken.balanceOf(avatar.address);
                                assert.equal(balanceAvatar, 100);
                                await avatar.transferOwnership(controller.address);

                                try {
                                 await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
                                 assert(false,"externalTokenTransfer should fail due to the global constraint ");
                                }
                                catch(ex){
                                  helpers.assertVMException(ex);
                                }
                                await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                                var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                                assert.equal(globalConstraintsCount[0],0);
                                var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50,avatar.address);
                                assert.equal(tx.logs.length, 1);
                                assert.equal(tx.logs[0].event, "ExternalTokenTransfer");
                                balanceAvatar = await standardToken.balanceOf(avatar.address);
                                assert.equal(balanceAvatar, 50);
                                let balance1 = await standardToken.balanceOf(accounts[1]);
                                assert.equal(balance1, 50);
                                });

                                it("getNativeReputation", async () => {

                                   controller = await setup();
                                   var nativeReputation = await controller.getNativeReputation(avatar.address);
                                   assert.equal(nativeReputation,reputation.address);

                                });
});
