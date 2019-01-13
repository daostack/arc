import * as helpers from './helpers';
const constants = require('./constants');
const AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
const VestingScheme = artifacts.require('./VestingScheme.sol');
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");


export class VestingSchemeParams {
  constructor() {
  }
}

const setupVestingSchemeParams = async function(
                                            vestingScheme,
                                            ) {
  var vestingSchemeParams = new VestingSchemeParams();
  vestingSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,vestingScheme.address);
  await vestingScheme.setParameters(vestingSchemeParams.votingMachine.params,vestingSchemeParams.votingMachine.absoluteVote.address);
  vestingSchemeParams.paramsHash = await vestingScheme.getParametersHash(vestingSchemeParams.votingMachine.params,vestingSchemeParams.votingMachine.absoluteVote.address);
  return vestingSchemeParams;
};

const setup = async function (accounts) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.vestingScheme = await VestingScheme.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,40,70];
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,0,0],testSetup.reputationArray);
   testSetup.vestingSchemeParams= await setupVestingSchemeParams(testSetup.vestingScheme);
   //give some tokens to organization avatar so it could register the universal scheme.
   await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   var permissions = "0x00000001";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.vestingScheme.address],[testSetup.vestingSchemeParams.paramsHash],[permissions]);

   return testSetup;
};

