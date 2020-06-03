const helpers = require("./helpers");
const GenericScheme = artifacts.require('./GenericScheme.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const ActionMock = artifacts.require("./ActionMock.sol");
const Wallet = artifacts.require("./Wallet.sol");


class GenericSchemeParams {
  constructor() {
  }
}

var registration;
const setupGenericSchemeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token,
                                              contractToCall,
                                              _packageVersion = [0,1,0]
                                            ) {
  var genericSchemeParams = new GenericSchemeParams();

  if (genesisProtocol === true) {
    genericSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    genericSchemeParams.initdata = await new web3.eth.Contract(registration.genericScheme.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            genericSchemeParams.votingMachine.uintArray,
                            genericSchemeParams.votingMachine.voteOnBehalf,
                            registration.daoFactory.address,
                            token,
                            _packageVersion,
                            "GenesisProtocol",
                            contractToCall)
                          .encodeABI();
    } else {
  genericSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  genericSchemeParams.initdata = await new web3.eth.Contract(registration.genericScheme.abi)
                        .methods
                        .initialize(helpers.NULL_ADDRESS,
                          genericSchemeParams.votingMachine.uintArray,
                          genericSchemeParams.votingMachine.voteOnBehalf,
                          registration.daoFactory.address,
                          token,
                          _packageVersion,
                          "AbsoluteVote",
                          contractToCall)
                        .encodeABI();
  }
  return genericSchemeParams;
};

const setup = async function (accounts,contractToCall = 0,reputationAccount=0,genesisProtocol = false,tokenAddress=helpers.NULL_ADDRESS) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [20,10,70];
  var account2;
  if (reputationAccount === 0) {
     account2 = accounts[2];
  } else {
     account2 = reputationAccount;
  }
  testSetup.proxyAdmin = accounts[5];
  testSetup.genericSchemeParams= await setupGenericSchemeParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     contractToCall
                     );

  var permissions = "0x0000001f";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      account2],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("GenericScheme")],
                                                                      testSetup.genericSchemeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.genericSchemeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData"
                                                                    );

  testSetup.genericScheme = await GenericScheme.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
  testSetup.genericSchemeParams.votingMachineInstance =
  await helpers.getVotingMachine(await testSetup.genericScheme.votingMachine(),genesisProtocol);
  return testSetup;
};

const createCallToActionMock = async function(_avatar,_actionMock) {
  return await new web3.eth.Contract(_actionMock.abi).methods.test2(_avatar).encodeABI();
};

