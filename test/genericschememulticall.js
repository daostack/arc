import * as helpers from './helpers';
const constants = require('./constants');
const GenericSchemeMultiCall = artifacts.require('./GenericSchemeMultiCall.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");

export class GenericSchemeParams {
  constructor() {
  }
}

const setupGenericSchemeParams = async function(
                                            genericScheme,
                                            accounts,
                                            contractWhitelist,
                                            genesisProtocol = false,
                                            tokenAddress = 0,
                                            avatar
                                            ) {
  var genericSchemeParams = new GenericSchemeParams();
  if (genesisProtocol === true){
      genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,tokenAddress,0,helpers.NULL_ADDRESS);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.genesisProtocol.address,
            genericSchemeParams.votingMachine.params,
            contractWhitelist);
    }
  else {
      genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,genericScheme.address);
      await genericScheme.initialize(
            avatar.address,
            genericSchemeParams.votingMachine.absoluteVote.address,
            genericSchemeParams.votingMachine.params,
            contractWhitelist);
  }
  return genericSchemeParams;
};

const setup = async function (accounts,contractsWhitelist,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
   testSetup.GenericSchemeMultiCall = await GenericSchemeMultiCall.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.reputationArray = [20,10,70];
   if (reputationAccount === 0) {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,1000,1000],testSetup.reputationArray);
   } else {
     testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],reputationAccount],[1000,1000,1000],testSetup.reputationArray);
   }
   testSetup.genericSchemeParams= await setupGenericSchemeParams(testSetup.GenericSchemeMultiCall,accounts,contractsWhitelist,genesisProtocol,tokenAddress,testSetup.org.avatar);
   var permissions = "0x00000010";


   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.GenericSchemeMultiCall.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");

   return testSetup;
};

const createCallToActionMock = async function(_avatar,_actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods.test2(_avatar).encodeABI();
};

const createCallToTokenApproval = async function(_token,_spender,_amount) {
  return await new web3.eth.Contract(_token.abi).methods.approve(_spender,_amount).encodeABI();
};

contract('GenericSchemeMultiCall', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("execute proposeVote with multiple calls with votingMachine -positive decision", async function() {
      var actionMock =await ActionMock.new();
      var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
      var testSetup = await setup(accounts,[actionMock.address,accounts[3]],0,true,standardTokenMock.address);
      var encodedTokenApproval = await createCallToTokenApproval(standardTokenMock,accounts[3], 1000);
      var callData1 = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
      var tx = await testSetup.GenericSchemeMultiCall.proposeCalls(
        [actionMock.address,standardTokenMock.address],
        [callData1,encodedTokenApproval],
        [0,0],
        helpers.NULL_HASH);
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
      var proposal = await testSetup.GenericSchemeMultiCall.proposals(proposalId);
      assert.equal(proposal.exist,true);
      assert.equal(proposal.passed,false);
      await testSetup.genericSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.GenericSchemeMultiCall.execute(proposalId);
      await testSetup.GenericSchemeMultiCall.getPastEvents('ProposalCallExecuted', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"ProposalCallExecuted");
            assert.equal(events[0].args._proposalId,proposalId);
            assert.equal(events[1].event,"ProposalCallExecuted");
            assert.equal(events[1].args._proposalId,proposalId);
      });
    });

    it("cannot init without contract whitelist", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var genericSchemeMultiCall =await GenericSchemeMultiCall.new();

        try {
          await genericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            accounts[0],
            helpers.SOME_HASH,
            []
          );
          assert(false, "contractWhitelist cannot be empty");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("cannot init twice", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        try {
          await testSetup.GenericSchemeMultiCall.initialize(
            testSetup.org.avatar.address,
            accounts[0],
            helpers.SOME_HASH,
            [accounts[0]]
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }
    });

    it("can init with multiple contracts on whitelist", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,[actionMock.address]);
        var genericSchemeMultiCall =await GenericSchemeMultiCall.new();
        var tx = await genericSchemeMultiCall.initialize(
              testSetup.org.avatar.address,
              accounts[0],
              helpers.SOME_HASH,
              [accounts[0],accounts[1],accounts[2],accounts[3]]
        );
        assert.equal(tx.logs.length,1);
        assert.equal(tx.logs[0].event,"WhiteListedContracts");
        assert.equal(tx.logs[0].args._contractsWhitelist[0],accounts[0]);
        assert.equal(tx.logs[0].args._contractsWhitelist[1],accounts[1]);
        assert.equal(tx.logs[0].args._contractsWhitelist[2],accounts[2]);
        assert.equal(tx.logs[0].args._contractsWhitelist[3],accounts[3]);

    });

});
