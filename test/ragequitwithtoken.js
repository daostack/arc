const helpers = require("./helpers");
const RageQuitWithToken = artifacts.require("./RageQuitWithToken.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');

class RageQuitWithTokenParams {
  constructor() {
  }
}

const setupRageQuitWithToken = async function(
                                            accounts,
                                            tokenAddress,
                                            avatarAddress,
                                            ) {
  var rageQuitWithTokenParams = new RageQuitWithTokenParams();
  rageQuitWithTokenParams.initdata = await new web3.eth.Contract(registration.rageQuitWithToken.abi)
                        .methods
                        .initialize(avatarAddress,tokenAddress)
                        .encodeABI();
  return rageQuitWithTokenParams;
};
var registration;
const setup = async function (accounts) {
  var testSetup = new helpers.TestSetup();
  testSetup.rageQuitToken = await ERC20Mock.new(accounts[0],100000);
  registration = await helpers.registerImplementation();

  testSetup.proxyAdmin = accounts[0];
  testSetup.reputationArray = [0,0,0];
  testSetup.tokenArray = [100,200,300];
  testSetup.founderAccounts  = [accounts[1],accounts[2],accounts[3]];

  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      testSetup.founderAccounts,
                                                                      testSetup.tokenArray,
                                                                      testSetup.reputationArray);


  testSetup.rageQuitWithTokenParams= await setupRageQuitWithToken(
                     accounts,
                     testSetup.rageQuitToken.address,
                     testSetup.org.avatar.address);

  var permissions = "0x00000000";
  var tx = await registration.daoFactory.setSchemes(
                          testSetup.org.avatar.address,
                          [web3.utils.fromAscii("RageQuitWithToken")],
                          testSetup.rageQuitWithTokenParams.initdata,
                          [helpers.getBytesLength(testSetup.rageQuitWithTokenParams.initdata)],
                          [permissions],
                          "metaData",{from:testSetup.proxyAdmin});
  testSetup.rageQuitWithToken = await RageQuitWithToken.at(tx.logs[1].args._scheme);

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
