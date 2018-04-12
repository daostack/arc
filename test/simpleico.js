const helpers = require('./helpers');
const constants = require('./constants');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const Avatar = artifacts.require("./Avatar.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const ControllerCreator = artifacts.require("./ControllerCreator.sol");



const setupSimpleICOParams = async function(accounts,
                                            simpleICO,
                                            org,
                                            cap=10000,
                                            price=1,
                                            startBlock=web3.eth.blockNumber,
                                            endBlock=web3.eth.blockNumber+500) {
  // Register ICO parameters
  let beneficiary = org.avatar.address;
  let admin = accounts[0];
  await simpleICO.setParameters(cap, price, startBlock, endBlock, beneficiary, admin);
  const paramsHash = await simpleICO.getParametersHash(cap, price, startBlock, endBlock, beneficiary, admin);
  return paramsHash;
};
var daoCreator;
const setupOrganization = async function (daoCreatorOwner,founderToken,founderReputation) {
  var controllerCreator = await ControllerCreator.new();
  daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.GENESIS_SCHEME_GAS_LIMIT});
  var org = await helpers.setupOrganization(daoCreator,daoCreatorOwner,founderToken,founderReputation);
  return org;
};

const setup = async function (accounts,cap =10000,price=1) {
  var testSetup = new helpers.TestSetup();
  testSetup.beneficiary = accounts[0];
  testSetup.fee =10;
  testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
  testSetup.simpleICO = await SimpleICO.new();
  testSetup.org = await setupOrganization(accounts[0],1000,1000);
  testSetup.paramHash= await setupSimpleICOParams(accounts,testSetup.simpleICO,testSetup.org,cap,price);
  await daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.simpleICO.address],[testSetup.paramHash],["0x00000000"]);
  return testSetup;
};

