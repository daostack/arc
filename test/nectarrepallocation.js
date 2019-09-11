const helpers = require('./helpers');
const NectarToken = artifacts.require('./Reputation.sol');
var NectarRepAllocation = artifacts.require("./NectarRepAllocation.sol");


const setup = async function (accounts,
                             _initialize = true,
                             _reputationReward = 100000,
                             _claimingStartTime = 0,
                             _claimingEndTime = (30*60*60*24)
                           ) {
   var testSetup = new helpers.TestSetup();
   testSetup.nectarToken = await NectarToken.new();
   await testSetup.nectarToken.mint(accounts[0],100);
   await testSetup.nectarToken.mint(accounts[1],200);
   testSetup.blockReference =  await web3.eth.getBlockNumber();

   await testSetup.nectarToken.mint(accounts[2],300);

   testSetup.claimingStartTime = (await web3.eth.getBlock("latest")).timestamp + _claimingStartTime;
   testSetup.claimingEndTime = (await web3.eth.getBlock("latest")).timestamp + _claimingEndTime;

   testSetup.nectarRepAllocation = await NectarRepAllocation.new();

   testSetup.reputationReward = _reputationReward;
   if (_initialize === true ) {
     await testSetup.nectarRepAllocation.initialize(
                                                     testSetup.reputationReward,
                                                     testSetup.claimingStartTime,
                                                     testSetup.claimingEndTime,
                                                     testSetup.blockReference,
                                                     testSetup.nectarToken.address);
   }

   return testSetup;
};

contract('NectarRepAllocation', accounts => {
    it("initialize", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.nectarRepAllocation.claimingStartTime(),testSetup.claimingStartTime);
      assert.equal(await testSetup.nectarRepAllocation.claimingEndTime(),testSetup.claimingEndTime);
      assert.equal(await testSetup.nectarRepAllocation.blockReference(),testSetup.blockReference);
      assert.equal(await testSetup.nectarRepAllocation.token(),testSetup.nectarToken.address);
    });

    it("balanceOf", async () => {
      let testSetup = await setup(accounts);
      assert.equal(await testSetup.nectarRepAllocation.balanceOf(accounts[0]),Math.floor((100*testSetup.reputationReward)/300));
      assert.equal(await testSetup.nectarRepAllocation.balanceOf(accounts[1]),Math.floor((200*testSetup.reputationReward)/300));
      assert.equal(await testSetup.nectarRepAllocation.balanceOf(accounts[2]),0);

    });

    it("cannot initialize twice", async () => {
        let testSetup = await setup(accounts);
        try {
             await testSetup.nectarRepAllocation.initialize(
                                                             testSetup.reputationReward,
                                                             testSetup.claimingStartTime,
                                                             testSetup.claimingEndTime,
                                                             testSetup.blockReference,
                                                             testSetup.nectarToken.address);
            assert(false, "cannot initialize twice");

           } catch(error) {
             helpers.assertVMException(error);
           }
    });

    it("claim after end return 0", async () => {
        let testSetup = await setup(accounts);
        await helpers.increaseTime((30*60*60*24)+1);
        assert.equal(await testSetup.nectarRepAllocation.balanceOf(accounts[0]),0);
    });


});
