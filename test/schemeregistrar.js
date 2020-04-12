const helpers = require("./helpers");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const SchemeMock = artifacts.require('./SchemeMock.sol');
const Controller = artifacts.require('./Controller.sol');

class SchemeRegistrarParams {
  constructor() {
  }
}

var registration;
const setupSchemeRegistrarParams = async function(
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            avatarAddress,
                                            ) {
  var schemeRegistrarParams = new SchemeRegistrarParams();
  if (genesisProtocol === true) {
    schemeRegistrarParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    schemeRegistrarParams.initdata = await new web3.eth.Contract(registration.schemeRegistrar.abi)
                          .methods
                          .initialize(avatarAddress,
                            schemeRegistrarParams.votingMachine.genesisProtocol.address,
                            schemeRegistrarParams.votingMachine.uintArray,
                            schemeRegistrarParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH,
                            schemeRegistrarParams.votingMachine.uintArray,
                            schemeRegistrarParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH)
                          .encodeABI();
    } else {
      schemeRegistrarParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      schemeRegistrarParams.initdata = await new web3.eth.Contract(registration.schemeRegistrar.abi)
                            .methods
                            .initialize(avatarAddress,
                              schemeRegistrarParams.votingMachine.absoluteVote.address,
                              [0,0,0,0,0,0,0,0,0,0,0],
                              helpers.NULL_ADDRESS,
                              schemeRegistrarParams.votingMachine.params,
                              [0,0,0,0,0,0,0,0,0,0,0],
                              helpers.NULL_ADDRESS,
                              schemeRegistrarParams.votingMachine.params)
                            .encodeABI();
  }
  return schemeRegistrarParams;
};

