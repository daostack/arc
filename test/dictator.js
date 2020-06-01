const helpers = require("./helpers");
const Controller = artifacts.require("./Controller.sol");
const Dictator = artifacts.require("./Dictator.sol");


class DictatorParams {
  constructor() {
  }
}

var registration;
const setupDictator = async function(_avatarAddress,_owner) {
  var dictatorParams = new DictatorParams();
  dictatorParams.initdata = await new web3.eth.Contract(registration.dictator.abi)
                        .methods
                        .initialize(_avatarAddress,_owner)
                        .encodeABI();

  return dictatorParams;
};

const setup = async function (accounts,permissions = "0x0000001f" ) {
   var testSetup = new helpers.TestSetup();
   registration = await helpers.registerImplementation();
   testSetup.reputationArray = [2000,4000,7000];
   testSetup.proxyAdmin = accounts[5];

   testSetup.owner = accounts[4];
   testSetup.dictatorParams= await setupDictator(
                      helpers.NULL_ADDRESS,
                      testSetup.owner
                      );

   [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                       accounts,
                                                                       registration,
                                                                       [accounts[0],
                                                                       accounts[1],
                                                                       accounts[2]],
                                                                       [1000,0,0],
                                                                       testSetup.reputationArray,0,
                                                                       [web3.utils.fromAscii("Dictator")],
                                                                       testSetup.dictatorParams.initdata,
                                                                       [helpers.getBytesLength(testSetup.dictatorParams.initdata)],
                                                                       [permissions],
                                                                       "metaData");

   testSetup.dictator = await Dictator.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));

   return testSetup;
};
contract('Dictator', accounts => {

   it("avatar address cannot be 0 ", async function() {
     var dictator = await Dictator.new();

     try {
        await dictator.initialize(helpers.NULL_ADDRESS,accounts[0]);
        assert(false, "avatar 0 address should revert");
      } catch(error) {
         // revert
     }
     await dictator.initialize(accounts[1],accounts[0]);
   });

   it("register scheme should fail without proper permission", async function() {
      var testSetup = await setup(accounts,"0x00000000");
      try {
        await testSetup.dictator.registerScheme(accounts[3],{from:testSetup.owner});
        assert(false, "register scheme should fail without proper permission");
      } catch(error) {
        helpers.assertVMException(error);
      }

    });

    it("register scheme", async function() {
       var testSetup = await setup(accounts);
       var controllerAddress =  await testSetup.org.avatar.owner();
       var controller =  await Controller.at(controllerAddress);
       assert.equal((await controller.schemesPermissions(accounts[3])), "0x00000000");
       try {
         await testSetup.dictator.registerScheme(accounts[3]);
         assert(false, "only owner can register scheme");
       } catch(error) {
         helpers.assertVMException(error);
       }
       var tx = await testSetup.dictator.registerScheme(accounts[3],{from:testSetup.owner});

       await controller.getPastEvents('RegisterScheme', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"RegisterScheme");
             assert.equal(events[0].args._scheme,accounts[3]);
         });
       assert.equal((await controller.schemesPermissions(accounts[3])), "0x0000001f");

    });

});