contract('VestingScheme', accounts => {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

   it("setParameters", async() =>{
     var vestingScheme = await VestingScheme.new();
     var absoluteVote = await AbsoluteVote.new();
     await vestingScheme.setParameters("0x1234",absoluteVote.address);
     var paramHash = await vestingScheme.getParametersHash("0x1234",absoluteVote.address);
     var parameters = await vestingScheme.parameters(paramHash);
     assert.equal(parameters[1],absoluteVote.address);
     });

     it("proposeVestingAgreement log", async() => {
       var testSetup = await setup(accounts);
       var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));


       var signatures = [accounts[0],accounts[1],accounts[2]];

       var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                      accounts[1],
                                                                      blockNumber,
                                                                     15,
                                                                     2,
                                                                     3,
                                                                     11,
                                                                     3,
                                                                     signatures,
                                                                     testSetup.org.avatar.address,
                                                                     helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "AgreementProposal");
       var avatarAddress = await helpers.getValueFromLogs(tx, '_avatar',1);
       assert.equal(avatarAddress,testSetup.org.avatar.address);
      });

    it("proposeVestingAgreement check assert _signaturesReqToCancel <= _signersArray.length", async function() {
      var testSetup = await setup(accounts);
      var _signaturesReqToCancel = 5;
      var _signersArray = [];
      for (var i=0;i<_signaturesReqToCancel-1;i++){
        _signersArray[i] = accounts[i];
      }
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      try {
       await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                     accounts[1],
                                                                     blockNumber,
                                                                     15,
                                                                     2,
                                                                     3,
                                                                     11,
                                                                     _signaturesReqToCancel,
                                                                     _signersArray,
                                                                     testSetup.org.avatar.address,
                                                                     helpers.NULL_HASH);
       assert(false,"proposeVestingAgreement should fail - due to _signaturesReqToCancel > _signersArray.length !");
      }catch(ex){
       helpers.assertVMException(ex);
      }
     });

    it("proposeVestingAgreement check assert _numOfAgreedPeriods > 0", async function() {
      var testSetup = await setup(accounts);
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      try {
        await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
          accounts[1],
          blockNumber,
          15,
          2,
          0,
          11,
          3, [accounts[0], accounts[1], accounts[2]],
          testSetup.org.avatar.address,helpers.NULL_HASH);
        assert(false, "proposeVestingAgreement should fail - due to _numOfAgreedPeriods > 0 !");
      } catch (ex) {
        helpers.assertVMException(ex);
      }
    });

    it("execute proposeVestingAgreement- ProposedVestedAgreement supplies proposalId ", async function() {
     var testSetup = await setup(accounts);

     var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

     var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                    accounts[1],
                                                                    blockNumber,
                                                                    15,
                                                                    2,
                                                                    3,
                                                                    11,
                                                                    0,
                                                                    [],
                                                                    testSetup.org.avatar.address,helpers.NULL_HASH);
    //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.vestingSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     await testSetup.vestingScheme.getPastEvents('ProposedVestedAgreement', {
           filter: {_proposalId: proposalId},
           fromBlock: tx.blockNumber,
           toBlock: 'latest'
       })
       .then(function(events){
           assert.equal(events[0].event,"ProposedVestedAgreement");
       });
    });

     it("execute proposeVestingAgreement controller -yes - proposal data delete", async function() {
       var testSetup = await setup(accounts);

       var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

       var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                      accounts[1],
                                                                      blockNumber,
                                                                      15,
                                                                      2,
                                                                      3,
                                                                      11,
                                                                      0,
                                                                      [],
                                                                      testSetup.org.avatar.address,helpers.NULL_HASH);
      //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       //check organizationsProposals before execution
       var organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
       assert.equal(organizationProposal[0],testSetup.org.token.address);//proposalType
       await testSetup.vestingSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
       assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
      });

    it("execute proposeVestingAgreement  -from none voting contact -should fail", async function() {
      var testSetup = await setup(accounts);
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                     accounts[1],
                                                                     blockNumber,
                                                                     15,
                                                                     2,
                                                                     3,
                                                                     11,
                                                                     0,
                                                                     [],
                                                                     testSetup.org.avatar.address,helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      //check organizationsProposals before execution
      var organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],testSetup.org.token.address);
      try{
        await testSetup.vestingScheme.executeProposal(proposalId,0);
        assert(false,"execute should fail - due because it is not called from voting contract !");
       }catch(ex){
        helpers.assertVMException(ex);
       }
     });

    it("executeProposeVestingAgreement - no decision  - proposal data delete", async function() {
      var testSetup = await setup(accounts);
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                     accounts[1],
                                                                     blockNumber,
                                                                     15,
                                                                     2,
                                                                     3,
                                                                     11,
                                                                     0,
                                                                     [],
                                                                     testSetup.org.avatar.address,helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      //check organizationsProposals before execution
      var organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],testSetup.org.token.address);

      //Vote with reputation to trigger execution
      await testSetup.vestingSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      //check organizationsProposals after execution
      organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
     });

             it("execute proposeVestingAgreement controller -yes - check minting", async function() {
               var testSetup = await setup(accounts);
               var amountPerPeriod =3;
               var numberOfAgreedPeriods = 7;
               var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));


               var tx = await testSetup.vestingScheme.proposeVestingAgreement(accounts[0],
                                                                              accounts[1],
                                                                              blockNumber,
                                                                              amountPerPeriod,
                                                                              2,
                                                                              numberOfAgreedPeriods,
                                                                              11,
                                                                              0,
                                                                              [],
                                                                              testSetup.org.avatar.address,helpers.NULL_HASH);
              //Vote with reputation to trigger execution
               var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
               //check organizationsProposals before execution
               var organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationProposal[0],testSetup.org.token.address);
               assert.equal(await testSetup.org.token.balanceOf(testSetup.vestingScheme.address),0);
               await testSetup.vestingSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
               //check organizationsProposals after execution
               organizationProposal = await testSetup.vestingScheme.organizationsProposals(testSetup.org.avatar.address,proposalId);
               assert.equal(organizationProposal[0],0x0000000000000000000000000000000000000000);//new contract address
               assert.equal(await testSetup.org.token.balanceOf(testSetup.vestingScheme.address),amountPerPeriod*numberOfAgreedPeriods);
              });

    it("createVestedAgreement check agreement id ", async function() {
      var testSetup = await setup(accounts);
      var amountPerPeriod =3;
      var numberOfAgreedPeriods = 7;
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));


      await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
      var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                     accounts[0],
                                                                     accounts[1],
                                                                     [blockNumber,
                                                                     amountPerPeriod,
                                                                     2,
                                                                     numberOfAgreedPeriods,
                                                                     11,
                                                                     0],
                                                                     [],{from:accounts[1]});
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewVestedAgreement");
      var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
      assert.equal(agreementId,0);
      blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      tx = await testSetup.vestingScheme.createVestedAgreement( testSetup.standardTokenMock.address,
                                                                accounts[0],
                                                                     accounts[1],
                                                                     [blockNumber,
                                                                     amountPerPeriod,
                                                                     2,
                                                                     numberOfAgreedPeriods,
                                                                     11,
                                                                     0],
                                                                     [],
                                                                     {from:accounts[1]});
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewVestedAgreement");
      agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
      assert.equal(agreementId,1);
     });

    it("createVestedAgreement check periodLength==0 ", async function() {
      var testSetup = await setup(accounts);
      var amountPerPeriod =3;
      var numberOfAgreedPeriods = 7;
      var periodLength = 0;

      await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      try{
       await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                     accounts[0],
                                                                     accounts[1],
                                                                     [blockNumber,
                                                                     amountPerPeriod,
                                                                     periodLength,
                                                                     numberOfAgreedPeriods,
                                                                     11,
                                                                     0],
                                                                     [],{from:accounts[1]});

      assert(false,"createVestedAgreement should fail - due to periodLength == 0");
      }catch(ex){
       helpers.assertVMException(ex);
      }
     });

     it("createVestedAgreement check payment", async function() {
       var testSetup = await setup(accounts);
       var amountPerPeriod =3;
       var numberOfAgreedPeriods = 7;
       var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

       await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
       await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                      accounts[0],
                                                                      accounts[1],
                                                                      [blockNumber,
                                                                      amountPerPeriod,
                                                                      2,
                                                                      numberOfAgreedPeriods,
                                                                      11,
                                                                      0],
                                                                      [],{from:accounts[1]});
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.vestingScheme.address),amountPerPeriod*numberOfAgreedPeriods);
      });

      it("createVestedAgreement check assert _signaturesReqToCancel <= _signersArray.length", async function() {
        var testSetup = await setup(accounts);
        var _signaturesReqToCancel = 5;
        var amountPerPeriod =3;
        var numberOfAgreedPeriods = 7;
        var _signersArray = [];
        for (var i=0;i<_signaturesReqToCancel-1;i++){
          _signersArray[i] = accounts[i];
        }

        await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
        var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

        try {
          await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                         accounts[0],
                                                                         accounts[1],
                                                                         [blockNumber,
                                                                         amountPerPeriod,
                                                                         2,
                                                                         numberOfAgreedPeriods,
                                                                         11,
                                                                         _signaturesReqToCancel],
                                                                         _signersArray,{from:accounts[1]});
         assert(false,"createVestedAgreement should fail - due to _signaturesReqToCancel > _signersArray.length !");
        }catch(ex){
         helpers.assertVMException(ex);
        }
       });

    it("createVestedAgreement check _numOfAgreedPeriods > 0 ", async function() {
      var testSetup = await setup(accounts);
      var amountPerPeriod = 3;
      var numberOfAgreedPeriods = 0;
      var periodLength = 2;
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

      try {
        await testSetup.vestingScheme.createVestedAgreement(testSetup.standardTokenMock.address,
          accounts[0],
          accounts[1],
          [blockNumber,
          amountPerPeriod,
          periodLength,
          numberOfAgreedPeriods,
          11,
          0], [], {
            from: accounts[1]
          });

        assert(false, "createVestedAgreement should fail - due to _numOfAgreedPeriods > 0");
      } catch (ex) {
        helpers.assertVMException(ex);
      }
    });

   it("signToCancelAgreement log", async function() {
     var testSetup = await setup(accounts);
     var _signaturesReqToCancel = 5;
     var amountPerPeriod =3;
     var numberOfAgreedPeriods = 7;
     var _signersArray = [];
     for (var i=0;i<_signaturesReqToCancel;i++){
       _signersArray[i] = accounts[i];
     }
     var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
     await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
     var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                    accounts[0],
                                                                    accounts[1],
                                                                    [blockNumber,
                                                                    amountPerPeriod,
                                                                    2,
                                                                    numberOfAgreedPeriods,
                                                                    11,
                                                                    _signaturesReqToCancel],
                                                                    _signersArray,{from:accounts[1]});
     var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
     assert.equal(agreementId,0);
     tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "SignToCancelAgreement");
    });

    it("signToCancelAgreement from non signer", async function() {
      var testSetup = await setup(accounts);
      var _signaturesReqToCancel = 1;
      var amountPerPeriod =3;
      var numberOfAgreedPeriods = 7;
      var _signersArray = [];
      for (var i=0;i<_signaturesReqToCancel;i++){
        _signersArray[i] = accounts[i];
      }
      var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
      await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
      var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                     accounts[0],
                                                                     accounts[1],
                                                                     [blockNumber,
                                                                     amountPerPeriod,
                                                                     2,
                                                                     numberOfAgreedPeriods,
                                                                     11,
                                                                     _signaturesReqToCancel],
                                                                     _signersArray,{from:accounts[1]});
      var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
      try{
      await testSetup.vestingScheme.signToCancelAgreement(agreementId,{from: accounts[1]});
      assert(false,"signToCancelAgreement should fail - due to accounts[1] is not authorized signer");
      }catch(ex){
        helpers.assertVMException(ex);
      }
     });

     it("signToCancelAgreement wrong agreementId", async function() {
       var testSetup = await setup(accounts);
       var _signaturesReqToCancel = 1;
       var amountPerPeriod =3;
       var numberOfAgreedPeriods = 7;
       var _signersArray = [];
       for (var i=0;i<_signaturesReqToCancel;i++){
         _signersArray[i] = accounts[i];
       }

       await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
       var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
       var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                      accounts[0],
                                                                      accounts[1],
                                                                      [blockNumber,
                                                                      amountPerPeriod,
                                                                      2,
                                                                      numberOfAgreedPeriods,
                                                                      11,
                                                                      _signaturesReqToCancel],
                                                                      _signersArray,{from:accounts[1]});
       var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
       try{
       await testSetup.vestingScheme.signToCancelAgreement(agreementId+1);
       assert(false,"signToCancelAgreement should fail - due to wrong agreementId");
       }catch(ex){
         helpers.assertVMException(ex);
       }
      });

      it("signToCancelAgreement double sign attempt", async function() {
        var testSetup = await setup(accounts);
        var _signaturesReqToCancel = 1;
        var amountPerPeriod =3;
        var numberOfAgreedPeriods = 7;
        var _signersArray = [];
        for (var i=0;i<_signaturesReqToCancel;i++){
          _signersArray[i] = accounts[i];
        }

        await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
        var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
        var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                       accounts[0],
                                                                       accounts[1],
                                                                       [blockNumber,
                                                                       amountPerPeriod,
                                                                       2,
                                                                       numberOfAgreedPeriods,
                                                                       11,
                                                                       _signaturesReqToCancel],
                                                                       _signersArray,{from:accounts[1]});
        var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
        await testSetup.vestingScheme.signToCancelAgreement(agreementId);
        try{
        await testSetup.vestingScheme.signToCancelAgreement(agreementId);
        assert(false,"signToCancelAgreement should fail - due to double sign attempt");
        }catch(ex){
          helpers.assertVMException(ex);
        }
       });

     it("signToCancelAgreement check actual cancel", async function() {
       var testSetup = await setup(accounts);
       var returnOnCancelAddress = accounts[2];
       var _signaturesReqToCancel = 2;
       var amountPerPeriod =3;
       var numberOfAgreedPeriods = 7;
       var _signersArray = [];
       for (var i=0;i<_signaturesReqToCancel;i++){
         _signersArray[i] = accounts[i];
       }

       await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
       var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
       var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                      accounts[0],
                                                                      returnOnCancelAddress,
                                                                      [blockNumber,
                                                                      amountPerPeriod,
                                                                      2,
                                                                      numberOfAgreedPeriods,
                                                                      11,
                                                                      _signaturesReqToCancel],
                                                                      _signersArray,{from:accounts[1]});
       var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
       tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId);
       var agreement = await testSetup.vestingScheme.agreements(agreementId);
       assert.equal(agreement[10],1);
       tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId,{from:accounts[1]});
       assert.equal(tx.logs.length, 2);
       assert.equal(tx.logs[1].event, "AgreementCancel");
       //check agreement deleted
       agreement = await testSetup.vestingScheme.agreements(agreementId);
       assert.equal(agreement[0],0x0000000000000000000000000000000000000000);
       assert.equal(agreement[1],0x0000000000000000000000000000000000000000);
       assert.equal(agreement[10],0);
       var balance = await testSetup.standardTokenMock.balanceOf(returnOnCancelAddress);
       assert.equal(balance.toNumber(),numberOfAgreedPeriods*amountPerPeriod);
      });

       it("revokeSignToCancelAgreement log", async function() {
         var testSetup = await setup(accounts);
         var _signaturesReqToCancel = 5;
         var amountPerPeriod =3;
         var numberOfAgreedPeriods = 7;
         var _signersArray = [];
         for (var i=0;i<_signaturesReqToCancel;i++){
           _signersArray[i] = accounts[i];
         }

         await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
         var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
         var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                        accounts[0],
                                                                        accounts[1],
                                                                        [blockNumber,
                                                                        amountPerPeriod,
                                                                        2,
                                                                        numberOfAgreedPeriods,
                                                                        11,
                                                                        _signaturesReqToCancel],
                                                                        _signersArray,{from:accounts[1]});
         var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
         assert.equal(agreementId,0);
         tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId);
         var agreement = await testSetup.vestingScheme.agreements(agreementId);
         assert.equal(agreement[10],1);//signaturesReceivedCounter

         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "SignToCancelAgreement");
         tx = await testSetup.vestingScheme.revokeSignToCancelAgreement(agreementId);
         assert.equal(tx.logs.length, 1);
         assert.equal(tx.logs[0].event, "RevokeSignToCancelAgreement");
         agreement = await testSetup.vestingScheme.agreements(agreementId);
         assert.equal(agreement[10],0);//signaturesReceivedCounter

        });

        it("revokeSignToCancelAgreement from non signer", async function() {
          var testSetup = await setup(accounts);
          var _signaturesReqToCancel = 2;
          var amountPerPeriod =3;
          var numberOfAgreedPeriods = 7;
          var _signersArray = [];
          for (var i=0;i<_signaturesReqToCancel;i++){
            _signersArray[i] = accounts[i];
          }

          await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
          var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));
          var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                         accounts[0],
                                                                         accounts[1],
                                                                         [blockNumber,
                                                                         amountPerPeriod,
                                                                         2,
                                                                         numberOfAgreedPeriods,
                                                                         11,
                                                                         _signaturesReqToCancel],
                                                                         _signersArray,{from:accounts[1]});
          var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
          assert.equal(agreementId,0);
          tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId);
          assert.equal(tx.logs.length, 1);
          assert.equal(tx.logs[0].event, "SignToCancelAgreement");
          try{
          await testSetup.vestingScheme.revokeSignToCancelAgreement(agreementId,{from:accounts[2]});
          assert(false,"revokeSignToCancelAgreement should fail - due to accounts[2] is not authorized signer");
          }catch(ex){
            helpers.assertVMException(ex);
          }
         });

         it("revokeSignToCancelAgreement wrong agreementId", async function() {
           var testSetup = await setup(accounts);
           var _signaturesReqToCancel = 2;
           var amountPerPeriod =3;
           var numberOfAgreedPeriods = 7;
           var _signersArray = [];
           for (var i=0;i<_signaturesReqToCancel;i++){
             _signersArray[i] = accounts[i];
           }

           await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
           var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

           var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                          accounts[0],
                                                                          accounts[1],
                                                                          [blockNumber,
                                                                          amountPerPeriod,
                                                                          2,
                                                                          numberOfAgreedPeriods,
                                                                          11,
                                                                          _signaturesReqToCancel],
                                                                          _signersArray,{from:accounts[1]});
           var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
           assert.equal(agreementId,0);
           tx = await testSetup.vestingScheme.signToCancelAgreement(agreementId);
           assert.equal(tx.logs.length, 1);
           assert.equal(tx.logs[0].event, "SignToCancelAgreement");

           try{
           await testSetup.vestingScheme.revokeSignToCancelAgreement(agreementId+1);
           assert(false,"revokeSignToCancelAgreement should fail - due to wrong agreement id");
           }catch(ex){
             helpers.assertVMException(ex);
           }
          });

          it("revokeSignToCancelAgreement without signing before", async function() {
            var testSetup = await setup(accounts);
            var _signaturesReqToCancel = 2;
            var amountPerPeriod =3;
            var numberOfAgreedPeriods = 7;
            var _signersArray = [];
            for (var i=0;i<_signaturesReqToCancel;i++){
              _signersArray[i] = accounts[i];
            }

            await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
            var blockNumber = await (web3.utils.toBN(await web3.eth.getBlockNumber()));

            var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                           accounts[0],
                                                                           accounts[1],
                                                                           [blockNumber,
                                                                           amountPerPeriod,
                                                                           2,
                                                                           numberOfAgreedPeriods,
                                                                           11,
                                                                           _signaturesReqToCancel],
                                                                           _signersArray,{from:accounts[1]});
            var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
            assert.equal(agreementId,0);

            try{
            await testSetup.vestingScheme.revokeSignToCancelAgreement(agreementId);
            assert(false,"revokeSignToCancelAgreement should fail - accounts[0] did not signed.");
            }catch(ex){
              helpers.assertVMException(ex);
            }
           });

     it("collect log periodsFromStartingBlock < agreement.numOfAgreedPeriods", async function() {
       var testSetup = await setup(accounts);
       var beneficiary = accounts[2];
       var _signaturesReqToCancel = 5;
       var amountPerPeriod =3;
       var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
       var numberOfAgreedPeriods = 7;
       var _signersArray = [];
       var periodLength = 1;
       var cliffInPeriods = 0;
       for (var i=0;i<_signaturesReqToCancel;i++){
         _signersArray[i] = accounts[i];
       }

       await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
       var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                      beneficiary,
                                                                      accounts[1],
                                                                      [startingBlock,
                                                                      amountPerPeriod,
                                                                      periodLength,
                                                                      numberOfAgreedPeriods,
                                                                      cliffInPeriods,
                                                                      _signaturesReqToCancel],
                                                                      _signersArray,{from:accounts[1]});
       var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
       tx = await testSetup.vestingScheme.collect(agreementId,{from:beneficiary});
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "Collect");
       var balance = await testSetup.standardTokenMock.balanceOf(beneficiary);
       var periodsFromStartingBlock = Math.floor((await web3.eth.getBlockNumber()-startingBlock)/(periodLength));
       assert.equal(balance.toNumber(),periodsFromStartingBlock*amountPerPeriod);
      });

      it("collect log periodsFromStartingBlock >= agreement.numOfAgreedPeriods", async function() {
        var testSetup = await setup(accounts);
        var beneficiary = accounts[2];
        var _signaturesReqToCancel = 5;
        var amountPerPeriod =3;
        var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
        var numberOfAgreedPeriods = 2;
        var _signersArray = [];
        var periodLength = 1;
        var cliffInPeriods = 0;
        for (var i=0;i<_signaturesReqToCancel;i++){
          _signersArray[i] = accounts[i];
        }

        await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
        var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                       beneficiary,
                                                                       accounts[1],
                                                                       [startingBlock,
                                                                       amountPerPeriod,
                                                                       periodLength,
                                                                       numberOfAgreedPeriods,
                                                                       cliffInPeriods,
                                                                       _signaturesReqToCancel],
                                                                       _signersArray,{from:accounts[1]});
        var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
        tx = await testSetup.vestingScheme.collect(agreementId,{from:beneficiary});
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "Collect");
        var balance = await testSetup.standardTokenMock.balanceOf(beneficiary);
        //if (periodsFromStartingBlock >= numberOfAgreedPeriods){
            assert.equal(balance.toNumber(),numberOfAgreedPeriods*amountPerPeriod);
       });


    it("collect check periodsFromStartingBlock >= agreement.cliffInPeriods", async function() {
      var testSetup = await setup(accounts);
      var beneficiary = accounts[2];
      var _signaturesReqToCancel = 5;
      var amountPerPeriod =3;
      var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
      var numberOfAgreedPeriods = 7;
      var _signersArray = [];
      var periodLength = 1;
      var cliffInPeriods = 100;
      for (var i=0;i<_signaturesReqToCancel;i++){
        _signersArray[i] = accounts[i];
      }

      await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
      var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                     beneficiary,
                                                                     accounts[1],
                                                                     [startingBlock,
                                                                     amountPerPeriod,
                                                                     periodLength,
                                                                     numberOfAgreedPeriods,
                                                                     cliffInPeriods,
                                                                     _signaturesReqToCancel],
                                                                     _signersArray,{from:accounts[1]});
      var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
      try{
      await testSetup.vestingScheme.collect(agreementId,{from:beneficiary});
      assert(false,"collect should fail - due to cliff value ");
      }catch(ex){
        helpers.assertVMException(ex);
      }
     });

     it("collect from none beneficiary", async function() {
       var testSetup = await setup(accounts);
       var beneficiary = accounts[2];
       var _signaturesReqToCancel = 5;
       var amountPerPeriod =3;
       var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
       var numberOfAgreedPeriods = 7;
       var _signersArray = [];
       var periodLength = 1;
       var cliffInPeriods = 100;
       for (var i=0;i<_signaturesReqToCancel;i++){
         _signersArray[i] = accounts[i];
       }

       await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
       var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                      beneficiary,
                                                                      accounts[1],
                                                                      [startingBlock,
                                                                      amountPerPeriod,
                                                                      periodLength,
                                                                      numberOfAgreedPeriods,
                                                                      cliffInPeriods,
                                                                      _signaturesReqToCancel],
                                                                      _signersArray,{from:accounts[1]});
       var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
       try{
       await testSetup.vestingScheme.collect(agreementId,{from:accounts[1]});
       assert(false,"collect should fail - try to collect from none beneficiary ");
       }catch(ex){
         helpers.assertVMException(ex);
       }
      });

      it("collect update collectedPeriods", async function() {
        var testSetup = await setup(accounts);
        var beneficiary = accounts[2];
        var _signaturesReqToCancel = 5;
        var amountPerPeriod =3;
        var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
        var numberOfAgreedPeriods = 7;
        var _signersArray = [];
        var periodLength = 1;
        var cliffInPeriods = 0;
        for (var i=0;i<_signaturesReqToCancel;i++){
          _signersArray[i] = accounts[i];
        }

        await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});

        var tx = await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                       beneficiary,
                                                                       accounts[1],
                                                                      [startingBlock,
                                                                       amountPerPeriod,
                                                                       periodLength,
                                                                       numberOfAgreedPeriods,
                                                                       cliffInPeriods,
                                                                       _signaturesReqToCancel],
                                                                       _signersArray,{from:accounts[1]});
        var agreementId = await helpers.getValueFromLogs(tx, '_agreementId',1);
        await testSetup.vestingScheme.collect(agreementId,{from:beneficiary});
        var periodsFromStartingBlock = Math.floor((await web3.eth.getBlockNumber()-startingBlock)/(periodLength));
        var agreement = await testSetup.vestingScheme.agreements(agreementId);
        assert.equal(agreement[9],periodsFromStartingBlock);//collectedPeriods
       });

       it("collect update collectedPeriods and collect again", async function() {
         var testSetup = await setup(accounts);
         var beneficiary = accounts[2];
         var _signaturesReqToCancel = 5;
         var amountPerPeriod =3;
         var startingBlock =   await (web3.utils.toBN(await web3.eth.getBlockNumber()));
         var numberOfAgreedPeriods = 7;
         var _signersArray = [];
         var periodLength = 1;
         var cliffInPeriods = 0;
         for (var i=0;i<_signaturesReqToCancel;i++){
           _signersArray[i] = accounts[i];
         }

         await testSetup.standardTokenMock.approve(testSetup.vestingScheme.address,100,{from:accounts[1]});
         await testSetup.vestingScheme.createVestedAgreement(  testSetup.standardTokenMock.address,
                                                                        beneficiary,
                                                                        accounts[1],
                                                                        [startingBlock,
                                                                        amountPerPeriod,
                                                                        periodLength,
                                                                        numberOfAgreedPeriods,
                                                                        cliffInPeriods,
                                                                        _signaturesReqToCancel],
                                                                        _signersArray,{from:accounts[1]});
         for (i=0;i<numberOfAgreedPeriods;i++){
          await testSetup.vestingScheme.collect(0,{from:beneficiary});
          var periodsFromStartingBlock = Math.floor((await web3.eth.getBlockNumber()-startingBlock)/(periodLength));
          var balance = await testSetup.standardTokenMock.balanceOf(beneficiary);
          if (periodsFromStartingBlock < numberOfAgreedPeriods){
           assert.equal(balance.toNumber(),periodsFromStartingBlock*amountPerPeriod);
         }else {
           assert.equal(balance.toNumber(),numberOfAgreedPeriods*amountPerPeriod);
         }
       }
        });


});
