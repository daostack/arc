import * as helpers from './helpers';
const constants = require('./constants');
const ContributionRewardExt = artifacts.require("./ContributionRewardExt.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const DAOTracker = artifacts.require("./DAOTracker.sol");
const Competition = artifacts.require("./Competition.sol");

export class ContributionRewardParams {
  constructor() {
  }
}

const setupContributionRewardParams = async function(
                                            contributionReward,
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            avatar,
                                            redeemer
                                            ) {
  var contributionRewardParams = new ContributionRewardParams();
  if (genesisProtocol === true) {
    contributionRewardParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,avatar,helpers.NULL_ADDRESS);
    await contributionReward.initialize(   avatar.address,
                                           contributionRewardParams.votingMachine.genesisProtocol.address,
                                           contributionRewardParams.votingMachine.params,
                                           redeemer);
    } else {
  contributionRewardParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50,contributionReward.address);
  await contributionReward.initialize(
                                         avatar.address,
                                         contributionRewardParams.votingMachine.absoluteVote.address,
                                         contributionRewardParams.votingMachine.params,
                                         redeemer
                                         );
  }
  return contributionRewardParams;
};

const setup = async function (accounts,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.standardTokenMock = await ERC20Mock.new(accounts[1],100000);
   testSetup.contributionRewardExt = await ContributionRewardExt.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   var daoTracker = await DAOTracker.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,daoTracker.address,{gas:constants.ARC_GAS_LIMIT});
   if (genesisProtocol) {
      testSetup.reputationArray = [1000,100,0];
   } else {
      testSetup.reputationArray = [2000,5000,7000];
   }
   testSetup.org = await helpers.setupOrganizationWithArrays(testSetup.daoCreator,[accounts[0],accounts[1],accounts[2]],[1000,0,0],testSetup.reputationArray);
   testSetup.competition =  await Competition.new();
   testSetup.competition.initialize(testSetup.contributionRewardExt.address);
   testSetup.admin = accounts[0];
   testSetup.contributionRewardExtParams= await setupContributionRewardParams(
                      testSetup.contributionRewardExt,
                      accounts,genesisProtocol,
                      tokenAddress,
                      testSetup.org.avatar,
                      testSetup.competition.address);
   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                        [testSetup.contributionRewardExt.address],
                                        [helpers.NULL_HASH],[permissions],"metaData");


   return testSetup;
};

const proposeCompetition = async function(
                                          _testSetup,
                                          _descriptionHash = "description-hash",
                                          _reputationChange = 10,
                                          _rewards = [1,2,3],
                                          _rewardSplit = [50,25,15,10],
                                          _startTime = 10,
                                          _votingStartTime = 600,
                                          _endTime = 1200,
                                          _maxNumberOfVotesPerVoter = 3,
                                          _suggestionsEndTime = 1200,
                                          _admin = helpers.NULL_ADDRESS
                                          ) {

    var block = await web3.eth.getBlock("latest");
    _testSetup.startTime = block.timestamp + _startTime;
    _testSetup.votingStartTime = block.timestamp + _votingStartTime;
    _testSetup.endTime = block.timestamp + _endTime;
    _testSetup.suggestionsEndTime = block.timestamp + _suggestionsEndTime;
    var sender = _testSetup.admin;
    if (_admin !== helpers.NULL_ADDRESS) {
        sender = _admin;
    }
    var tx = await _testSetup.competition.proposeCompetition(
                                   _descriptionHash,
                                   _reputationChange,
                                   _rewards,
                                   _testSetup.standardTokenMock.address,
                                   _rewardSplit,
                                   [_testSetup.startTime,
                                   _testSetup.votingStartTime,
                                   _testSetup.endTime,
                                   _maxNumberOfVotesPerVoter,
                                   _testSetup.suggestionsEndTime],
                                   (_admin !== helpers.NULL_ADDRESS),
                                   {from:sender}
                                );

    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewCompetitionProposal");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._numberOfWinners,_rewardSplit.length);
    assert.equal(tx.logs[0].args._rewardSplit[0],_rewardSplit[0]);
    assert.equal(tx.logs[0].args._rewardSplit[1],_rewardSplit[1]);
    assert.equal(tx.logs[0].args._rewardSplit[2],_rewardSplit[2]);
    assert.equal(tx.logs[0].args._rewardSplit[3],_rewardSplit[3]);
    assert.equal(tx.logs[0].args._startTime,_testSetup.startTime);
    assert.equal(tx.logs[0].args._votingStartTime,_testSetup.votingStartTime);
    assert.equal(tx.logs[0].args._endTime,_testSetup.endTime);
    assert.equal(tx.logs[0].args._maxNumberOfVotesPerVoter,_maxNumberOfVotesPerVoter);
    assert.equal(tx.logs[0].args._contributionRewardExt,_testSetup.contributionRewardExt.address);
    assert.equal(tx.logs[0].args._suggestionsEndTime,_testSetup.suggestionsEndTime);
    if (_admin !== helpers.NULL_ADDRESS) {
      assert.equal(tx.logs[0].args._admin,sender);
    } else {
      assert.equal(tx.logs[0].args._admin,helpers.NULL_ADDRESS);
    }

    return proposalId;
};


