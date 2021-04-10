const helpers = require('./helpers');
const Controller = artifacts.require("./Controller.sol");
const Reputation = artifacts.require("./Reputation.sol");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken   = artifacts.require("./DAOToken.sol");
const GlobalConstraintAddOrRemove = artifacts.require('./GlobalConstraintAddOrRemove.sol');
const EtherGC = artifacts.require('./EtherGC.sol');
var constants = require('../test/constants');

let reputation, avatar,token,controller,etherGC,globalConstraintAddEtherGC,globalConstraintRemoveEtherGC;

const setup = async function (accounts) {
  token  = await DAOToken.new("TEST","TST",0);
  // set up a reputation system
  reputation = await Reputation.new();
  avatar = await Avatar.new('name', token.address, reputation.address);
  controller = await Controller.new(avatar.address,{from:accounts[0], gas: constants.ARC_GAS_LIMIT});
  avatar.transferOwnership(controller.address);
  etherGC = await EtherGC.new();
  await etherGC.initialize(avatar.address,10,web3.utils.toWei('5', "ether")); //10 blocks ,5 eth

  globalConstraintAddEtherGC = await GlobalConstraintAddOrRemove.new();
  await globalConstraintAddEtherGC.initialize(avatar.address,etherGC.address, helpers.NULL_HASH);

  await controller.registerScheme(globalConstraintAddEtherGC.address, helpers.NULL_HASH, "0x00000004" ,avatar.address);
  globalConstraintRemoveEtherGC = await GlobalConstraintAddOrRemove.new();
  await globalConstraintRemoveEtherGC.initialize(avatar.address,etherGC.address, helpers.NULL_HASH);
  await controller.registerScheme(globalConstraintRemoveEtherGC.address, helpers.NULL_HASH, "0x00000004" ,avatar.address);


};

contract('GlobalConstraintAddOrRemove', accounts =>  {

     it("initialize", async() => {
          await setup(accounts);
          assert.equal(await globalConstraintAddEtherGC.avatar(),avatar.address);
          assert.equal(await globalConstraintAddEtherGC.globalConstraint(),etherGC.address);
          try {
            await globalConstraintAddEtherGC.initialize(avatar.address,etherGC.address, helpers.NULL_HASH);
            assert(false, 'cannot init twice');
          } catch (ex) {
            helpers.assertVMException(ex);
          }

      });

      it("register global constraint", async () => {
          await setup(accounts);
          assert.equal(await controller.isGlobalConstraintRegistered(etherGC.address,avatar.address),false);
          await globalConstraintAddEtherGC.add();
          assert.equal(await controller.isGlobalConstraintRegistered(etherGC.address,avatar.address),true);
          assert.equal(await controller.isSchemeRegistered(globalConstraintAddEtherGC.address,avatar.address),false);
      });

      it("remove global constraint", async () => {
          await setup(accounts);
          await globalConstraintAddEtherGC.add();
          assert.equal(await controller.isGlobalConstraintRegistered(etherGC.address,avatar.address),true);
          await globalConstraintRemoveEtherGC.remove();
          assert.equal(await controller.isGlobalConstraintRegistered(etherGC.address,avatar.address),false);
          assert.equal(await controller.isSchemeRegistered(globalConstraintRemoveEtherGC.address,avatar.address),false);
      });
});
