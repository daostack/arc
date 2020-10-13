const helpers = require('./helpers');
const DaoCreator = artifacts.require('./DaoCreator.sol');
const ControllerCreator = artifacts.require('./ControllerCreator.sol');
const DAOTracker = artifacts.require('./DAOTracker.sol');

const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const Wallet = artifacts.require("./Wallet.sol");
const TransitionScheme = artifacts.require('./TransitionScheme.sol');

let selector = web3.eth.abi.encodeFunctionSignature('transferOwnership(address)');

const setup = async function(
  accounts,
  testInitDifferentArrayLength=false,
  testLimit=false,
  testOverLimit=false,
) {
  var testSetup = new helpers.TestSetup();
  var controllerCreator = await ControllerCreator.new();
  var daoTracker = await DAOTracker.new();
  testSetup.daoCreator = await DaoCreator.new(
    controllerCreator.address,
    daoTracker.address

  );

  testSetup.org = await helpers.setupOrganization(
    testSetup.daoCreator,
    accounts[0],
    1000,
    1000
  );

  testSetup.wallet = await Wallet.new();
  await testSetup.wallet.transferOwnership(testSetup.org.avatar.address);
  testSetup.assets = [testSetup.wallet.address];

  testSetup.standardToken = await ERC20Mock.new(testSetup.org.avatar.address, 100);

  testSetup.transitionScheme = await TransitionScheme.new();
  testSetup.selectors = [selector];
  if (testInitDifferentArrayLength) {
    testSetup.selectors = [selector, selector];
  }

  if (testLimit) {
    for (let i=0; i < (testOverLimit ? 100 : 99); i++) {
      let wallet = await Wallet.new();
      await wallet.transferOwnership(testSetup.org.avatar.address);
      testSetup.assets.push(wallet.address);
      testSetup.selectors.push(selector);
    }
  }

  await testSetup.transitionScheme.initialize(
    testSetup.org.avatar.address,
    helpers.SOME_ADDRESS,
    [testSetup.standardToken.address],
    testSetup.assets,
    testSetup.selectors,

  );

  var permissions = '0x00000010';
  await testSetup.daoCreator.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.transitionScheme.address],
    [web3.utils.asciiToHex('0')],
    [permissions],
    'metaData'
  );

  return testSetup;
};