const setup = async function (accounts,genesisProtocol = false,tokenAddress=0) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [2000,4000,7000];
  testSetup.proxyAdmin = accounts[5];
  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      accounts[2]],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray);
  testSetup.schemeRegistrarParams= await setupSchemeRegistrarParams(
                                          accounts,
                                          genesisProtocol,
                                          tokenAddress,
                                          testSetup.org.avatar.address);

  var permissions = "0x0000001f";
  var tx = await registration.daoFactory.setSchemes(
                          testSetup.org.avatar.address,
                          [web3.utils.fromAscii("SchemeRegistrar")],
                          testSetup.schemeRegistrarParams.initdata,
                          [helpers.getBytesLength(testSetup.schemeRegistrarParams.initdata)],
                          [permissions],
                          "metaData",{from:testSetup.proxyAdmin});

  testSetup.schemeRegistrar = await SchemeRegistrar.at(tx.logs[1].args._scheme);
  return testSetup;
};
contract('SchemeRegistrar', accounts => {

   it("initialize", async() => {
     var testSetup = await setup(accounts);
     assert.equal(await testSetup.schemeRegistrar.votingMachine(),
     testSetup.schemeRegistrarParams.votingMachine.absoluteVote.address);
     assert.equal(await testSetup.schemeRegistrar.avatar(),testSetup.org.avatar.address);
     });

    it("proposeScheme log", async function() {
      var testSetup = await setup(accounts);

      var tx = await testSetup.schemeRegistrar.proposeScheme(
                                                             testSetup.schemeRegistrar.address,
                                                             "0x00000000",
                                                             helpers.NULL_HASH);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewSchemeProposal");
     });

       it("proposeToRemoveScheme log", async function() {
         var testSetup = await setup(accounts);

         var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(
                                                                        testSetup.schemeRegistrar.address,
                                                                        helpers.NULL_HASH);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RemoveSchemeProposal");
        });


    it("execute proposeScheme  and execute -yes - fee > 0 ", async function() {
      var testSetup = await setup(accounts);
      var universalScheme = await SchemeMock.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(universalScheme.address,"0x00000000",helpers.NULL_HASH);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var controller = await Controller.at(await testSetup.org.avatar.owner());
      assert.equal(await controller.isSchemeRegistered(universalScheme.address),true);
     });

     it("execute proposeScheme  and execute -yes - fee > 0  + genesisProtocol", async function() {
       var testSetup = await setup(accounts,true,helpers.NULL_ADDRESS);
       var universalScheme = await SchemeMock.new();
       var tx = await testSetup.schemeRegistrar.proposeScheme(universalScheme.address,"0x00000000",helpers.NULL_HASH);

       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.schemeRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var controller = await Controller.at(await testSetup.org.avatar.owner());
       assert.equal(await controller.isSchemeRegistered(universalScheme.address),true);
      });

     it("execute proposeScheme  and execute -yes - permissions== 0x00000001", async function() {
       var testSetup = await setup(accounts);
       var permissions = "0x00000001";

       var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],permissions,helpers.NULL_HASH);
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var controller = await Controller.at(await testSetup.org.avatar.owner());
       assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
       assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000001");
      });

      it("execute proposeScheme  and execute -yes - permissions== 0x00000002", async function() {
        var testSetup = await setup(accounts);
        var permissions = "0x00000002";

        var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],permissions,helpers.NULL_HASH);
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
        assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000003");
       });

       it("execute proposeScheme  and execute -yes - permissions== 0x00000003", async function() {
         var testSetup = await setup(accounts);
         var permissions = "0x00000003";

         var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],permissions,helpers.NULL_HASH);
         //Vote with reputation to trigger execution
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
         assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000003");
        });

        it("execute proposeScheme  and execute -yes - permissions== 0x00000008", async function() {
          var testSetup = await setup(accounts);
          var permissions = "0x00000008";

          var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],permissions,helpers.NULL_HASH);
          //Vote with reputation to trigger execution
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
          var controller = await Controller.at(await testSetup.org.avatar.owner());
          assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
          assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000009");
         });

         it("execute proposeScheme  and execute -yes - permissions== 0x00000010", async function() {
           var testSetup = await setup(accounts);
           var permissions = "0x00000010";

           var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],permissions,helpers.NULL_HASH);
           //Vote with reputation to trigger execution
           var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
           var controller = await Controller.at(await testSetup.org.avatar.owner());
           assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
           assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000011");
          });

      it("execute proposeScheme  and execute -yes - isRegistering==FALSE ", async function() {
        var testSetup = await setup(accounts);

        var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],"0x00000000",helpers.NULL_HASH);
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        assert.equal(await controller.isSchemeRegistered(accounts[0]),true);
        assert.equal(await controller.schemesPermissions(accounts[0]),"0x00000001");
       });



       it("execute proposeScheme - no decision (same for remove scheme) - proposal data delete", async function() {
         var testSetup = await setup(accounts);

         var tx = await testSetup.schemeRegistrar.proposeScheme(accounts[0],"0x00000000",helpers.NULL_HASH);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         //check organizationsProposals before execution
         var organizationProposal = await testSetup.schemeRegistrar.organizationProposals(proposalId);
         assert.equal(organizationProposal[1],true);//proposalType

         //Vote with reputation to trigger execution
         await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         //should not register because the decision is "no"
         assert.equal(await controller.isSchemeRegistered(accounts[0]),false);
         //check organizationsProposals after execution
         organizationProposal = await testSetup.schemeRegistrar.organizationProposals(proposalId);
         assert.equal(organizationProposal[2],0);//proposalType
        });

        it("execute proposeToRemoveScheme ", async function() {
          var testSetup = await setup(accounts);

          var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.schemeRegistrar.address,helpers.NULL_HASH);
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          var controller = await Controller.at(await testSetup.org.avatar.owner());
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),true);
          //Vote with reputation to trigger execution
          await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
          assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),false);
          //check organizationsProposals after execution
          var organizationProposal = await testSetup.schemeRegistrar.organizationProposals(proposalId);
          assert.equal(organizationProposal[2],0);//proposalType
         });

         it("execute proposeToRemoveScheme + genesisProtocol ", async function() {
           var testSetup = await setup(accounts,true,helpers.NULL_ADDRESS);

           var tx = await testSetup.schemeRegistrar.proposeToRemoveScheme(testSetup.schemeRegistrar.address,helpers.NULL_HASH);
           var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           var controller = await Controller.at(await testSetup.org.avatar.owner());
           assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),true);
           //Vote with reputation to trigger execution
           await testSetup.schemeRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
           assert.equal(await controller.isSchemeRegistered(testSetup.schemeRegistrar.address),false);
           //check organizationsProposals after execution
           var organizationProposal = await testSetup.schemeRegistrar.organizationProposals(proposalId);
           assert.equal(organizationProposal[2],0);//proposalType
          });
   it("execute proposeScheme  and execute -yes - autoRegisterOrganization==TRUE arc scheme", async function() {
     var testSetup = await setup(accounts);

     var universalScheme = await SchemeMock.new();
     var tx = await testSetup.schemeRegistrar.proposeScheme(universalScheme.address,"0x00000000",helpers.NULL_HASH);
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    });

    it("execute proposeScheme  and execute -yes - autoRegisterOrganization==FALSE arc scheme", async function() {
      var testSetup = await setup(accounts);

      var universalScheme = await SchemeMock.new();
      var tx = await testSetup.schemeRegistrar.proposeScheme(universalScheme.address,"0x00000000",helpers.NULL_HASH);
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.schemeRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     });
});
