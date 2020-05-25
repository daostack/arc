const helpers = require('./helpers');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const DxDAOSecurityAddOn = artifacts.require('./DxDAOSecurityAddOn.sol');
const TokenCapGC = artifacts.require('./TokenCapGC.sol');
const SchemeRegistrar = artifacts.require('./SchemeRegistrar.sol');
var constants = require('../test/constants');

let reputation, schemeRegistrar,avatar,token,controller,tokenCapGC1,tokenCapGC2,dxDAOSecurityAddOn,restorePermissionTime;

const setup = async function (accounts) {
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  controller = await Controller.new(avatar.address,{from:accounts[0], gas: constants.ARC_GAS_LIMIT});
  avatar.transferOwnership(controller.address);
  tokenCapGC1 = await TokenCapGC.new();
  tokenCapGC2 = await TokenCapGC.new();
  schemeRegistrar =  await SchemeRegistrar.new();

  restorePermissionTime = (await web3.eth.getBlock("latest")).timestamp + 1000;
  await controller.registerScheme(schemeRegistrar.address,helpers.SOME_HASH, "0x0000001f" ,avatar.address);
  dxDAOSecurityAddOn = await DxDAOSecurityAddOn.new();
  await dxDAOSecurityAddOn.initialize(avatar.address,
                                      [tokenCapGC1.address,tokenCapGC2.address],
                                      schemeRegistrar.address,
                                      helpers.SOME_HASH,
                                      restorePermissionTime);
  await controller.registerScheme(dxDAOSecurityAddOn.address, helpers.NULL_HASH, "0x0000001f" ,avatar.address);
  // globalConstraintRemoveEtherGC = await GlobalConstraintAddOrRemove.new();
  // await globalConstraintRemoveEtherGC.initialize(avatar.address,etherGC.address, helpers.NULL_HASH);
  // await controller.registerScheme(globalConstraintRemoveEtherGC.address, helpers.NULL_HASH, "0x00000004" ,avatar.address);


};

contract('DxDAOSecurityAddOn', accounts =>  {

     it("initialize", async() => {
          await setup(accounts);
          assert.equal(await dxDAOSecurityAddOn.avatar(),avatar.address);
          assert.equal(await dxDAOSecurityAddOn.globalConstraints(0),tokenCapGC1.address);
          assert.equal(await dxDAOSecurityAddOn.globalConstraints(1),tokenCapGC2.address);

          try {
            await dxDAOSecurityAddOn.initialize(avatar.address,
                      [tokenCapGC1.address,tokenCapGC2.address],
                      schemeRegistrar.address,
                      helpers.SOME_HASH,
                      restorePermissionTime);
            assert(false, 'cannot init twice');
          } catch (ex) {
            helpers.assertVMException(ex);
          }

      });

      it("update", async() => {
           await setup(accounts);
           assert.equal(await controller.isGlobalConstraintRegistered(tokenCapGC1.address,avatar.address),false);
           assert.equal(await controller.isGlobalConstraintRegistered(tokenCapGC2.address,avatar.address),false);
           assert.equal(await controller.getSchemePermissions(schemeRegistrar.address,avatar.address),"0x0000001f");
           assert.equal(await controller.getSchemeParameters(schemeRegistrar.address,avatar.address),helpers.SOME_HASH);
           await dxDAOSecurityAddOn.update();
           assert.equal(await controller.isGlobalConstraintRegistered(tokenCapGC1.address,avatar.address),true);
           assert.equal(await controller.isGlobalConstraintRegistered(tokenCapGC2.address,avatar.address),true);
           assert.equal(await controller.getSchemePermissions(schemeRegistrar.address,avatar.address),"0x00000003");
           assert.equal(await controller.getSchemeParameters(schemeRegistrar.address,avatar.address),helpers.SOME_HASH);

           try {
             await dxDAOSecurityAddOn.update();
             assert(false, 'cannot update twice');
           } catch (ex) {
             helpers.assertVMException(ex);
           }

           try {
             await dxDAOSecurityAddOn.restorePermission();
             assert(false, 'cannot restore permission before time');
           } catch (ex) {
             helpers.assertVMException(ex);
           }

           await helpers.increaseTime(1010);
           await dxDAOSecurityAddOn.restorePermission();
           assert.equal(await controller.getSchemePermissions(schemeRegistrar.address,avatar.address),"0x0000001f");
           assert.equal(await controller.getSchemeParameters(schemeRegistrar.address,avatar.address),helpers.SOME_HASH);

           try {
             await dxDAOSecurityAddOn.restorePermission();
             assert(false, 'cannot restore permission twice (not registered)');
           } catch (ex) {
             helpers.assertVMException(ex);
           }
           assert.equal(await controller.isSchemeRegistered(dxDAOSecurityAddOn.address,avatar.address),false);
           assert.equal(await controller.isSchemeRegistered(schemeRegistrar.address,avatar.address),true);

       });
});