contract('TransitionScheme', accounts => {
  it('initialize', async () => {
    let testSetup = await setup(accounts);

    assert.equal(
      await testSetup.transitionScheme.avatar(),
      testSetup.org.avatar.address
    );
    assert.equal(
      await testSetup.transitionScheme.newAvatar(),
      helpers.SOME_ADDRESS
    );
    assert.equal(
      await testSetup.transitionScheme.externalTokens(0),
      testSetup.standardToken.address
    );
    assert.equal(
      await testSetup.transitionScheme.assetAddresses(0),
      testSetup.wallet.address
    );
    assert.equal(await testSetup.transitionScheme.selectors(0), selector);
  });

  it('initialize assets and selector arrays must be same length', async () => {
    try {
      await setup(accounts, true);
      assert(false, 'assets and selector arrays must be same length');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('initialize with more than 100 assets should fail', async () => {
    try {
      await setup(accounts, false, true, true);
      assert(false, 'initialize with more than 100 assets should fail');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('transfer assets', async () => {
    let testSetup = await setup(accounts);
    assert.equal(await testSetup.wallet.owner(), testSetup.org.avatar.address);
    let tx = await testSetup.transitionScheme.transferAssets();
    await testSetup.transitionScheme.getPastEvents('OwnershipTransferred', {
        fromBlock: tx.blockNumber,
        toBlock: 'latest'
    })
    .then(function(events){
        assert.equal(events[0].event,"OwnershipTransferred");
        assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
        assert.equal(events[0].args._newAvatar, helpers.SOME_ADDRESS);
        assert.equal(events[0].args._asset, testSetup.wallet.address);
    });
    assert.equal(await testSetup.wallet.owner(), helpers.SOME_ADDRESS);
  });

  it('transfer many assets', async () => {
    let testSetup = await setup(accounts, false, true);
    assert.equal(await testSetup.wallet.owner(), testSetup.org.avatar.address);
    let tx = await testSetup.transitionScheme.transferAssets();
    await testSetup.transitionScheme.getPastEvents('OwnershipTransferred', {
        fromBlock: tx.blockNumber,
        toBlock: 'latest'
    })
    .then(function(events){
        assert.equal(events.length, 100);
        assert.equal(events[0].event,"OwnershipTransferred");
        assert.equal(events[0].args._avatar, testSetup.org.avatar.address);
        assert.equal(events[0].args._newAvatar, helpers.SOME_ADDRESS);
        assert.equal(events[0].args._asset, testSetup.wallet.address);
    });
    assert.equal(await testSetup.wallet.owner(), helpers.SOME_ADDRESS);
  });

  it('transfer avatar ether', async () => {
    let testSetup = await setup(accounts);
    await web3.eth.sendTransaction({from:accounts[0],to: testSetup.org.avatar.address, value: web3.utils.toWei('1', 'ether')});
    assert.equal(await web3.eth.getBalance(testSetup.org.avatar.address),web3.utils.toWei('1', "ether"));
    assert.equal(await web3.eth.getBalance(helpers.SOME_ADDRESS), 0);
    await testSetup.transitionScheme.sendEther(web3.utils.toWei('1', 'ether'));
    assert.equal(await web3.eth.getBalance(testSetup.org.avatar.address), 0);
    assert.equal(await web3.eth.getBalance(helpers.SOME_ADDRESS),web3.utils.toWei('1', "ether"));

    await web3.eth.sendTransaction({from:accounts[0],to: testSetup.org.avatar.address, value: web3.utils.toWei('1', 'ether')});
    assert.equal(await web3.eth.getBalance(testSetup.org.avatar.address),web3.utils.toWei('1', "ether"));
    assert.equal(await web3.eth.getBalance(helpers.SOME_ADDRESS),web3.utils.toWei('1', "ether"));
    await testSetup.transitionScheme.sendEther(web3.utils.toWei('1', 'ether'));
    assert.equal(await web3.eth.getBalance(testSetup.org.avatar.address), 0);
    assert.equal(await web3.eth.getBalance(helpers.SOME_ADDRESS),web3.utils.toWei('2', "ether"));
  });

  it('transfer avatar external tokens', async () => {
    let testSetup = await setup(accounts);
    assert.equal(await testSetup.standardToken.balanceOf(testSetup.org.avatar.address), 100);
    assert.equal(await testSetup.standardToken.balanceOf(helpers.SOME_ADDRESS), 0);
    await testSetup.transitionScheme.sendExternalToken([100]);
    assert.equal(await testSetup.standardToken.balanceOf(testSetup.org.avatar.address), 0);
    assert.equal(await testSetup.standardToken.balanceOf(helpers.SOME_ADDRESS), 100);
  });

  it('external tokens and amounts arrays must be same length', async () => {
    let testSetup = await setup(accounts);
    assert.equal(await testSetup.standardToken.balanceOf(testSetup.org.avatar.address), 100);
    assert.equal(await testSetup.standardToken.balanceOf(helpers.SOME_ADDRESS), 0);
    try {
      await testSetup.transitionScheme.sendExternalToken([100, 10]);
      assert(false, 'external tokens and amounts arrays must be same length');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it('cannot initialize twice', async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.transitionScheme.initialize(
        testSetup.org.avatar.address,
        helpers.SOME_ADDRESS,
        [testSetup.standardToken.address],
        [testSetup.wallet.address],
        testSetup.selectors,

      );
      assert(false, 'cannot initialize twice');
    } catch (error) {
      helpers.assertVMException(error);
    }
  });
});