contract('Competition', accounts => {

    it("proposeCompetition log", async function() {
      var testSetup = await setup(accounts);
      await proposeCompetition(testSetup);

      var descriptionHash = "description-hash";
      var reputationChange = 10;
      var rewards = [1,2,3];
      var rewardSplit = new Array(101).fill(0);
      var startTime = 0;
      var votingStartTime = 600;
      var endTime = 1200;
      rewardSplit[0]= 100;
      try {

             await proposeCompetition(testSetup,
                                      descriptionHash,
                                      reputationChange,
                                      rewards,
                                      rewardSplit);
             assert(false, 'number of winners should be <= 100');
        } catch (ex) {
             helpers.assertVMException(ex);
       }
       rewardSplit = [50,25,15,0];
       try {

              await proposeCompetition(testSetup,
                                       descriptionHash,
                                       reputationChange,
                                       rewards,
                                       rewardSplit);
              assert(false, 'total reward split should be 100%');
         } catch (ex) {
              helpers.assertVMException(ex);
        }
        rewardSplit = [50,25,15,10];

        try {

               await proposeCompetition(testSetup,
                                        descriptionHash,
                                        reputationChange,
                                        rewards,
                                        rewardSplit,
                                        startTime,
                                        endTime);//votingStartTime
               assert(false, '_votingStartTime < _endTime');
          } catch (ex) {
               helpers.assertVMException(ex);
         }

         try {

                await proposeCompetition(testSetup,
                                         descriptionHash,
                                         reputationChange,
                                         rewards,
                                         rewardSplit,
                                         votingStartTime,//startTime
                                         votingStartTime-1);//votingStartTime
                assert(false, '_votingStartTime >= _startTime,');
           } catch (ex) {
                helpers.assertVMException(ex);
          }

          try {

                 await proposeCompetition(testSetup,
                                          descriptionHash,
                                          reputationChange,
                                          rewards,
                                          rewardSplit,
                                          startTime,//startTime
                                          votingStartTime,
                                          endTime,
                                          0);
                 assert(false, 'maxNumberOfVotesPerVoter > 0');
            } catch (ex) {
                 helpers.assertVMException(ex);
           }
     });

     it("suggest", async function() {
       var testSetup = await setup(accounts);
       var proposalId = await proposeCompetition(testSetup);
       await helpers.increaseTime(20);
       var tx = await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewSuggestion");
       assert.equal(tx.logs[0].args._suggestionId,1);
       assert.equal(tx.logs[0].args._descriptionHash,"suggestion");
      });

      it("suggest only admin", async function() {
        var testSetup = await setup(accounts);
        var admin = accounts[1];
        var proposalId = await proposeCompetition(testSetup,
          "description-hash",10,[1,2,3],[50,25,15,10],10,600,1200,3,1200,admin);
        await helpers.increaseTime(20);
        try {
               await testSetup.competition.suggest(proposalId,"suggestion",accounts[3]);
               assert(false, 'only admin can suggest');
          } catch (ex) {
               helpers.assertVMException(ex);
         }
        var tx = await testSetup.competition.suggest(proposalId,"suggestion",accounts[3],{from:admin});
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, "NewSuggestion");
        assert.equal(tx.logs[0].args._suggestionId,1);
        assert.equal(tx.logs[0].args._descriptionHash,"suggestion");
        assert.equal(tx.logs[0].args._beneficiary,accounts[3]);
       });

    it("cannot suggest after suggestionEndTime", async function() {
      var descriptionHash = "description-hash";
      var reputationChange = 10;
      var rewards = [1,2,3];
      var rewardSplit = [100];
      var startTime = 10;
      var votingStartTime = 600;
      var endTime = 1200;
      var maxNumberOfVotesPerVoter = 3;
      var testSetup = await setup(accounts);
      var proposalId = await proposeCompetition(testSetup,
                               descriptionHash,
                               reputationChange,
                               rewards,
                               rewardSplit,
                               startTime,
                               votingStartTime,
                               endTime,
                               maxNumberOfVotesPerVoter,
                               200);//suggestionEndTime
      await helpers.increaseTime(20);//increase time for suggestion
      await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
      //increase time after suggestion end time
      await helpers.increaseTime(250);
      try {

             await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
             assert(false, 'cannot suggest after suggestionEndTime');
        } catch (ex) {
             helpers.assertVMException(ex);
       }

    });

    it("cannot suggest before start time", async function() {
      var testSetup = await setup(accounts);
      var descriptionHash = "description-hash";
      var reputationChange = 10;
      var rewards = [1,2,3];
      var rewardSplit = [0,50,25,25];
      var proposalId = await proposeCompetition(testSetup,
                                  descriptionHash,
                                  reputationChange,
                                  rewards,
                                  rewardSplit,
                                  20//startTime
                                 );//votingStartTime
      try {

             await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
             assert(false, 'cannot suggest before start time');
        } catch (ex) {
             helpers.assertVMException(ex);
       }
       await helpers.increaseTime(20);
       await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
     });

     it("cannot suggest after competition end", async function() {
       var testSetup = await setup(accounts);
       var proposalId = await proposeCompetition(testSetup);//votingStartTime
       await helpers.increaseTime(20);
       await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
       await helpers.increaseTime(1200+100);
       try {
              await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
              assert(false, 'cannot suggest after competition end');
         } catch (ex) {
              helpers.assertVMException(ex);
        }
      });

  it("vote", async function() {
    var testSetup = await setup(accounts);
    var proposalId = await proposeCompetition(testSetup);
    await helpers.increaseTime(20);
    var tx = await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    var suggestionId = tx.logs[0].args._suggestionId;

    try {
           await testSetup.competition.vote(suggestionId);
           assert(false, 'vote before voting start time should fail');
      } catch (ex) {
           helpers.assertVMException(ex);
     }
     await helpers.increaseTime(650);

    try {
           await testSetup.competition.vote(suggestionId+1);
           assert(false, 'vote on none valid suggestion');
      } catch (ex) {
           helpers.assertVMException(ex);
     }
    var proposal =  await testSetup.competition.proposals(proposalId);
    tx = await testSetup.competition.vote(suggestionId);

    try {
           await testSetup.competition.vote(suggestionId);
           assert(false, 'can vote only one time on each suggestion');
      } catch (ex) {
           helpers.assertVMException(ex);
     }

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "SnapshotBlock");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._snapshotBlock,tx.logs[0].blockNumber);

    assert.equal(tx.logs[1].event, "NewVote");
    assert.equal(tx.logs[1].args._suggestionId,1);
    assert.equal(tx.logs[1].args._reputation,testSetup.reputationArray[0]);

    //first vote set the snapshotBlock
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.vote(2);
    proposal =  await testSetup.competition.proposals(proposalId);
    assert.equal(proposal.snapshotBlock, tx.logs[0].blockNumber);

    //3rd suggestion
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    //4th suggestion
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.vote(3);

    try {
           await testSetup.competition.vote(4);
           assert(false, 'cannot vote more than allowed per voter');
      } catch (ex) {
           helpers.assertVMException(ex);
     }

   });


   it("total votes", async function() {
     var testSetup = await setup(accounts);
     var proposalId = await proposeCompetition(testSetup);
     await helpers.increaseTime(20);
     var tx = await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
     var suggestionId = tx.logs[0].args._suggestionId;
     await helpers.increaseTime(650);
     await testSetup.competition.vote(suggestionId);
     await testSetup.competition.vote(suggestionId,{from:accounts[1]});
     await testSetup.competition.vote(suggestionId,{from:accounts[2]});
     var suggestion =  await testSetup.competition.suggestions(suggestionId);
     assert.equal(suggestion.totalVotes, testSetup.reputationArray[0] +testSetup.reputationArray[1]+testSetup.reputationArray[2]);
   });

   it("getOrderedIndexOfSuggestion", async function() {
     var testSetup = await setup(accounts);
     var proposalId = await proposeCompetition(testSetup);
     await helpers.increaseTime(20);
     for (var i=0;i<20;i++) {
         //submit 20 suggestion
        await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
     }
     await helpers.increaseTime(650);
     await testSetup.competition.vote(10,{from:accounts[0]});
     await testSetup.competition.vote(16,{from:accounts[2]});
     await testSetup.competition.vote(5,{from:accounts[1]});

     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(10),2);
     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(5),1);
     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(16),0);

   });

   it("getOrderedIndexOfSuggestion equality case", async function() {
     var testSetup = await setup(accounts);
     var proposalId = await proposeCompetition(testSetup);
     await helpers.increaseTime(20);
     for (var i=0;i<20;i++) {
         //submit 20 suggestion
        await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
     }
     await helpers.increaseTime(650);
     await testSetup.competition.vote(10,{from:accounts[1]});
     await testSetup.competition.vote(16,{from:accounts[1]});
     await testSetup.competition.vote(5,{from:accounts[0]});

     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(10),0);
     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(16),0);
     assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(5),2);
     try {
            await testSetup.competition.getOrderedIndexOfSuggestion(0);
            assert(false, 'revert if suggestion does not exist');
       } catch (ex) {
            helpers.assertVMException(ex);
      }
      try {
             await testSetup.competition.getOrderedIndexOfSuggestion(21);
             assert(false, 'revert if suggestion does not exist');
        } catch (ex) {
             helpers.assertVMException(ex);
       }
       assert.equal(await testSetup.competition.getOrderedIndexOfSuggestion(1),3);
   });

  it("redeem", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
    var proposalId = await proposeCompetition(testSetup);
    await helpers.increaseTime(20);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    try {
            await testSetup.competition.redeem(1);
            assert(false, 'cannot redeem if no vote');
       } catch (ex) {
            helpers.assertVMException(ex);
      }
    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
    await testSetup.contributionRewardExt.redeem(proposalId,[true,true,true,true]);
    await helpers.increaseTime(650);
    await testSetup.competition.vote(1,{from:accounts[1]});
    try {
            await testSetup.competition.redeem(1);
            assert(false, 'cannot redeem if competion not ended yet');
       } catch (ex) {
            helpers.assertVMException(ex);
      }
    await helpers.increaseTime(650);
    var tx = await testSetup.competition.redeem(1);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,100);

    await testSetup.contributionRewardExt.getPastEvents('RedeemReputation', {
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"RedeemReputation");
          assert.equal(events[0].args._beneficiary,accounts[0]);
          assert.equal(events[0].args._amount,10);
      });

      await testSetup.contributionRewardExt.getPastEvents('RedeemEther', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"RedeemEther");
            assert.equal(events[0].args._beneficiary,accounts[0]);
            assert.equal(events[0].args._amount,2);
        });

        await testSetup.contributionRewardExt.getPastEvents('RedeemNativeToken', {
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"RedeemNativeToken");
              assert.equal(events[0].args._beneficiary,accounts[0]);
              assert.equal(events[0].args._amount,1);
          });

          await testSetup.contributionRewardExt.getPastEvents('RedeemExternalToken', {
                fromBlock: tx.blockNumber,
                toBlock: 'latest'
            })
            .then(function(events){
                assert.equal(events[0].event,"RedeemExternalToken");
                assert.equal(events[0].args._beneficiary,accounts[0]);
                assert.equal(events[0].args._amount,3);
            });

  });

  it("negative reputation change is not allowed", async function() {
    var testSetup = await setup(accounts);
    try {
          await proposeCompetition(testSetup,"description-hash",-1000);
          assert(false, 'negative reputation change is not allowed');
       } catch (ex) {
            helpers.assertVMException(ex);
      }
    await proposeCompetition(testSetup,"description-hash",0);
  });

  it("redeem multipe suggestions", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,3000,{from:accounts[1]});
    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:2000});
    var proposalId = await proposeCompetition(testSetup,"description-hash",1000,[1000,2000,3000]);
    await helpers.increaseTime(20);

    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);

    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
    await testSetup.contributionRewardExt.redeem(proposalId,[true,true,true,true]);
    await helpers.increaseTime(650);
    await testSetup.competition.vote(1,{from:accounts[0]});
    await testSetup.competition.vote(2,{from:accounts[1]});
    await testSetup.competition.vote(3,{from:accounts[2]});

    await helpers.increaseTime(650);
    var tx = await testSetup.competition.redeem(1);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,18);

    await testSetup.contributionRewardExt.getPastEvents('RedeemReputation', {
          fromBlock: tx.blockNumber,
          toBlock: 'latest'
      })
      .then(function(events){
          assert.equal(events[0].event,"RedeemReputation");
          assert.equal(events[0].args._beneficiary,accounts[0]);
          assert.equal(events[0].args._amount,180);
      });

      await testSetup.contributionRewardExt.getPastEvents('RedeemEther', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"RedeemEther");
            assert.equal(events[0].args._beneficiary,accounts[0]);
            assert.equal(events[0].args._amount,(2000*18/100));
        });

        await testSetup.contributionRewardExt.getPastEvents('RedeemNativeToken', {
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"RedeemNativeToken");
              assert.equal(events[0].args._beneficiary,accounts[0]);
              assert.equal(events[0].args._amount,(1000*18/100));
          });

          await testSetup.contributionRewardExt.getPastEvents('RedeemExternalToken', {
                fromBlock: tx.blockNumber,
                toBlock: 'latest'
            })
            .then(function(events){
                assert.equal(events[0].event,"RedeemExternalToken");
                assert.equal(events[0].args._beneficiary,accounts[0]);
                assert.equal(events[0].args._amount,(3000*18/100));
            });
      tx = await testSetup.competition.redeem(2);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "Redeem");
      assert.equal(tx.logs[0].args._proposalId,proposalId);
      assert.equal(tx.logs[0].args._rewardPercentage,28);

      try {
              await testSetup.competition.sendLeftOverFunds(proposalId);
              assert(false, 'cannot sendLeftOverFunds because not all proposals redeemed yet');
         } catch (ex) {
              helpers.assertVMException(ex);
        }

      tx = await testSetup.competition.redeem(3);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "Redeem");
      assert.equal(tx.logs[0].args._proposalId,proposalId);
      assert.equal(tx.logs[0].args._rewardPercentage,53);

      var proposal = await testSetup.contributionRewardExt.organizationProposals(proposalId);

      tx = await testSetup.competition.sendLeftOverFunds(proposalId);
      await testSetup.contributionRewardExt.getPastEvents('RedeemExternalToken', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events[0].event,"RedeemExternalToken");
            assert.equal(events[0].args._beneficiary,testSetup.org.avatar.address);
            assert.equal(events[0].args._amount.toNumber(),proposal.externalTokenRewardLeft.toNumber());
        });

  });

  it("redeem multipe suggestions - multiple smallers suggestion", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,3000,{from:accounts[1]});
    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:2000});
    var proposalId = await proposeCompetition(testSetup,"description-hash",1000,[1000,2000,3000]);
    await helpers.increaseTime(20);

    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);

    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
    await testSetup.contributionRewardExt.redeem(proposalId,[true,true,true,true]);
    await helpers.increaseTime(650);
    await testSetup.competition.vote(1,{from:accounts[2]});
    await testSetup.competition.vote(2,{from:accounts[1]});
    await testSetup.competition.vote(3,{from:accounts[1]});
    await testSetup.competition.vote(4,{from:accounts[0]});
    await testSetup.competition.vote(5,{from:accounts[0]});
    await testSetup.competition.vote(6,{from:accounts[0]});
    await helpers.increaseTime(650);
    var tx = await testSetup.competition.redeem(4);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,3);

    tx = await testSetup.competition.redeem(5);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,3);

    tx = await testSetup.competition.redeem(6);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,3);
  });

  it("multiple users vote on the same suggestion ", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,3000,{from:accounts[1]});
    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:2000});
    var proposalId = await proposeCompetition(testSetup,"description-hash",1000,[1000,2000,3000],[50,30,10,10]);
    await helpers.increaseTime(20);

    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);
    await testSetup.competition.suggest(proposalId,"suggestion",helpers.NULL_ADDRESS);

    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    await testSetup.contributionRewardExtParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
    await testSetup.contributionRewardExt.redeem(proposalId,[true,true,true,true]);
    await helpers.increaseTime(650);
    await testSetup.competition.vote(1,{from:accounts[1]});
    await testSetup.competition.vote(2,{from:accounts[0]});
    await testSetup.competition.vote(2,{from:accounts[2]});
    await helpers.increaseTime(650);
    var tx = await testSetup.competition.redeem(2);
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "Redeem");
    assert.equal(tx.logs[0].args._proposalId,proposalId);
    assert.equal(tx.logs[0].args._rewardPercentage,60);
  });
});
