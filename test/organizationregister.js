import * as helpers from './helpers';
const OrganizationRegister = artifacts.require('./OrganizationRegister.sol');
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const GenesisScheme = artifacts.require("./GenesisScheme.sol");

export class OrganizationRegisterParams {
  constructor() {
  }
}

const setupOrganizationRegisterParams = async function(
                                            organizationRegister,
                                            tokenAddress,
                                            beneficiary,

                                            ) {
  var organizationRegisterParams = new OrganizationRegisterParams();
  organizationRegisterParams.votingMachine = await helpers.setupAbsoluteVote();
  await organizationRegister.setParameters(tokenAddress,13,beneficiary);
  organizationRegisterParams.paramsHash = await organizationRegister.getParametersHash(tokenAddress,13,beneficiary);
  return organizationRegisterParams;
};

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.organizationRegister = await OrganizationRegister.new(testSetup.standardTokenMock.address,testSetup.fee,accounts[0]);
   testSetup.genesisScheme = await GenesisScheme.deployed();
   testSetup.org = await helpers.setupOrganization(testSetup.genesisScheme,accounts[0],1000,1000);
   testSetup.organizationRegisterParams= await setupOrganizationRegisterParams(testSetup.organizationRegister,testSetup.standardTokenMock.address,accounts[2]);
   await testSetup.genesisScheme.setSchemes(testSetup.org.avatar.address,[testSetup.organizationRegister.address],[testSetup.organizationRegisterParams.paramsHash],[testSetup.standardTokenMock.address],[100],["0x0000000F"]);
   //give some tokens to organization avatar so it could register the univeral scheme.
   await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   return testSetup;
};

contract('OrganizationRegister', function(accounts) {
  before(function() {
    helpers.etherForEveryone();
  });

  it("constructor", async function() {
    var standardTokenMock = await StandardTokenMock.new(accounts[0],100);
    var organizationRegister = await OrganizationRegister.new(standardTokenMock.address,10,accounts[1]);
    var token = await organizationRegister.nativeToken();
    assert.equal(token,standardTokenMock.address);
    var fee = await organizationRegister.fee();
    assert.equal(fee,10);
    var beneficiary = await organizationRegister.beneficiary();
    assert.equal(beneficiary,accounts[1]);
   });

   it("setParameters", async function() {
     var standardTokenMock = await StandardTokenMock.new(accounts[0],100);
     var organizationRegister = await OrganizationRegister.new(standardTokenMock.address,10,accounts[1]);
     await organizationRegister.setParameters(accounts[3],13,accounts[2]);
     var paramHash = await organizationRegister.getParametersHash(accounts[3],13,accounts[2]);
     var parameters = await organizationRegister.parameters(paramHash);
     assert.equal(parameters[1],accounts[3]);
     assert.equal(parameters[0],13);
     assert.equal(parameters[2],accounts[2]);
     });

    it("registerOrganization - check fee payment ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.organizationRegister.registerOrganization(testSetup.org.avatar.address);
      var balanceOfBeneficiary  = await testSetup.standardTokenMock.balanceOf(accounts[0]);
      assert.equal(balanceOfBeneficiary.toNumber(),testSetup.fee);
    });

     it("addOrPromoteAddress add and promote ", async function() {
       var testSetup = await setup(accounts);
       var record = accounts[4];
       var amount = 13;
       await testSetup.organizationRegister.registerOrganization(testSetup.org.avatar.address);

       await testSetup.standardTokenMock.approve(testSetup.organizationRegister.address,100,{from:accounts[1]});

       var tx = await testSetup.organizationRegister.addOrPromoteAddress(testSetup.org.avatar.address,
                                                                     record,
                                                                     amount,{from:accounts[1]});
       assert.equal(tx.logs.length, 2);
       assert.equal(tx.logs[0].event, "OrgAdded");
       assert.equal(tx.logs[1].event, "Promotion");
       var  registery = await helpers.getValueFromLogs(tx, '_registry');
       var org = await helpers.getValueFromLogs(tx, '_org');
       var registeryAmount  = await testSetup.organizationRegister.organizationsRegistery(registery,org);
       assert.equal(amount,registeryAmount);
       //now try to promote.
       tx = await testSetup.organizationRegister.addOrPromoteAddress(testSetup.org.avatar.address,
                                                                     record,
                                                                     1,{from:accounts[1]});
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "Promotion");
       registery = await helpers.getValueFromLogs(tx, '_registry');
       org = await helpers.getValueFromLogs(tx, '_org');
       registeryAmount  = await testSetup.organizationRegister.organizationsRegistery(registery,org);
       assert.equal(amount+1,registeryAmount);
      });

      it("addOrPromoteAddress add without enough fee should fail ", async function() {
        var testSetup = await setup(accounts);
        var record = accounts[4];
        var amount = 12;
        await testSetup.organizationRegister.registerOrganization(testSetup.org.avatar.address);

        await testSetup.standardTokenMock.approve(testSetup.organizationRegister.address,100,{from:accounts[1]});

        try{
        await testSetup.organizationRegister.addOrPromoteAddress(testSetup.org.avatar.address,
                                                                      record,
                                                                      amount,{from:accounts[1]});
        assert(false,"addOrPromoteAddress should  fail - due to amount<fee !");
        }catch(ex){
           helpers.assertVMException(ex);
        }
       });

       it("addOrPromoteAddress add  without regisration -should fail ", async function() {
         var testSetup = await setup(accounts);
         var record = accounts[4];
         var amount = 13;

         await testSetup.standardTokenMock.approve(testSetup.organizationRegister.address,100,{from:accounts[1]});

         try{
         await testSetup.organizationRegister.addOrPromoteAddress(testSetup.org.avatar.address,
                                                                       record,
                                                                       amount,{from:accounts[1]});
         assert(false,"addOrPromoteAddress should  fail - due to no registratin !");
         }catch(ex){
            helpers.assertVMException(ex);
         }
        });
});
