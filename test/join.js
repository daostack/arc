const helpers = require("./helpers");
const Join = artifacts.require("./Join.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const Avatar = artifacts.require("./Avatar.sol");
const Redeemer = artifacts.require("./Redeemer.sol");

class JoinParams {
  constructor() {
  }
}

const addMember = async function(accounts,_testSetup,_fee,_from) {
  var tx = await _testSetup.join.proposeToJoin(
                                                       "description-hash",
                                                       _fee,
                                                       {value:_fee,from:_from});

  //Vote with reputation to trigger execution
  var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
  await _testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
  return tx;
};

const avatarBalance = async function(_testSetup) {
 let avatar = await Avatar.at(_testSetup.org.avatar.address);
 var vault =  await avatar.vault();
 return  await web3.eth.getBalance(vault);
};

const setupJoin = async function(
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            _fundingToken,
                                            _minFeeToJoin,
                                            _memberReputation,
                                            _fundingGoal,
                                            _fundingGoalDeadline,
                                            ) {
  var joinParams = new JoinParams();

  if (genesisProtocol === true) {
    joinParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    joinParams.initdata = await new web3.eth.Contract(registration.join.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            joinParams.votingMachine.genesisProtocol.address,
                            joinParams.votingMachine.uintArray,
                            joinParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH,
                            _fundingToken,
                            _minFeeToJoin,
                            _memberReputation,
                            _fundingGoal,
                           _fundingGoalDeadline)
                          .encodeABI();
    } else {
  joinParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  joinParams.initdata = await new web3.eth.Contract(registration.join.abi)
                        .methods
                        .initialize(helpers.NULL_ADDRESS,
                          joinParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          joinParams.votingMachine.params,
                          _fundingToken,
                          _minFeeToJoin,
                          _memberReputation,
                          _fundingGoal,
                         _fundingGoalDeadline)
                        .encodeABI();
  }
  return joinParams;
};
var registration;
const setup = async function (accounts,
                              ethFunding = false,
                              genesisProtocol = false,
                              tokenAddress=helpers.NULL_ADDRESS,
                              minFeeToJoin = 100,
                              memberReputation = 100,
                              fundingGoal = 1000,
                              fundingGoalDeadline = 3000) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[0],100000);
  registration = await helpers.registerImplementation();
  testSetup.reputationArray = [7000];
  testSetup.proxyAdmin = accounts[5];
  testSetup.fundingGoalDeadline = (await web3.eth.getBlock("latest")).timestamp + fundingGoalDeadline;
  testSetup.minFeeToJoin = minFeeToJoin;
  testSetup.memberReputation = memberReputation;
  testSetup.fundingGoal = fundingGoal;

  var fundPath = testSetup.standardTokenMock.address;
  if (ethFunding === true) {
     fundPath = helpers.NULL_ADDRESS;
  }

  testSetup.joinParams= await setupJoin(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     fundPath,
                     minFeeToJoin,
                     memberReputation,
                     fundingGoal,
                     testSetup.fundingGoalDeadline);

  var permissions = "0x00000000";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[2]],
                                                                      [0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("Join")],
                                                                      testSetup.joinParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.joinParams.initdata)],
                                                                      [permissions],
                                                                      "metaData");

  testSetup.join = await Join.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));

  await testSetup.standardTokenMock.transfer(accounts[3],10000);

  return testSetup;
};
contract('Join', accounts => {

    it("initialize", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.join.votingMachine(),testSetup.joinParams.votingMachine.absoluteVote.address);
       assert.equal(await testSetup.join.fundingGoalDeadline(),testSetup.fundingGoalDeadline);
    });

    it("propose log", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});

      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                            {from:accounts[3]});

      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.join.address),testSetup.minFeeToJoin);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "JoinInProposal");
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(tx.logs[0].args._descriptionHash, "description-hash");
      assert.equal(tx.logs[0].args._proposedMember, accounts[3]);
      assert.equal(tx.logs[0].args._feeAmount, testSetup.minFeeToJoin);
     });

     it("propose log with eth", async function() {
       var testSetup = await setup(accounts,true);

       var tx = await testSetup.join.proposeToJoin(
                                                            "description-hash",
                                                            testSetup.minFeeToJoin,

                                                            {value:testSetup.minFeeToJoin,from:accounts[3]});

       assert.equal(await web3.eth.getBalance(testSetup.join.address),testSetup.minFeeToJoin);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "JoinInProposal");
       assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
       assert.equal(tx.logs[0].args._descriptionHash, "description-hash");
       assert.equal(tx.logs[0].args._proposedMember, accounts[3]);
       assert.equal(tx.logs[0].args._feeAmount, testSetup.minFeeToJoin);
      });

      it("propose with eth should be equal to _feeAmount", async function() {
        var testSetup = await setup(accounts,true);

         try {
           await testSetup.join.proposeToJoin(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin,

                                                    {value:testSetup.minFeeToJoin+1,from:accounts[3]});
              assert(false, 'should be equal to _feeAmount');
           } catch (ex) {
              helpers.assertVMException(ex);
          }
       });


    it("propose cannot add a member if already is a candidate", async function() {
      var testSetup = await setup(accounts);

      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin*2);
      await testSetup.join.proposeToJoin(
                                               "description-hash",
                                                testSetup.minFeeToJoin);

      try {
        await testSetup.join.proposeToJoin(
                                                 "description-hash",
                                                  testSetup.minFeeToJoin);
           assert(false, 'proposer already is a candidate');
        } catch (ex) {
           helpers.assertVMException(ex);
       }
     });

     it("propose cannot add a member if member allready has reputation", async function() {
       var testSetup = await setup(accounts);
       var candidate = accounts[3];
       await testSetup.standardTokenMock.approve(testSetup.join.address,
                                                 testSetup.minFeeToJoin*2,
                                                 {from:candidate});
       var tx = await testSetup.join.proposeToJoin(
                                                          "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:candidate});
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

       await testSetup.join.redeemReputation(proposalId);

       try {
       await testSetup.join.proposeToJoin(
                                                "description-hash",
                                                 testSetup.minFeeToJoin,
                                                 {from:candidate});
            assert(false, 'proposer already have reputation');
         } catch (ex) {
            helpers.assertVMException(ex);
        }
      });


    it("proposeJoin check minFeeToJoin", async() => {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin);
      try {
         await testSetup.join.proposeToJoin(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin-1);
         assert(false, 'minFeeToJoin');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
  });

    it("proposeJoin check minFeeToJoin with eth", async() => {
      var testSetup = await setup(accounts,true);
      try {
         await testSetup.join.proposeToJoin(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin-1,
                                                    {value:testSetup.minFeeToJoin-1});
         assert(false, 'minFeeToJoin');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
  });

    it("execute proposeJoin yes ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var state = await testSetup.join.membersState(accounts[3]);
      assert.equal(state,2);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.join.address),0);
     });

    it("execute proposeJoin yes with eth", async function() {
      var testSetup = await setup(accounts,true);
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {value:testSetup.minFeeToJoin,from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var state = await testSetup.join.membersState(accounts[3]);
      assert.equal(state,2);
      assert.equal(await avatarBalance(testSetup),testSetup.minFeeToJoin);
      assert.equal(await web3.eth.getBalance(testSetup.join.address),0);
     });

     it("execute proposeJoin no", async function() {
       var testSetup = await setup(accounts);
       await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
       var tx = await testSetup.join.proposeToJoin(
                                                            "description-hash",
                                                            testSetup.minFeeToJoin,
                                                            {from:accounts[3]});

       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var state = await testSetup.join.membersState(accounts[3]);
       assert.equal(state,3);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.join.address),0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[3]),10000);
      });


   it("execute proposeJoin no with eth", async function() {
     var testSetup = await setup(accounts,true);
     var tx = await testSetup.join.proposeToJoin(
                                                          "description-hash",
                                                          testSetup.minFeeToJoin,
                                                          {value:testSetup.minFeeToJoin,from:accounts[3]});

     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     var balanceBefore = await web3.eth.getBalance(accounts[3]);
     await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     var state = await testSetup.join.membersState(accounts[3]);
     assert.equal(state,3);
     assert.equal(await avatarBalance(testSetup),0);
     assert.equal(await web3.eth.getBalance(testSetup.join.address),0);
     var BN = web3.utils.BN;
     var a = new BN(balanceBefore);
     var b = new BN(testSetup.minFeeToJoin);
     var expectedBalance = a.add(b);
     assert.equal(await web3.eth.getBalance(accounts[3]),expectedBalance);
    });

    it("reputation redeem ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.join.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.memberReputation);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.memberReputation);
      try {
         await testSetup.join.redeemReputation(proposalId);
         assert(false, 'cannot redeem twice');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("reputation redeem memberReputation 0", async function() {
      var testSetup = await setup(accounts, false, false, helpers.NULL_ADDRESS, 100, 0);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.join.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.minFeeToJoin);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.minFeeToJoin);
    });

    it("reputation redeem + genesisProtocol", async function() {
      var testSetup = await setup(accounts,false,true);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      var arcUtils = await Redeemer.new();
      tx = await arcUtils.redeemJoin(testSetup.join.address,
                                             testSetup.joinParams.votingMachine.genesisProtocol.address,
                                             proposalId,
                                             accounts[2]);

      await testSetup.join.getPastEvents('RedeemReputation', {
           fromBlock: tx.blockNumber,
           toBlock: 'latest'
        })
        .then(function(events){
          assert.equal(events.length,0);
        });
      await testSetup.joinParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await arcUtils.redeemJoin(testSetup.join.address,
                                            testSetup.joinParams.votingMachine.genesisProtocol.address,
                                            proposalId,
                                            accounts[2]);

      await testSetup.join.getPastEvents('RedeemReputation', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"RedeemReputation");
            assert.equal(events[0].args._amount, testSetup.memberReputation);

        });
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.memberReputation);
      try {
         await testSetup.join.redeemReputation(proposalId);
         assert(false, 'cannot redeem twice');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("reputation cannot redeemed ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      try {
         await testSetup.join.redeemReputation(proposalId);
         assert(false, 'reputation cannot redeemed');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("checkFundedBeforeDeadLine ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.fundingGoal,{from:accounts[3]});
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.join.FUNDED_BEFORE_DEADLINE_KEY();
      let value = await testSetup.join.FUNDED_BEFORE_DEADLINE_VALUE();
      assert.equal(await avatar.db(key),"");

      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.fundingGoal,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.join.getPastEvents('FundedBeforeDeadline', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"FundedBeforeDeadline");
        });
      assert.equal(await avatar.db(key),value);
    });


    it("checkFundedBeforeDeadLine with eth", async function() {
      var testSetup = await setup(accounts,true);
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = "FUNDED_BEFORE_DEADLINE";
      let value = "TRUE";
      assert.equal(await avatar.db(key),"");

      var tx = await testSetup.join.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.fundingGoal,
                                                           {value:testSetup.fundingGoal,from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.joinParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.join.getPastEvents('FundedBeforeDeadline', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"FundedBeforeDeadline");
        });
      assert.equal(await avatar.db(key),value);
    });

    it("checkFundedBeforeDeadLine after deadline", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.fundingGoal,{from:accounts[3]});
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = "FUNDED_BEFORE_DEADLINE";
      assert.equal(await avatar.db(key),"");
      await helpers.increaseTime(testSetup.fundingGoalDeadline);
      await addMember(accounts,testSetup,testSetup.fundingGoal,accounts[3]);
      assert.equal(await avatar.db(key),"");
    });

    it("checkFundedBeforeDeadLine after deadline with eth", async function() {
      var testSetup = await setup(accounts,true);
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = "FUNDED_BEFORE_DEADLINE";
      assert.equal(await avatar.db(key),"");
      await helpers.increaseTime(testSetup.fundingGoalDeadline);
      await addMember(accounts,testSetup,testSetup.fundingGoal,accounts[3]);
      assert.equal(await avatar.db(key),"");
    });


    it("can fund the dao directly and set the goal", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.join.address,testSetup.fundingGoal,{from:accounts[3]});
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.join.FUNDED_BEFORE_DEADLINE_KEY();
      await testSetup.join.FUNDED_BEFORE_DEADLINE_VALUE();
      assert.equal(await avatar.db(key),"");
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,testSetup.fundingGoal-1);
      var tx = await testSetup.join.setFundingGoalReachedFlag();
      await testSetup.join.getPastEvents('FundedBeforeDeadline', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events.length,0);
        });
        //now fill up the funding goal..
        await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,1);
        tx = await testSetup.join.setFundingGoalReachedFlag();
        await testSetup.join.getPastEvents('FundedBeforeDeadline', {
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"FundedBeforeDeadline");
          });
    });

});
