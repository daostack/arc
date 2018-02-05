const helpers = require('./helpers');
const UController = artifacts.require("./UController.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const StandardTokenMock = artifacts.require('./StandardTokenMock.sol');
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
var constants = require('./constants');

let reputation, avatar, accounts,token,controller;
var amountToMint = 10;

const setup = async function (permission='0x00000000') {
  var uController = await UController.new({gas: constants.GENESIS_SCHEME_GAS_LIMIT});
  accounts = web3.eth.accounts;
  token  = await DAOToken.new("TEST","TST");
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  await avatar.transferOwnership(uController.address);
  if (permission!='0x00000000'){
    await uController.newOrganization(avatar.address,{from:accounts[1]});
    await uController.registerScheme(accounts[0],0,permission,avatar.address,{from:accounts[1]});
    await uController.unregisterSelf(0,{from:accounts[1]});
  }
  else {
    await uController.newOrganization(avatar.address);
  }
  return uController;
};

const constraint = async function (method) {
  var globalConstraints = await GlobalConstraintMock.new();
  let globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
  assert.equal(globalConstraintsCount[0],0);
  assert.equal(globalConstraintsCount[1],0);
  await globalConstraints.setConstraint(method,false,false);
  await controller.addGlobalConstraint(globalConstraints.address,0,avatar.address);
  globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
  assert.equal(globalConstraintsCount[0],1);
  assert.equal(globalConstraintsCount[1],1);
  return globalConstraints;
};

contract('UController', function (accounts)  {

        it("globalConstraints mintReputation add & remove", async () => {
          controller = await  setup();
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
          let rep = await reputation.reputationOf(accounts[0]);
          assert.equal(rep,amountToMint);
          });

          it("globalConstraints mintTokens add & remove", async () => {

            controller = await  setup();
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
              controller = await  setup();
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
                 controller = await  setup();
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
                    controller = await  setup();
                    var globalConstraints = await constraint("genericAction");

                    try {
                    await controller.genericAction([0],avatar.address);
                    assert(false,"genericAction should fail due to the global constraint ");
                    }
                    catch(ex){
                      helpers.assertVMException(ex);
                    }
                    await controller.removeGlobalConstraint(globalConstraints.address,avatar.address);
                    var globalConstraintsCount =await controller.globalConstraintsCount(avatar.address);
                    assert.equal(globalConstraintsCount[0],0);
                    assert.equal(globalConstraintsCount[1],0);
                    var tx =  await controller.genericAction([0],avatar.address);
                    assert.equal(tx.logs.length, 2);
                    assert.equal(tx.logs[0].event, "GenericAction");
                    });

                    it("globalConstraints sendEther  add & remove", async () => {
                       controller = await  setup();
                       var globalConstraints = await constraint("sendEther");
                       let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
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
                       assert.equal(globalConstraintsCount[1],0);
                       var tx = await controller.sendEther(web3.toWei('1', "ether"),otherAvatar.address,avatar.address);
                       assert.equal(tx.logs.length, 1);
                       assert.equal(tx.logs[0].event, "SendEther");
                       var avatarBalance = web3.eth.getBalance(avatar.address)/web3.toWei('1', "ether");
                       assert.equal(avatarBalance, 0);
                       var otherAvatarBalance = web3.eth.getBalance(otherAvatar.address)/web3.toWei('1', "ether");
                       assert.equal(otherAvatarBalance, 1);
                       });

                       it("globalConstraints externalTokenTransfer  add & remove", async () => {
                          controller = await  setup();
                          var globalConstraints = await constraint("externalTokenTransfer");
                          var standardToken = await StandardTokenMock.new(avatar.address, 100);
                          let balanceAvatar = await standardToken.balanceOf(avatar.address);
                          assert.equal(balanceAvatar, 100);

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
                          assert.equal(globalConstraintsCount[1],0);
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
                             controller = await  setup();
                             var globalConstraints = await constraint("externalTokenIncreaseApproval");
                             var standardToken = await StandardTokenMock.new(avatar.address, 100);
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
                             assert.equal(globalConstraintsCount[1],0);

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
});
