const helpers = require("./helpers");
const constants = require('./constants');
const RageQuitWithToken = artifacts.require("./RageQuitWithToken.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");


const setup = async function (accounts) {
  var testSetup = new helpers.TestSetup();
  testSetup.rageQuitToken = await ERC20Mock.new(accounts[0],100000);

  var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
  var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
  testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});

  testSetup.reputationArray = [0,0,0];
  testSetup.tokenArray = [100,200,300];
  testSetup.founderAccounts  = [accounts[1],accounts[2],accounts[3]];

  testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,
                                                            testSetup.founderAccounts,
                                                            testSetup.tokenArray,
                                                            testSetup.reputationArray);

  testSetup.rageQuitWithToken = await RageQuitWithToken.new();

  await testSetup.rageQuitWithToken.initialize(
    testSetup.org.avatar.address,
    testSetup.rageQuitToken.address
     );

  var permissions = "0x00000000";
  await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                       [testSetup.rageQuitWithToken.address],
                                       [helpers.NULL_HASH],[permissions],"metaData");

  return testSetup;
};
contract('RageQuitWithToken', accounts => {

    it("initialize", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.rageQuitWithToken.rageQuitToken(),testSetup.rageQuitToken.address);
       assert.equal(await testSetup.rageQuitWithToken.avatar(),testSetup.org.avatar.address);
    });

    it("rageQuit", async function() {
       var testSetup = await setup(accounts);
       //send the dao some rageQuitTokens
       await testSetup.rageQuitToken.transfer(testSetup.org.avatar.address,1000);
       assert.equal(await testSetup.rageQuitToken.balanceOf(testSetup.org.avatar.address),1000);
       //accounts 1 ragequit with all is tokens (100)
       assert.equal((await testSetup.org.token.balanceOf(accounts[1])).toNumber(),100);
       //give approval for burn
       await testSetup.org.token.approve(testSetup.rageQuitWithToken.address,100,{from:accounts[1]});
       var tx = await testSetup.rageQuitWithToken.rageQuit(100,{from:accounts[1]});
       assert.equal(tx.logs.length, 1);
       var expectedRefund =  Math.floor((100/(100+200+300)) * 1000);
       assert.equal(tx.logs[0].event, "RageQuit");
       assert.equal(tx.logs[0].args._rageQuitter, accounts[1]);
       assert.equal(tx.logs[0].args._refund.toNumber(),expectedRefund);
       assert.equal(await testSetup.rageQuitToken.balanceOf(testSetup.org.avatar.address),1000-expectedRefund);
       assert.equal(await testSetup.rageQuitToken.balanceOf(accounts[1]),expectedRefund);
       try {
         await testSetup.org.token.approve(testSetup.rageQuitWithToken.address,100,{from:accounts[1]});
         await testSetup.rageQuitWithToken.rageQuit(100,{from:accounts[1]});
         assert(false, "cannot rageQuit twice");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });
});
