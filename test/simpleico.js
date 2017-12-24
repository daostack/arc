const helpers = require('./helpers');



const DAOToken = artifacts.require("./DAOToken.sol");
const Reputation = artifacts.require("./Reputation.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const Avatar = artifacts.require("./Avatar.sol");
const SimpleICO = artifacts.require("./SimpleICO.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');


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
var genesisScheme;
const setupOrganization = async function (genesisSchemeOwner,founderToken,founderReputation) {
  var org = new helpers.Organization();
  genesisScheme = await GenesisScheme.deployed();
  var tx = await genesisScheme.forgeOrg("testOrg","TEST","TST",[genesisSchemeOwner],[founderToken],[founderReputation]);
  assert.equal(tx.logs.length, 1);
  assert.equal(tx.logs[0].event, "NewOrg");
  var avatarAddress = tx.logs[0].args._avatar;
  org.avatar = await Avatar.at(avatarAddress);
  var tokenAddress = await org.avatar.nativeToken();
  org.token = await DAOToken.at(tokenAddress);
  var reputationAddress = await org.avatar.nativeReputation();
  org.reputation = await Reputation.at(reputationAddress);
  return org;
};

contract('SimpleICO', function(accounts) {

  before(function() {
    helpers.etherForEveryone();
  });

  it("simpleICO constructor", async function() {
    var standardTokenMock = await new StandardTokenMock(accounts[0],100);
    var simpleICO = await SimpleICO.new(standardTokenMock.address,10,accounts[1]);
    var token = await simpleICO.nativeToken();
    assert.equal(token,standardTokenMock.address);
    var fee = await simpleICO.fee();
    assert.equal(fee,10);
    var beneficiary = await simpleICO.beneficiary();
    assert.equal(beneficiary,accounts[1]);
  });

  it("simpleICO send ether to contract - should revert", async function() {
    var standardTokenMock = await new StandardTokenMock(accounts[0],100);
    var simpleICO = await SimpleICO.new(standardTokenMock.address,10,accounts[1]);
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
    var standardTokenMock = await new StandardTokenMock(accounts[0],100);
    var simpleICO = await SimpleICO.new(standardTokenMock.address,10,accounts[1]);
    await simpleICO.setParameters(1000,2,0,0,accounts[1],accounts[1]);
    var paramHash = await simpleICO.getParametersHash(1000,2,0,0,accounts[1],accounts[1]);
    var parameters = await simpleICO.parameters(paramHash);
    assert.equal(parameters[0].toNumber(),1000);
    });

  it("simpleICO registerOrganization - check fee payment ", async function() {
    var beneficiary = accounts[0];
    var balanceOfBeneficiary;
    var fee =10;
    var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
    var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
    var org = await setupOrganization(accounts[0],1000,1000);
    var paramHash= await setupSimpleICOParams(accounts,simpleICO,org);
    await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
    //give some tokens to organization avatar so it could register the univeral scheme.
    await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
    await simpleICO.registerOrganization(org.avatar.address);
    await simpleICO.start(org.avatar.address);
    balanceOfBeneficiary  = await standardTokenMock.balanceOf(beneficiary);
    assert.equal(balanceOfBeneficiary.toNumber(),fee);
    });

    it("simpleICO start with cap zero should revert ", async function() {
      var beneficiary = accounts[0];
      var fee =10;
      var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
      var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
      var org = await setupOrganization(accounts[0],1000,1000);
      var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,0);
      await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
      //give some tokens to organization avatar so it could register the univeral scheme.
      await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
      await simpleICO.registerOrganization(org.avatar.address);
      try {
       await simpleICO.start(org.avatar.address);
       assert(false,"start should  fail - because params has cap zero");
      }catch(ex){
       helpers.assertVMException(ex);
     }
    });

    it("simpleICO isActive ", async function() {
      var beneficiary = accounts[0];
      var fee =10;
      var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
      var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
      //check active for sporadic address
      var isActive = await simpleICO.isActive(accounts[0]);
      assert.equal(isActive,false);
      var org = await setupOrganization(accounts[0],1000,1000);
      var paramHash= await setupSimpleICOParams(accounts,simpleICO,org);
      await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
      isActive = await simpleICO.isActive(org.avatar.address);
      //not registered yet.
      assert.equal(isActive,false);
      //give some tokens to organization avatar so it could register the univeral scheme.
      await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
      await simpleICO.registerOrganization(org.avatar.address);
      isActive = await simpleICO.isActive(org.avatar.address);
      assert.equal(isActive,false);
      await simpleICO.start(org.avatar.address);
      isActive = await simpleICO.isActive(org.avatar.address);
      assert.equal(isActive,true);
      });

      it("simpleICO isActive test start block  ", async function() {
        var beneficiary = accounts[0];
        var fee =10;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,1,web3.eth.blockNumber+100,web3.eth.blockNumber+100+500);
        await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
        //give some tokens to organization avatar so it could register the univeral scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await simpleICO.registerOrganization(org.avatar.address);
        await simpleICO.start(org.avatar.address);
        var isActive = await simpleICO.isActive(org.avatar.address);
        assert.equal(isActive,false);
        });

      it("simpleICO isActive test end block  ", async function() {
        var beneficiary = accounts[0];
        var fee =10;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,1,web3.eth.blockNumber,web3.eth.blockNumber);
        await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
        //give some tokens to organization avatar so it could register the univeral scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await simpleICO.registerOrganization(org.avatar.address);
        await simpleICO.start(org.avatar.address);
        var isActive = await simpleICO.isActive(org.avatar.address);
        assert.equal(isActive,false);
        });

      it("simpleICO isActive test cap  ", async function() {
        var beneficiary = accounts[0];
        var fee =10;
        var cap = 2;
        var price = 1;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,cap,price);
        await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
        //give some tokens to organization avatar so it could register the univeral scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await simpleICO.registerOrganization(org.avatar.address);
        await simpleICO.start(org.avatar.address);
        var donationEther = cap;
        await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
        var isActive = await simpleICO.isActive(org.avatar.address);
        assert.equal(isActive,false);
        });

      it("simpleICO haltICO ", async function() {
        var beneficiary = accounts[0];
        var fee =10;
        var organization;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
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
        await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
        //give some tokens to organization avatar so it could register the univeral scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        organization = await simpleICO.organizations(org.avatar.address);
        assert.equal(organization[3],false);
        await simpleICO.registerOrganization(org.avatar.address);
        await simpleICO.start(org.avatar.address);
        organization = await simpleICO.organizations(org.avatar.address);
        assert.equal(organization[3],false);
        await simpleICO.haltICO(org.avatar.address);
        organization = await simpleICO.organizations(org.avatar.address);
        assert.equal(organization[3],true);
        try{
         await simpleICO.haltICO(org.avatar.address,{from:accounts[1]});
         assert(false,"haltICO should  fail - accounts[1] is not admin");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        });
      it("simpleICO resumeICO ", async function() {
        var beneficiary = accounts[0];
        var fee =10;
        var organization;
        var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
        var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
        var org = await setupOrganization(accounts[0],1000,1000);
        var paramHash= await setupSimpleICOParams(accounts,simpleICO,org);
        await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
        //give some tokens to organization avatar so it could register the univeral scheme.
        await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
        await simpleICO.registerOrganization(org.avatar.address);
        await simpleICO.start(org.avatar.address);
        await simpleICO.haltICO(org.avatar.address);
        organization = await simpleICO.organizations(org.avatar.address);
        assert.equal(organization[3],true);
        await simpleICO.resumeICO(org.avatar.address);
        organization = await simpleICO.organizations(org.avatar.address);
        assert.equal(organization[3],false);
        try{
         await simpleICO.resumeICO(org.avatar.address,{from:accounts[1]});
         assert(false,"resumeICO should  fail - accounts[1] is not admin");
        }catch(ex){
         helpers.assertVMException(ex);
        }
        });
        it("simpleICO donate log", async function() {
          var beneficiary = accounts[0];
          var fee =10;
          var price = 2;
          var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
          var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
          var org = await setupOrganization(accounts[0],1000,1000);
          var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,price);
          await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
          //give some tokens to organization avatar so it could register the univeral scheme.
          await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
          await simpleICO.registerOrganization(org.avatar.address);
          await simpleICO.start(org.avatar.address);
          //do not send ether ..just call donate.
          var tx = await simpleICO.donate(org.avatar.address,accounts[3]);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "DonationReceived");
          var avatar = await helpers.getValueFromLogs(tx, 'organization',1);
          assert.equal(avatar,org.avatar.address);
          var _beneficiary = await helpers.getValueFromLogs(tx, '_beneficiary',1);
          assert.equal(_beneficiary,accounts[3]);
          var _incomingEther = await helpers.getValueFromLogs(tx, '_incomingEther');
          assert.equal(_incomingEther,0);
          var _tokensAmount = await helpers.getValueFromLogs(tx, '_tokensAmount',1);
          assert.equal(_tokensAmount,0);
          var donationEther = 3;

          tx = await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "DonationReceived");
          avatar = await helpers.getValueFromLogs(tx, 'organization',1);
          assert.equal(avatar,org.avatar.address);
          _beneficiary = await helpers.getValueFromLogs(tx, '_beneficiary',1);
          assert.equal(_beneficiary,accounts[3]);
          _incomingEther = await helpers.getValueFromLogs(tx, '_incomingEther');
          assert.equal(_incomingEther,donationEther);
          _tokensAmount = await helpers.getValueFromLogs(tx, '_tokensAmount',1);
          assert.equal(_tokensAmount.toNumber(),price*donationEther);
          });

          it("simpleICO donate check transfer", async function() {
            var beneficiary = accounts[0];
            var fee =10;
            var price = 2;
            var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
            var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
            var org = await setupOrganization(accounts[0],1000,1000);
            var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,price);
            await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
            //give some tokens to organization avatar so it could register the univeral scheme.
            await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
            await simpleICO.registerOrganization(org.avatar.address);
            await simpleICO.start(org.avatar.address);
            var donationEther = 3;
            await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
            var balance = await org.token.balanceOf(accounts[3]);
            assert.equal(balance.toNumber(),price*donationEther);
            });
            it("simpleICO donate check update totalEthRaised", async function() {
              var beneficiary = accounts[0];
              var fee =10;
              var price = 2;
              var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
              var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
              var org = await setupOrganization(accounts[0],1000,1000);
              var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,price);
              await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
              //give some tokens to organization avatar so it could register the univeral scheme.
              await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
              await simpleICO.registerOrganization(org.avatar.address);
              await simpleICO.start(org.avatar.address);
              var donationEther = 3;
              await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
              var organization = await simpleICO.organizations(org.avatar.address);
              assert.equal(organization[2].toNumber(),donationEther);
              });

          it("simpleICO donate check isActive", async function() {
              var beneficiary = accounts[0];
              var fee =10;
              var price = 2;
              var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
              var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
              var org = await setupOrganization(accounts[0],1000,1000);
              var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,price,web3.eth.blockNumber+100,web3.eth.blockNumber+100);
              await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
              //give some tokens to organization avatar so it could register the univeral scheme.
              await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
              await simpleICO.registerOrganization(org.avatar.address);
              await simpleICO.start(org.avatar.address);
              var donationEther = 3;
              try{
              await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
              assert(false,"donate should  fail - ico not started yet");
              }catch(ex){
                helpers.assertVMException(ex);
              }
            });
            it("simpleICO donate check isHalted", async function() {
                var beneficiary = accounts[0];
                var fee =10;
                var price = 2;
                var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
                var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
                var org = await setupOrganization(accounts[0],1000,1000);
                var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,1000,price);
                await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
                //give some tokens to organization avatar so it could register the univeral scheme.
                await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
                await simpleICO.registerOrganization(org.avatar.address);
                await simpleICO.start(org.avatar.address);
                await simpleICO.haltICO(org.avatar.address);
                var donationEther = 3;
                try{
                await simpleICO.donate(org.avatar.address,accounts[3],{value:donationEther});
                assert(false,"donate should  fail - halted !");
                }catch(ex){
                  helpers.assertVMException(ex);
                }
              });
              it("simpleICO donate check change back", async function() {
                  var beneficiary = accounts[0];
                  var fee =10;
                  var price = 2;
                  var cap = 3;
                  var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
                  var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
                  var org = await setupOrganization(accounts[0],1000,1000);
                  var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,cap,price);
                  await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
                  //give some tokens to organization avatar so it could register the univeral scheme.
                  await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
                  await simpleICO.registerOrganization(org.avatar.address);
                  await simpleICO.start(org.avatar.address);
                  var donationEther = cap+10;
                  let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
                  var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                  assert.equal(beneficiaryBalance,0);
                  await simpleICO.donate(org.avatar.address,otherAvatar.address,{value:donationEther});
                  var balance = await org.token.balanceOf(otherAvatar.address);
                  assert.equal(balance.toNumber(),price*cap);
                  beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                  assert.equal(beneficiaryBalance,10);
                });

          it("simpleICO MirrorContractICO", async function() {
              var beneficiary = accounts[0];
              var fee =10;
              var price = 2;
              var cap = 3;
              var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
              var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
              var org = await setupOrganization(accounts[0],1000,1000);
              var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,cap,price);
              await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
              //give some tokens to organization avatar so it could register the univeral scheme.
              await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
              await simpleICO.registerOrganization(org.avatar.address);
              await simpleICO.start(org.avatar.address);
              let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
              var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
              assert.equal(beneficiaryBalance,0);
              var organization = await simpleICO.organizations(org.avatar.address);
              var mirrorContractICO = organization[1];
              //need more gas for this ...
              await web3.eth.sendTransaction({from:accounts[3],to:mirrorContractICO, value:2,gas: 900000 });
              //await simpleICO.donate(org.avatar.address,otherAvatar.address,{value:13});
              var balance = await org.token.balanceOf(accounts[3]);
              assert.equal(balance.toNumber(),price*2);

            });

            it("simpleICO MirrorContractICO without start should fail", async function() {
                var beneficiary = accounts[0];
                var fee =10;
                var price = 2;
                var cap = 3;
                var standardTokenMock = await StandardTokenMock.new(accounts[1],100);
                var simpleICO = await SimpleICO.new(standardTokenMock.address,fee,beneficiary);
                var org = await setupOrganization(accounts[0],1000,1000);
                var paramHash= await setupSimpleICOParams(accounts,simpleICO,org,cap,price);
                await genesisScheme.setSchemes(org.avatar.address,[simpleICO.address],[paramHash],[standardTokenMock.address],[100],["0x0000000F"]);
                //give some tokens to organization avatar so it could register the univeral scheme.
                await standardTokenMock.transfer(org.avatar.address,30,{from:accounts[1]});
                await simpleICO.registerOrganization(org.avatar.address);
                let otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
                var beneficiaryBalance = web3.eth.getBalance(otherAvatar.address);
                assert.equal(beneficiaryBalance,0);
                var organization = await simpleICO.organizations(org.avatar.address);
                var mirrorContractICO = organization[1];
                //need more gas for this ...
                await web3.eth.sendTransaction({from:accounts[3],to:mirrorContractICO, value:2,gas: 900000 });
                //await simpleICO.donate(org.avatar.address,otherAvatar.address,{value:13});
                var balance = await org.token.balanceOf(accounts[3]);
                assert.equal(balance.toNumber(),0);

              });

});
