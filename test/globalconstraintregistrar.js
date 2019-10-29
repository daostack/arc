import * as helpers from './helpers';
const constants = require('./constants');
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const GlobalConstraintMock = artifacts.require('./test/GlobalConstraintMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const Controller = artifacts.require("./Controller.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");



export class GlobalConstraintRegistrarParams {
  constructor() {
  }
}

const setupGlobalConstraintRegistrarParams = async function(

                                            globalConstraintRegistrar,
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            avatarAddress
                                            ) {
  var globalConstraintRegistrarParams = new GlobalConstraintRegistrarParams();
  if (genesisProtocol === true) {
    globalConstraintRegistrarParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    await globalConstraintRegistrar.initialize(avatarAddress,
                                               globalConstraintRegistrarParams.votingMachine.genesisProtocol.address,
                                                globalConstraintRegistrarParams.votingMachine.params
                                               );
    } else {
  globalConstraintRegistrarParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,globalConstraintRegistrar.address);
  await globalConstraintRegistrar.initialize(   avatarAddress,
                                                globalConstraintRegistrarParams.votingMachine.absoluteVote.address,
                                                globalConstraintRegistrarParams.votingMachine.params,
                                                );
  }
  globalConstraintRegistrarParams.paramsHash = helpers.NULL_HASH;
  return globalConstraintRegistrarParams;
};