contract('GenericScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("proposeCall log", async function() {
       var actionMock =await ActionMock.new();

       var testSetup = await setup(accounts,actionMock.address);

       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);

       var tx = await testSetup.genericScheme.proposeCall(
                                                           callData,0,helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewCallProposal");
    });

    it("execute proposeCall -no decision - proposal data delete", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.passed,false);
       assert.equal(organizationProposal.callData,null);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var actionMock =await ActionMock.new();
        var testSetup = await setup(accounts,actionMock.address);
        var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
        var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal[0],callData,helpers.NULL_HASH);
        await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal.callData,null);//new contract address
     });

    it("execute proposeVote -positive decision - destination reverts", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var callData = await createCallToActionMock(helpers.NULL_ADDRESS,actionMock);
       var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //actionMock revert because msg.sender is not the _addr param at actionMock thpugh the generic scheme not .
       var organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.exist,true);//new contract address
       assert.equal(organizationProposal.passed,true);//new contract address
       //can call execute
       await testSetup.genericScheme.execute( proposalId);
    });


    it("execute proposeVote -positive decision - destination reverts and then active", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       var activationTime = (await web3.eth.getBlock("latest")).timestamp + 1000;
       await actionMock.setActivationTime(activationTime);
       var callData = await new web3.eth.Contract(actionMock.abi).methods.test3().encodeABI();
       var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //actionMock revert because msg.sender is not the _addr param at actionMock thpugh the generic scheme not .
       var organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.exist,true);//new contract address
       assert.equal(organizationProposal.passed,true);//new contract address
       //can call execute
       await testSetup.genericScheme.execute( proposalId);
       await helpers.increaseTime(1001);
       await testSetup.genericScheme.execute( proposalId);

       organizationProposal = await testSetup.genericScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.exist,false);//new contract address
       assert.equal(organizationProposal.passed,false);//new contract address
       try {
         await testSetup.genericScheme.execute( proposalId);
         assert(false, "cannot call execute after it been executed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });



    it("execute proposeVote without return value-positive decision - check action", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.genericScheme.proposeCall(encodeABI,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

    });

    it("execute should fail if not executed from votingMachine", async function() {
       var actionMock =await ActionMock.new();
       var testSetup = await setup(accounts,actionMock.address);
       const encodeABI = await new web3.eth.Contract(actionMock.abi).methods.withoutReturnValue(testSetup.org.avatar.address).encodeABI();
       var tx = await testSetup.genericScheme.proposeCall(encodeABI,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       try {
         await testSetup.genericScheme.execute( proposalId);
         assert(false, "execute should fail if not executed from votingMachine");
       } catch(error) {
         helpers.assertVMException(error);
       }

    });

    it("execute proposeVote -positive decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,actionMock.address,0,true,standardTokenMock.address);
       var value = 123;
       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericScheme.proposeCall(callData,value,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       //transfer some eth to avatar
       await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value: web3.utils.toWei('1', "ether")});
       assert.equal(await web3.eth.getBalance(actionMock.address),0);
       tx  = await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.genericScheme.getPastEvents('ProposalExecutedByVotingMachine', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
             assert.equal(events[0].args._param,1);
        });
        assert.equal(await web3.eth.getBalance(actionMock.address),value);
    });

    it("execute proposeVote -negative decision - check action - with GenesisProtocol", async function() {
       var actionMock =await ActionMock.new();
       var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
       var testSetup = await setup(accounts,actionMock.address,0,true,standardTokenMock.address);

       var callData = await createCallToActionMock(testSetup.org.avatar.address,actionMock);
       var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       tx  = await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.genericScheme.getPastEvents('ProposalExecutedByVotingMachine', {
             fromBlock: tx.blockNumber,
             toBlock: 'latest'
         })
         .then(function(events){
             assert.equal(events[0].event,"ProposalExecutedByVotingMachine");
             assert.equal(events[0].args._param,2);
        });
      });

      it("Wallet - execute proposeVote -positive decision - check action - with GenesisProtocol [ @skip-on-coverage ]", async function() {
         var wallet =await Wallet.new();
         await wallet.initialize(accounts[0]);
         await web3.eth.sendTransaction({from:accounts[0],to:wallet.address, value: web3.utils.toWei('1', "ether")});
         var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
         var testSetup = await setup(accounts,wallet.address,0,true,standardTokenMock.address);
         var callData = await new web3.eth.Contract(wallet.abi).methods.pay(accounts[1]).encodeABI();
         var tx = await testSetup.genericScheme.proposeCall(callData,0,helpers.NULL_HASH);
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
         assert.equal(await web3.eth.getBalance(wallet.address),web3.utils.toWei('1', "ether"));
         await testSetup.genericSchemeParams.votingMachineInstance.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
         assert.equal(await web3.eth.getBalance(wallet.address),web3.utils.toWei('1', "ether"));
         await wallet.transferOwnership(testSetup.org.avatar.address);
         await testSetup.genericScheme.execute( proposalId);
         assert.equal(await web3.eth.getBalance(wallet.address),0);
      });

      it("cannot init twice", async function() {
         var actionMock =await ActionMock.new();
         var testSetup = await setup(accounts,actionMock.address);

         try {
           await testSetup.genericScheme.initialize(
             helpers.NULL_ADDRESS,
               testSetup.genericSchemeParams.votingMachine.uintArray,
               testSetup.genericSchemeParams.votingMachine.voteOnBehalf,
               registration.daoFactory.address,
               helpers.NULL_ADDRESS,
               [0,1,0],
               "GenesisProtocol",
               helpers.NULL_ADDRESS
           );
           assert(false, "cannot init twice");
         } catch(error) {
           helpers.assertVMException(error);
         }

      });

});