contract('SimpleICO', function(accounts) {

  before(function() {
    helpers.etherForEveryone();
  });

  it("simpleICO send ether to contract - should revert", async function() {
    var simpleICO = await SimpleICO.new();
    var account1BalanceBefore = web3.eth.getBalance(accounts[1])/web3.toWei('1', "ether");
    try{
    await web3.eth.sendTransaction({from:accounts[1],to:simpleICO.address, value: web3.toWei('1', "ether")});
    assert(false,"should fail - contract simpleICO should not receive ethers and should revert in this case");
   }
   catch(ex){
     helpers.assertVMException(ex);
   }
   var account1BalanceAfter = web3.eth.getBalance(accounts[1])/web3.toWei('1', "ether");
   assert.equal(Math.round(account1BalanceAfter),Math.round(account1BalanceBefore));
  });

  it("simpleICO setParameters", async function() {
    var simpleICO = await SimpleICO.new();
    await simpleICO.setParameters(1000,2,0,0,accounts[1],accounts[1]);
    var paramHash = await simpleICO.getParametersHash(1000,2,0,0,accounts[1],accounts[1]);
    var parameters = await simpleICO.parameters(paramHash);
    assert.equal(parameters[0].toNumber(),1000);
  });

  it("simpleICO setParameters with cap zero should revert", async function() {
    var simpleICO = await SimpleICO.new();

    try {
     await simpleICO.setParameters(0,2,0,0,accounts[1],accounts[1]);
     assert(false,"setParameters with cap zero should revert");
    }catch(ex){
     helpers.assertVMException(ex);
    }

  });

    it("simpleICO isActive ", async function() {
      var testSetup = await setup(accounts);
      assert.equal(await testSetup.simpleICO.isActive(testSetup.org.avatar.address),false);
      await testSetup.simpleICO.start(testSetup.org.avatar.address);
      assert.equal(await testSetup.simpleICO.isActive(testSetup.org.avatar.address),true);
      });

      it("simpleICO isActive test start block  ", async function() {
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new();
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,1,web3.eth.blockNumber+100,web3.eth.blockNumber+100+500);
        //give some tokens to organization avatar so it could register the universal scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await daoCreator.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],["0x8000000F"]);
        await simpleICO.start(org.avatar.address);
        assert.equal(await simpleICO.isActive(org.avatar.address),false);
        });

      it("simpleICO isActive test end block  ", async function() {
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new();
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,1,web3.eth.blockNumber,web3.eth.blockNumber);
        //give some tokens to organization avatar so it could register the universal scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await daoCreator.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],["0x8000000F"]);
        await simpleICO.start(org.avatar.address);
        var isActive = await simpleICO.isActive(org.avatar.address);
        assert.equal(isActive,false);
        });

      it("simpleICO isActive test cap  ", async function() {
        var cap = 2;
        var price = 1;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new();
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,cap,price);
        //give some tokens to organization avatar so it could register the universal scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await daoCreator.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],["0x8000000F"]);
        await simpleICO.start(org.avatar.address);
        var donationEther = cap;
        await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
        var isActive = await simpleICO.isActive(org.avatar.address);
        assert.equal(isActive,false);
        });

      it("simpleICO haltICO ", async function() {
        var organization;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new();
        try {
         await simpleICO.haltICO(accounts[0]);
         assert(false,"haltICO should  fail - accounts[0] is not avatar and not registered yet");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        var org = await setupOrganization(accounts[0],1000,1000);
        try {
         await simpleICO.haltICO(org.avatar.address);
         assert(false,"haltICO should  fail - org is not registered yet");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org);
        //give some tokens to organization avatar so it could register the universal scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await daoCreator.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],["0x8000000F"]);
        organization = await simpleICO.organizationsICOInfo(org.avatar.address);
        assert.equal(organization[3],false);
        await simpleICO.start(org.avatar.address);
        organization = await simpleICO.organizationsICOInfo(org.avatar.address);
        assert.equal(organization[3],false);
        await simpleICO.haltICO(org.avatar.address);
        organization = await simpleICO.organizationsICOInfo(org.avatar.address);
        assert.equal(organization[3],true);
        try{
         await simpleICO.haltICO(org.avatar.address,{from:accounts[1]});
         assert(false,"haltICO should  fail - accounts[1] is not admin");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        });
      it("simpleICO resumeICO ", async function() {
        var testSetup = await setup(accounts);
        await testSetup.simpleICO.start(testSetup.org.avatar.address);
        await testSetup.simpleICO.haltICO(testSetup.org.avatar.address);
        var organization = await testSetup.simpleICO.organizationsICOInfo(testSetup.org.avatar.address);
        assert.equal(organization[3],true);
        await testSetup.simpleICO.resumeICO(testSetup.org.avatar.address);
        organization = await testSetup.simpleICO.organizationsICOInfo(testSetup.org.avatar.address);
        assert.equal(organization[3],false);
        try{
         await testSetup.simpleICO.resumeICO(testSetup.org.avatar.address,{from:accounts[1]});
         assert(false,"resumeICO should  fail - accounts[1] is not admin");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        });
        it("simpleICO donate log", async function() {
          var price = 2;
          var testSetup = await setup(accounts,1000,price);
          await testSetup.simpleICO.start(testSetup.org.avatar.address);
          //do not send ether ..just call donate.
          var tx = await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3]);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "DonationReceived");
          var avatar = await helpers.getValueFromLogs(tx, 'organization',1);
          assert.equal(avatar,testSetup.org.avatar.address);
          var _beneficiary = await helpers.getValueFromLogs(tx, '_beneficiary',1);
          assert.equal(_beneficiary,accounts[3]);
          var _incomingEther = await helpers.getValueFromLogs(tx, '_incomingEther');
          assert.equal(_incomingEther,0);
          var _tokensAmount = await helpers.getValueFromLogs(tx, '_tokensAmount',1);
          assert.equal(_tokensAmount,0);
          var donationEther = 3;

          tx = await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3],{value:donationEther});
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "DonationReceived");
          avatar = await helpers.getValueFromLogs(tx, 'organization',1);
          assert.equal(avatar,testSetup.org.avatar.address);
          _beneficiary = await helpers.getValueFromLogs(tx, '_beneficiary',1);
          assert.equal(_beneficiary,accounts[3]);
          _incomingEther = await helpers.getValueFromLogs(tx, '_incomingEther');
          assert.equal(_incomingEther,donationEther);
          _tokensAmount = await helpers.getValueFromLogs(tx, '_tokensAmount',1);
          assert.equal(_tokensAmount.toNumber(),price*donationEther);
          });

          it("simpleICO donate check transfer", async function() {
            var price = 2;
            var testSetup = await setup(accounts,1000,price);
            await testSetup.simpleICO.start(testSetup.org.avatar.address);
            var donationEther = 3;
            await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3],{value:donationEther});
            var balance = await testSetup.org.token.balanceOf(accounts[3]);
            assert.equal(balance.toNumber(),price*donationEther);
            });
            it("simpleICO donate check update totalEthRaised", async function() {
              var price = 2;
              var testSetup = await setup(accounts,1000,price);
              await testSetup.simpleICO.start(testSetup.org.avatar.address);
              var donationEther = 3;
              await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3],{value:donationEther});
              var organization = await testSetup.simpleICO.organizationsICOInfo(testSetup.org.avatar.address);
              assert.equal(organization[2].toNumber(),donationEther);
              });

          it("simpleICO donate check isActive", async function() {
              var price = 2;
              var testSetup = await setup(accounts,1000,price);
              var donationEther = 3;
              try{
              await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3],{value:donationEther});
              assert(false,"donate should  fail - ico not started yet");
              }catch(ex){
                helpers.assertVMException(ex);
              }
            });
            it("simpleICO donate check isHalted", async function() {
                var price = 2;
                var testSetup = await setup(accounts,1000,price);
                await testSetup.simpleICO.start(testSetup.org.avatar.address);
                await testSetup.simpleICO.haltICO(testSetup.org.avatar.address);
                var donationEther = 3;
                try{
                await testSetup.simpleICO.donate(testSetup.org.avatar.address,accounts[3],{value:donationEther});
                assert(false,"donate should  fail - halted !");
                }catch(ex){
                  helpers.assertVMException(ex);
                }
              });
              it("simpleICO donate check change back", async function() {

                  var price = 2;
                  var cap = 3;
                  var testSetup = await setup(accounts,cap,price);
                  await testSetup.simpleICO.start(testSetup.org.avatar.address);
                  var donationEther = cap+10;
                  let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
                  var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                  assert.equal(beneficiaryBalance,0);
                  await testSetup.simpleICO.donate(testSetup.org.avatar.address,otherAvatar.address,{value:donationEther});
                  var balance = await testSetup.org.token.balanceOf(otherAvatar.address);
                  assert.equal(balance.toNumber(),price*cap);
                  beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                  assert.equal(beneficiaryBalance,10);
                });

          it("simpleICO MirrorContractICO", async function() {
              var price = 2;
              var cap = 3;
              var testSetup = await setup(accounts,cap,price);
              await testSetup.simpleICO.start(testSetup.org.avatar.address);
              let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
              var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
              assert.equal(beneficiaryBalance,0);
              var organization = await testSetup.simpleICO.organizationsICOInfo(testSetup.org.avatar.address);
              var mirrorContractICO = organization[1];
              //need more gas for this ...
              await web3.eth.sendTransaction({from:accounts[3],to:mirrorContractICO, value:2,gas: 900000 });
              //await simpleICO.donate(org.avatar.address,otherAvatar.address,{value:13});
              var balance = await testSetup.org.token.balanceOf(accounts[3]);
              assert.equal(balance.toNumber(),price*2);

            });

            it("simpleICO MirrorContractICO without start should fail", async function() {

                var price = 2;
                var cap = 3;
                var testSetup = await setup(accounts,cap,price);
                let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
                var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                assert.equal(beneficiaryBalance,0);
                var organization = await testSetup.simpleICO.organizationsICOInfo(testSetup.org.avatar.address);
                var mirrorContractICO = organization[1];
                //need more gas for this ...
                await web3.eth.sendTransaction({from:accounts[3],to:mirrorContractICO, value:2,gas: 900000 });
                //await simpleICO.donate(org.avatar.address,otherAvatar.address,{value:13});
                var balance = await testSetup.org.token.balanceOf(accounts[3]);
                assert.equal(balance.toNumber(),0);

              });

});