const setup = async function (accounts,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.globalConstraintRegistrar = await GlobalConstraintRegistrar.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,10,70];
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   testSetup.globalConstraintRegistrarParams= await setupGlobalConstraintRegistrarParams(testSetup.globalConstraintRegistrar,
                                                                                         accounts,
                                                                                         genesisProtocol,
                                                                                         tokenAddress,
                                                                                          testSetup.org.avatar.address);
   var permissions = "0x00000004";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                          [testSetup.globalConstraintRegistrar.address],
                                          [permissions],"metaData");

   return testSetup;
};
contract('GlobalConstraintRegistrar', accounts => {

   it("initialize", async ()=> {
     var globalConstraintRegistrar = await GlobalConstraintRegistrar.new();
     var params = await setupGlobalConstraintRegistrarParams(globalConstraintRegistrar,
                                                             accounts,
                                                             false,
                                                             helpers.SOME_ADDRESS,
                                                             helpers.SOME_ADDRESS);

     assert.equal(await globalConstraintRegistrar.votingMachine(),params.votingMachine.absoluteVote.address);
     });

    it("proposeGlobalConstraint voteToRemoveParams", async function() {
      var testSetup = await setup(accounts);
      var globalConstraintMock = await GlobalConstraintMock.new();

      var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                     globalConstraintMock.address,
                                                                     "0x1234",
                                                                     "0x1235",helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var voteToRemoveParams = await testSetup.globalConstraintRegistrar.voteToRemoveParams(globalConstraintMock.address);
      assert.equal(voteToRemoveParams, "0x1235000000000000000000000000000000000000000000000000000000000000");
     });

    it("proposeGlobalConstraint organizationsProposals", async function() {
      var testSetup = await setup(accounts);
      var globalConstraintMock = await GlobalConstraintMock.new();

      var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                     globalConstraintMock.address,
                                                                     "0x1234",
                                                                     "0x1234",helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var organizationProposal = await testSetup.globalConstraintRegistrar.organizationProposals(proposalId);
      assert.equal(organizationProposal[0],globalConstraintMock.address);
     });

    it("proposeGlobalConstraint log", async function() {
      var testSetup = await setup(accounts);
      var globalConstraintMock = await GlobalConstraintMock.new();

      var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                     globalConstraintMock.address,
                                                                     "0x1234",
                                                                     "0x1234",helpers.NULL_HASH);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewGlobalConstraintsProposal");
     });

   it("execute proposeGlobalConstraint ", async function() {
     var testSetup = await setup(accounts);
     var controller = await Controller.at(await testSetup.org.avatar.owner());
     var globalConstraintMock = await GlobalConstraintMock.new();
     await globalConstraintMock.setConstraint(web3.utils.asciiToHex("method"),false,false);



     var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                    globalConstraintMock.address,
                                                                    "0x1234",
                                                                    testSetup.globalConstraintRegistrarParams.votingMachine.params,helpers.NULL_HASH);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "NewGlobalConstraintsProposal");
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     let gcCount =  await controller.globalConstraintsCount();
     assert.equal(gcCount[0],0);
     assert.equal(gcCount[1],0);
     tx = await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     gcCount =  await controller.globalConstraintsCount();
     assert.equal(gcCount[0],1);
    });

   it("proposeToRemoveGC log", async function() {
     var testSetup = await setup(accounts);
     var globalConstraintMock =await GlobalConstraintMock.new();
     await globalConstraintMock.setConstraint(web3.utils.asciiToHex("method"),false,false);

     var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                    globalConstraintMock.address,
                                                                    "0x1234",
                                                                    testSetup.globalConstraintRegistrarParams.votingMachine.params,helpers.NULL_HASH);
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(
                                                                    globalConstraintMock.address,helpers.NULL_HASH);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "RemoveGlobalConstraintsProposal");
    });


    it("proposeToRemoveGC without registration -should fail", async function() {
      var testSetup = await setup(accounts,false);
      var globalConstraintMock =await GlobalConstraintMock.new();
      try{
        await testSetup.globalConstraintRegistrar.proposeToRemoveGC(
                                                                       globalConstraintMock.address,
                                                                       helpers.NULL_HASH);
       assert(false,"proposeGlobalConstraint should  fail - due to no registration !");
      }catch(ex){
        helpers.assertVMException(ex);
      }
     });

      it("execute proposeToRemoveGC ", async function() {
        var testSetup = await setup(accounts);
        var controller = await Controller.at(await testSetup.org.avatar.owner());
        var globalConstraintMock =await GlobalConstraintMock.new();
        await globalConstraintMock.setConstraint(web3.utils.asciiToHex("method"),false,false);

        var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                       globalConstraintMock.address,
                                                                       "0x1234",
                                                                       testSetup.globalConstraintRegistrarParams.votingMachine.params,helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        assert.equal(await controller.isGlobalConstraintRegistered(globalConstraintMock.address),true);
        tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(
                                                                       globalConstraintMock.address,
                                                                       helpers.NULL_HASH);
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "RemoveGlobalConstraintsProposal");
        proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        let count = await controller.globalConstraintsCount();
        assert.equal(count[0],1);
        await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        count = await controller.globalConstraintsCount();
        assert.equal(count[0],0);
       });

       it("execute proposeToRemoveGC (same as proposeGlobalConstraint) vote=NO ", async function() {
         var testSetup = await setup(accounts);
         var controller = await Controller.at(await testSetup.org.avatar.owner());
         var globalConstraintMock =await GlobalConstraintMock.new();
         await globalConstraintMock.setConstraint(web3.utils.asciiToHex("method"),false,false);

         var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                        globalConstraintMock.address,
                                                                        "0x1234",
                                                                        testSetup.globalConstraintRegistrarParams.votingMachine.params,helpers.NULL_HASH);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await testSetup.globalConstraintRegistrarParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         let count = await controller.globalConstraintsCount();
         assert.equal(count[0],0);
    });




    it("proposeToRemoveGC  with genesis protocol", async function() {
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,true,standardTokenMock.address);
      var globalConstraintMock =await GlobalConstraintMock.new();
      //genesisProtocol use burn reputation.
      await globalConstraintMock.setConstraint(web3.utils.asciiToHex("burnReputation"),true,true);

      var tx = await testSetup.globalConstraintRegistrar.proposeGlobalConstraint(
                                                                     globalConstraintMock.address,
                                                                     "0x1234",
                                                                     testSetup.globalConstraintRegistrarParams.votingMachine.params,
                                                                     helpers.NULL_HASH);


      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

      tx = await testSetup.globalConstraintRegistrar.proposeToRemoveGC(
                                                                      globalConstraintMock.address,
                                                                      helpers.NULL_HASH);

      proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var rep = await testSetup.org.reputation.balanceOf(accounts[2]);

      await testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await helpers.checkVoteInfo(testSetup.globalConstraintRegistrarParams.votingMachine.genesisProtocol,proposalId,accounts[2],[1,rep.toNumber()]);
     });

});
