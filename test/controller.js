const helpers = require('./helpers');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const StandardTokenMock = artifacts.require('./StandardTokenMock.sol');
//todo : find out how to import this directly from zeppelin.
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');

var uint32 = require('uint32');


let reputation, avatar, accounts,controller,token;
var amountToMint = 10;

const setup = async function (permission='0xffffffff') {
  accounts = web3.eth.accounts;
  token  = await DAOToken.new("TEST","TST");
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  var schemesArray = [accounts[0]];
  var paramsArray = [100];
  var permissionArray = [permission];
  controller = await Controller.new(avatar.address,schemesArray,paramsArray,permissionArray);
  return controller;
};

const constraint = async function (method) {
  var globalConstraints = await GlobalConstraintMock.new();
  let globalConstraintsCount =await controller.globalConstraintsCount();
  assert.equal(globalConstraintsCount,0);
  await globalConstraints.setConstraint(method,false,false);
  await controller.addGlobalConstraint(globalConstraints.address,0);
  globalConstraintsCount =await controller.globalConstraintsCount();
  assert.equal(globalConstraintsCount,1);
  return globalConstraints;
};

contract('Controller', function (accounts)  {
    it("mint reputation via controller", async () => {
        controller = await setup();
        await reputation.transferOwnership(controller.address);
        let tx =  await controller.mintReputation(amountToMint,accounts[0]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "MintReputation");
        assert.equal(tx.logs[0].args._amount, amountToMint);
        let rep = await reputation.reputationOf(accounts[0]);
        assert.equal(rep,amountToMint);
    });

    it("mint tokens via controller", async () => {
        controller = await setup();
        await token.transferOwnership(controller.address);
        let tx =  await controller.mintTokens(amountToMint,accounts[0]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "MintTokens");
        assert.equal(tx.logs[0].args._amount, amountToMint);
        let balance =  await token.balanceOf(accounts[0]);
        assert.equal(balance,amountToMint);
    });

    it("register schemes", async () => {
        controller = await setup();
        let tx =  await controller.registerScheme(accounts[1], 0,0);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
    });

    it("register schemes - check permissions for register new scheme", async () => {
      // Check scheme has at least the permissions it is changing, and at least the current permissions.
      var i,j;
      for(j = 0; j <= 15; j++ ){
        //registered scheme has already permission to register(2)
        controller = await setup('0x'+uint32.toHex(j|2));
        var  register;
        for(i = 0; i <= 15; i++ ){
          register = true;
          try {
                await controller.registerScheme(accounts[1],0,'0x'+uint32.toHex(i));
              } catch (ex) {
                //registered scheme has already permission to register(2) and is register(1).
                assert.notEqual(i&(~(j|3),0));
                register = false;
              }
              if (register){
                await controller.unregisterScheme(accounts[1]);
                register= false;
              }
            }
        }
    });

    it("register schemes - check permissions for updating existing scheme", async () => {
      // Check scheme has at least the permissions it is changing, and at least the current permissions.
      controller = await setup('0x0000000F');
       // scheme with permission 0x0000000F should be able to register scheme with permission 0x00000001
        let tx = await controller.registerScheme(accounts[0],0,'0x'+uint32.toHex(1));
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");

        controller = await setup('0x00000001');
        try {
          await controller.registerScheme(accounts[0],0,'0x'+uint32.toHex(2));
          assert(false, 'scheme with permission 0x00000001 should not be able to register scheme with permission 0x00000002');
        } catch (ex) {
          helpers.assertVMException(ex);
        }
    });

    it("unregister schemes", async () => {
        controller = await setup();
        let tx =  await controller.unregisterScheme(accounts[0]);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "UnregisterScheme");
    });
    it("unregister none registered scheme", async () => {
        controller = await setup();
        let tx =  await controller.unregisterScheme(accounts[1]);
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
        tx = await controller.registerScheme(registeredScheme,0,'0x'+uint32.toHex(i|3));
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RegisterScheme");
        for(j = 0; j <= 15; j++ ){
          tx = await controller.registerScheme(unregisteredScheme,0,'0x'+uint32.toHex(j));
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "RegisterScheme");
          //try to unregisterScheme
          if (j&(~(i|3))) {
            //unregister should fail
            try {
             await controller.unregisterScheme(unregisteredScheme,{ from: registeredScheme });
             assert(false, "scheme with permission " +uint32.toHex(i|3)+ " should not be able to unregister scheme with permission"+uint32.toHex(j));
              } catch (ex) {
                  helpers.assertVMException(ex);
              }
           }else{
             //unregister should success
            tx = await controller.unregisterScheme(unregisteredScheme,{ from: registeredScheme });
            assert.equal(tx.logs.length, 1);
            assert.equal(tx.logs[0].event, "UnregisterScheme");
           }
         }
       }
     });

     it("unregister self", async () => {
       var tx;
       controller = await setup("0x00000000");
       tx = await controller.unregisterSelf({ from: accounts[1]});
       assert.equal(tx.logs.length, 0); // scheme was not registered

       tx = await controller.unregisterSelf();
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "UnregisterScheme");
      });

      it("isSchemeRegistered ", async () => {
        var isSchemeRegistered;
        controller = await setup("0x00000000");
        isSchemeRegistered = await controller.isSchemeRegistered(accounts[1]);
        assert.equal(isSchemeRegistered, false);
        isSchemeRegistered = await controller.isSchemeRegistered(accounts[0]);
        assert.equal(isSchemeRegistered, true);
       });

      it("addGlobalConstraint ", async () => {
        controller = await setup();
        var tx = await controller.addGlobalConstraint(accounts[1],0);
        assert.equal(await controller.isGlobalConstraintRegister(accounts[1]),true);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "AddGlobalConstraint");
        var count = await controller.globalConstraintsCount();
        assert.equal(count, 1);
       });

       it("removeGlobalConstraint ", async () => {
         controller = await setup();
         assert.equal(await controller.isGlobalConstraintRegister(accounts[1]),false);
         await controller.addGlobalConstraint(accounts[1],0);
         await controller.addGlobalConstraint(accounts[2],0);
         await controller.addGlobalConstraint(accounts[3],0);
         await controller.addGlobalConstraint(accounts[4],0);
         await controller.addGlobalConstraint(accounts[5],0);
         var tx = await controller.removeGlobalConstraint(accounts[3]);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveGlobalConstraint");
         assert.equal(await controller.isGlobalConstraintRegister(accounts[1]),true);
         assert.equal(await controller.isGlobalConstraintRegister(accounts[2]),true);
         assert.equal(await controller.isGlobalConstraintRegister(accounts[3]),false);
         assert.equal(await controller.isGlobalConstraintRegister(accounts[4]),true);
         assert.equal(await controller.isGlobalConstraintRegister(accounts[5]),true);
         assert.equal(await controller.globalConstraintsCount(),4);
         await controller.removeGlobalConstraint(accounts[5]);
         assert.equal(await controller.isGlobalConstraintRegister(accounts[5]),false);
         assert.equal(await controller.globalConstraintsCount(),3);
        });

        it("upgrade controller ", async () => {
          controller = await setup();
          await reputation.transferOwnership(controller.address);
          await token.transferOwnership(controller.address);
          await avatar.transferOwnership(controller.address);
          var tx = await controller.upgradeController(accounts[1]);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "UpgradeController");
        });

        it("upgrade controller check permission", async () => {
          controller = await setup('0x00000007');
          await reputation.transferOwnership(controller.address);
          await token.transferOwnership(controller.address);
          await avatar.transferOwnership(controller.address);
          try{
            await controller.upgradeController(accounts[1]);
            assert(false,"scheme with permission 0x00000007 is not allowed to upgrade ");
          } catch (ex) {
            helpers.assertVMException(ex);
          }
        });

        it("generic call", async () => {
          controller = await setup();
          await avatar.transferOwnership(controller.address);
          var tx = await controller.genericAction([0]);
          assert.equal(tx.logs.length, 2);
          assert.equal(tx.logs[0].event, "GenericAction");

        });
        it("sendEther", async () => {
          controller = await setup();
          let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
          await avatar.transferOwnership(controller.address);
          //send some ether to the avatar
          web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});
          //send some ether from an organization's avatar to the otherAvatar
          var tx = await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address);
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
          var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50);
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
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenIncreaseApproval");
          tx = await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
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
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
          tx = await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "ExternalTokenDecreaseApproval");
          try{
             await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
             assert(false,"externalTokenTransferFrom should fail due to decrease approval ");
            }
            catch(ex){
              helpers.assertVMException(ex);
            }
          tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
          tx=  await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
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
          await controller.mintReputation(amountToMint,accounts[0]);
          assert(false,"mint reputation should fail due to the global constraint ");
          }
          catch(ex){
            helpers.assertVMException(ex);
          }
          await controller.removeGlobalConstraint(globalConstraints.address);
          var globalConstraintsCount =await controller.globalConstraintsCount();
          assert.equal(globalConstraintsCount,0);
          let tx = await controller.mintReputation(amountToMint,accounts[0]);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "MintReputation");
          assert.equal(tx.logs[0].args._amount, amountToMint);
          let rep = await reputation.reputationOf(accounts[0]);
          assert.equal(rep,amountToMint);
          });

          it("globalConstraints mintTokens add & remove", async () => {

            controller = await setup();
            var globalConstraints = await constraint("mintTokens");
            await token.transferOwnership(controller.address);
            try {
            await controller.mintTokens(amountToMint,accounts[0]);
            assert(false,"mint tokens should fail due to the global constraint ");
            }
            catch(ex){
              helpers.assertVMException(ex);
            }
            await controller.removeGlobalConstraint(globalConstraints.address);
            var globalConstraintsCount =await controller.globalConstraintsCount();
            assert.equal(globalConstraintsCount,0);
            let tx =  await controller.mintTokens(amountToMint,accounts[0]);
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
              await controller.registerScheme(accounts[1], 0,0);
              assert(false,"registerScheme should fail due to the global constraint ");
              }
              catch(ex){
                helpers.assertVMException(ex);
              }
              await controller.removeGlobalConstraint(globalConstraints.address);
              var globalConstraintsCount =await controller.globalConstraintsCount();
              assert.equal(globalConstraintsCount,0);
              let tx =  await controller.registerScheme(accounts[1], 0,0);
              assert.equal(tx.logs.length, 1);
              assert.equal(tx.logs[0].event, "RegisterScheme");
              });

              it("globalConstraints unregister schemes add & remove", async () => {
                 controller = await setup();
                 var globalConstraints = await constraint("registerScheme");
                 try {
                 await controller.unregisterScheme(accounts[0]);
                 assert(false,"unregisterScheme should fail due to the global constraint ");
                 }
                 catch(ex){
                   helpers.assertVMException(ex);
                 }
                 await controller.removeGlobalConstraint(globalConstraints.address);
                 var globalConstraintsCount =await controller.globalConstraintsCount();
                 assert.equal(globalConstraintsCount,0);
                 let tx =  await controller.unregisterScheme(accounts[0]);
                 assert.equal(tx.logs.length, 1);
                 assert.equal(tx.logs[0].event, "UnregisterScheme");
                 });

                 it("globalConstraints generic call  add & remove", async () => {
                    controller = await setup();
                    var globalConstraints = await constraint("genericAction");
                    await avatar.transferOwnership(controller.address);

                    try {
                    await controller.genericAction([0]);
                    assert(false,"genericAction should fail due to the global constraint ");
                    }
                    catch(ex){
                      helpers.assertVMException(ex);
                    }
                    await controller.removeGlobalConstraint(globalConstraints.address);
                    var globalConstraintsCount =await controller.globalConstraintsCount();
                    assert.equal(globalConstraintsCount,0);
                    var tx =  await controller.genericAction([0]);
                    assert.equal(tx.logs.length, 2);
                    assert.equal(tx.logs[0].event, "GenericAction");
                    });

                    it("globalConstraints sendEther  add & remove", async () => {
                       controller = await setup();
                       var globalConstraints = await constraint("sendEther");
                       let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
                       await avatar.transferOwnership(controller.address);
                       web3.eth.sendTransaction({from:accounts[0],to:avatar.address, value: web3.toWei('1', "ether")});

                       try {
                        await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address);
                        assert(false,"sendEther should fail due to the global constraint ");
                       }
                       catch(ex){
                         helpers.assertVMException(ex);
                       }
                       await controller.removeGlobalConstraint(globalConstraints.address);
                       var globalConstraintsCount =await controller.globalConstraintsCount();
                       assert.equal(globalConstraintsCount,0);
                       var tx = await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address);
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
                           await controller.externalTokenTransfer(standardToken.address,accounts[1],50);
                           assert(false,"externalTokenTransfer should fail due to the global constraint ");
                          }
                          catch(ex){
                            helpers.assertVMException(ex);
                          }
                          await controller.removeGlobalConstraint(globalConstraints.address);
                          var globalConstraintsCount =await controller.globalConstraintsCount();
                          assert.equal(globalConstraintsCount,0);
                          var tx = await controller.externalTokenTransfer(standardToken.address,accounts[1],50);
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
                              await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
                              assert(false,"externalTokenIncreaseApproval should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address);
                             var globalConstraintsCount =await controller.globalConstraintsCount();
                             assert.equal(globalConstraintsCount,0);

                             tx = await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
                             assert.equal(tx.logs.length, 1);
                             assert.equal(tx.logs[0].event, "ExternalTokenIncreaseApproval");
                             globalConstraints = await constraint("externalTokenTransferFrom");
                             try {
                              await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
                              assert(false,"externalTokenTransferFrom should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address);
                             globalConstraintsCount =await controller.globalConstraintsCount();
                             assert.equal(globalConstraintsCount,0);



                             globalConstraints = await constraint("externalTokenDecreaseApproval");
                             try {
                              await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50);
                              assert(false,"externalTokenDecreaseApproval should fail due to the global constraint ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }
                             await controller.removeGlobalConstraint(globalConstraints.address);
                             await controller.externalTokenDecreaseApproval(standardToken.address,avatar.address,50);
                             try {
                              await await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
                              assert(false,"externalTokenTransferFrom should fail due to decrease approval ");
                             }
                             catch(ex){
                               helpers.assertVMException(ex);
                             }

                             await controller.externalTokenIncreaseApproval(standardToken.address,avatar.address,50);
                             tx = await controller.externalTokenTransferFrom(standardToken.address,avatar.address,to,50);
                             assert.equal(tx.logs.length, 1);
                             assert.equal(tx.logs[0].event, "ExternalTokenTransferFrom");
                             let balanceAvatar = await standardToken.balanceOf(avatar.address);
                             assert.equal(balanceAvatar, 50);
                             let balanceTo = await standardToken.balanceOf(to);
                             assert.equal(balanceTo, 50);
                             });
});
