const helpers = require('./helpers');
const constants = require('./constants');
var ReputationAdmin = artifacts.require('./ReputationAdmin.sol');

class ReputationAdminParams {
    constructor() {
    }
}

const setup = async function(
  accounts,
  _activationStartTime = 0,
  _activationEndTime = 3000,
  _maxRepReward = 100,
  _initialize = true
) {
    var testSetup = new helpers.TestSetup();
    testSetup.proxyAdmin = accounts[5];
    var registration = await helpers.registerImplementation();
    testSetup.reputationAdminParams = new ReputationAdminParams();
    testSetup.activationStartTime = (await web3.eth.getBlock('latest')).timestamp + _activationStartTime;
    testSetup.activationEndTime = (await web3.eth.getBlock('latest')).timestamp + _activationEndTime;
    testSetup.maxRepReward = _maxRepReward;
 
    if (_initialize === true) {
     testSetup.reputationAdminParams.initdata = await new web3.eth.Contract(registration.reputationAdmin.abi)
     .methods
     .initialize(helpers.NULL_ADDRESS,
                testSetup.activationStartTime,
                testSetup.activationEndTime,
                testSetup.maxRepReward,
                accounts[0])
                 .encodeABI();
      } else {
        testSetup.reputationAdminParams.initdata = Buffer.from('');
      }
 
   var permissions = "0x00000000";
    [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(
      testSetup.proxyAdmin,
      accounts,
      registration,
      [accounts[0]],
      [0],
      [0],
      0,
      [web3.utils.fromAscii("ReputationAdmin")],
      testSetup.reputationAdminParams.initdata,
      [helpers.getBytesLength(testSetup.reputationAdminParams.initdata)],
      [permissions],
      "metaData"
   );
   testSetup.reputationAdmin = await ReputationAdmin.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
   return testSetup;
 };

contract('reputationAdmin', accounts => {
  it('initialize', async () => {
    let testSetup = await setup(accounts);

    assert.equal(
      await testSetup.reputationAdmin.repRewardLeft(),
      testSetup.maxRepReward
    );
    assert.equal(
      await testSetup.reputationAdmin.activationStartTime(),
      testSetup.activationStartTime
    );
    assert.equal(
      await testSetup.reputationAdmin.activationEndTime(),
      testSetup.activationEndTime
    );
    assert.equal(await testSetup.reputationAdmin.owner(), accounts[0]);
  });

  it('initialize _activationStartTime >= activationEndTime is not allowed', async () => {
    let testSetup = await setup(accounts);
    let reputationAdmin = await ReputationAdmin.new();
    try {
      await reputationAdmin.initialize(
        testSetup.org.avatar.address,
        testSetup.activationStartTime,
        testSetup.activationStartTime - 1,
        testSetup.maxRepReward,
        accounts[0],
        { gas: constants.ARC_GAS_LIMIT }
      );
      assert(false, '_redeemEnableTime < auctionsEndTime is not allowed');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint reputation', async () => {
    let testSetup = await setup(accounts);
    await testSetup.reputationAdmin.reputationMint([accounts[2]],[1]);

    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 1);
  });

  it('burn reputation', async () => {
    let testSetup = await setup(accounts);
    await testSetup.reputationAdmin.reputationMint([accounts[2]],[1]);

    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 1);
    await testSetup.reputationAdmin.reputationBurn([accounts[2]],[1]);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 0);

  });

  it('burn only  if minted reputation', async () => {
    let testSetup = await setup(accounts);
    try {
        await testSetup.reputationAdmin.reputationBurn([accounts[2]],[1]);
      assert(false, 'burn only  if minted reputation');
    } catch (error) {
      helpers.assertVMException(error);
    }

  });

  it('mint reputation by unauthorized account should fail', async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2]], [1], {
        from: accounts[1]
      });
      assert(false, 'mint reputation by unauthorized account should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint without initialize should fail', async () => {
    let testSetup = await setup(accounts, 0, 3000, 100, false);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2]], [1]);
      assert(false, 'mint without initialize should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint before _activationStartTime should fail', async () => {
    let testSetup = await setup(accounts, 2000, 3000, 100, true);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2]],[1]);
      assert(false, 'mint before _activationStartTime should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint after _activationEndTime should revert', async () => {
    let testSetup = await setup(accounts);
    await helpers.increaseTime(3001);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2]], [1]);
      assert(false, 'mint after _activationEndTime should revert');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint more than _maxRepReward should fail', async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2]], [101]);
      assert(false, 'mint more than _maxRepReward should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint with un-matching array lengths should fail', async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.reputationAdmin.reputationMint([accounts[2], accounts[3]], [1]);
      assert(false, 'mint with un-matching array lengths should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('burn with un-matching array lengths should fail', async () => {
    let testSetup = await setup(accounts);
    await testSetup.reputationAdmin.reputationMint([accounts[2], accounts[3]], [1, 1]);

    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 1);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]), 1);
    try {
        await testSetup.reputationAdmin.reputationBurn([accounts[2], accounts[3]], [1]);
        assert(false, 'burn with un-matching array lengths should fail');
    } catch (error) {
        helpers.assertVMException(error);
    }
  });

  it('burn before _activationStartTime should fail', async () => {
    let testSetup = await setup(accounts, 2000, 3000, 100, true);
    try {
      await testSetup.reputationAdmin.reputationBurn([accounts[2]],[1]);
      assert(false, 'burn before _activationStartTime should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('burn after _activationEndTime should revert', async () => {
    let testSetup = await setup(accounts);
    await testSetup.reputationAdmin.reputationMint([accounts[2]], [1]);
    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 1);
    await helpers.increaseTime(3001);
    try {
      await testSetup.reputationAdmin.reputationBurn([accounts[2]], [1]);
      assert(false, 'burn after _activationEndTime should revert');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('mint and burn reputation with 0 _maxRepReward should allow any amount', async () => {
    let testSetup = await setup(accounts, 0, 3000, 0, true);
    await testSetup.reputationAdmin.reputationMint([accounts[2]], [1000]);

    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 1000);
    await testSetup.reputationAdmin.reputationBurn([accounts[2]], [1000]);

    assert.equal(await testSetup.org.reputation.balanceOf(accounts[2]), 0);
  });

  it('cannot initialize twice', async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.reputationAdmin.initialize(
        testSetup.org.avatar.address,
        testSetup.activationStartTime,
        testSetup.activationEndTime,
        testSetup.maxRepReward,
        accounts[0],
        { gas: constants.ARC_GAS_LIMIT }
      );
      assert(false, 'cannot initialize twice');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });
});
