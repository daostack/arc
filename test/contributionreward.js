import * as helpers from './helpers';
const constants = require('./constants');
const ContributionReward = artifacts.require("./ContributionReward.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const ControllerCreator = artifacts.require("./ControllerCreator.sol");
const Avatar = artifacts.require("./Avatar.sol");
const Redeemer = artifacts.require("./Redeemer.sol");



export class ContributionRewardParams {
  constructor() {
  }
}

const checkRedeemedPeriods = async function(
                                            testSetup,
                                            proposalId,
                                            ReputationPeriod,
                                            nativeTokenPeriod,
                                            EtherPeriod,
                                            ExternalTokenPeriod
                                            ) {
    assert.equal(await testSetup.contributionReward.getRedeemedPeriods(proposalId,testSetup.org.avatar.address,0),ReputationPeriod);
    assert.equal(await testSetup.contributionReward.getRedeemedPeriods(proposalId,testSetup.org.avatar.address,1),nativeTokenPeriod);
    assert.equal(await testSetup.contributionReward.getRedeemedPeriods(proposalId,testSetup.org.avatar.address,2),EtherPeriod);
    assert.equal(await testSetup.contributionReward.getRedeemedPeriods(proposalId, testSetup.org.avatar.address,3),ExternalTokenPeriod);
};

const checkRedeemedPeriodsLeft = async function(
                                            testSetup,
                                            proposalId,
                                            ReputationPeriod,
                                            nativeTokenPeriod,
                                            EtherPeriod,
                                            ExternalTokenPeriod
                                            ) {
    assert.equal(await testSetup.contributionReward.getPeriodsToPay(proposalId,testSetup.org.avatar.address,0),ReputationPeriod);
    assert.equal(await testSetup.contributionReward.getPeriodsToPay(proposalId,testSetup.org.avatar.address,1),nativeTokenPeriod);
    assert.equal(await testSetup.contributionReward.getPeriodsToPay(proposalId,testSetup.org.avatar.address,2),EtherPeriod);
    assert.equal(await testSetup.contributionReward.getPeriodsToPay(proposalId, testSetup.org.avatar.address,3),ExternalTokenPeriod);
};

const setupContributionRewardParams = async function(
                                            contributionReward,
                                            orgNativeTokenFee=0,
                                            accounts,
                                            genesisProtocol,
                                            token
                                            ) {
  var contributionRewardParams = new ContributionRewardParams();
  contributionRewardParams.orgNativeTokenFee =  orgNativeTokenFee;
  if (genesisProtocol === true) {
    contributionRewardParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token);
    await contributionReward.setParameters(contributionRewardParams.orgNativeTokenFee,
                                                 contributionRewardParams.votingMachine.params,
                                                  contributionRewardParams.votingMachine.genesisProtocol.address);
    contributionRewardParams.paramsHash = await contributionReward.getParametersHash(contributionRewardParams.orgNativeTokenFee,
                                                                                     contributionRewardParams.votingMachine.params,
                                                                                     contributionRewardParams.votingMachine.genesisProtocol.address);
    } else {
  contributionRewardParams.votingMachine = await helpers.setupAbsoluteVote();
  await contributionReward.setParameters(contributionRewardParams.orgNativeTokenFee,
                                         contributionRewardParams.votingMachine.params,
                                         contributionRewardParams.votingMachine.absoluteVote.address);
  contributionRewardParams.paramsHash = await contributionReward.getParametersHash(contributionRewardParams.orgNativeTokenFee,
                                                                                   contributionRewardParams.votingMachine.params,
                                                                                   contributionRewardParams.votingMachine.absoluteVote.address);
  }
  return contributionRewardParams;
};

const setup = async function (accounts,orgNativeTokenFee=0,genesisProtocol = false,tokenAddress=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.contributionReward = await ContributionReward.new();
   var controllerCreator = await ControllerCreator.new({gas: constants.ARC_GAS_LIMIT});
   testSetup.daoCreator = await DaoCreator.new(controllerCreator.address,{gas:constants.ARC_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.contributionRewardParams= await setupContributionRewardParams(testSetup.contributionReward,orgNativeTokenFee,accounts,genesisProtocol,tokenAddress);
   var permissions = "0x00000000";
   if (genesisProtocol) {
     await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,
                                          [testSetup.contributionReward.address,testSetup.contributionRewardParams.votingMachine.genesisProtocol.address],
                                          [testSetup.contributionRewardParams.paramsHash,testSetup.contributionRewardParams.votingMachine.params],[permissions,permissions]);
   } else {
     await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.contributionReward.address],[testSetup.contributionRewardParams.paramsHash],[permissions]);
   }
   return testSetup;
};
contract('ContributionReward', function(accounts) {

    it("setParameters", async function() {
       var contributionReward = await ContributionReward.new();
       var params = await setupContributionRewardParams(contributionReward);
       var parameters = await contributionReward.parameters(params.paramsHash);
       assert.equal(parameters[2],params.votingMachine.absoluteVote.address);
    });

    it("proposeContributionReward log", async function() {
      var testSetup = await setup(accounts,0);
      var periodLength = 1;
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     0,
                                                                     [0,0,0,periodLength,0],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewContributionProposal");
     });

    it("proposeContributionReward fees", async function() {
       var testSetup = await setup(accounts,14);
       var periodLength = 1;

       var balanceBefore  = await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address);
       //give approval to scheme to do the fees transfer
       await testSetup.org.token.approve(testSetup.contributionReward.address,100);
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      0,
                                                                      [0,0,0,periodLength,0],
                                                                      testSetup.standardTokenMock.address,
                                                                      accounts[0],
                                                                      {from:accounts[0]}
                                                                    );
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewContributionProposal");
       var balance  = await testSetup.org.token.balanceOf(testSetup.org.avatar.address);
       assert.equal(balance.toNumber(),testSetup.contributionRewardParams.orgNativeTokenFee);
       balance  = await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address);
       assert.equal(balance.toNumber(),balanceBefore.toNumber());
    });

    it("proposeContributionReward check owner vote", async function() {
      var testSetup = await setup(accounts);
      var periodLength = 1;
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     0,
                                                                     [0,0,0,periodLength,0],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]
                                                                   );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await helpers.checkVoteInfo(testSetup.contributionRewardParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.contributionRewardParams.votingMachine.reputationArray[0]]);
    });

    it("proposeContributionReward check beneficiary==0", async function() {
       var testSetup = await setup(accounts);
       var beneficiary = 0;
       var periodLength = 1;
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      0,
                                                                      [0,0,0,periodLength,0],
                                                                      testSetup.standardTokenMock.address,
                                                                      beneficiary
                                                                    );
       assert.equal(await helpers.getValueFromLogs(tx, '_beneficiary'),accounts[0]);
    });

    it("execute proposeContributionReward  yes ", async function() {
      var testSetup = await setup(accounts);
      var periodLength = 1;
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     0,
                                                                    [0,0,0,periodLength,0],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      var organizationProposal = await testSetup.contributionReward.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.notEqual(organizationProposal[9],0);//executionTime
     });

    it("execute proposeContributionReward  mint reputation ", async function() {
      var testSetup = await setup(accounts);
      var reputationReward = 12;
      var periodLength = 50;
      var numberOfPeriods = 1;
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     reputationReward,
                                                                     [0,0,0,periodLength,numberOfPeriods],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[1]
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      await helpers.increaseTime(periodLength+1);
      tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[true,false,false,false]);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, reputationReward);
      var rep = await testSetup.org.reputation.reputationOf(accounts[1]);
      assert.equal(rep.toNumber(),reputationReward);
     });

    it("execute proposeContributionReward  mint tokens ", async function() {
       var testSetup = await setup(accounts);
       var reputationReward = 12;
       var nativeTokenReward = 12;
       var periodLength = 50;
       var numberOfPeriods = 1;
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      reputationReward,
                                                                      [nativeTokenReward,0,0,periodLength,numberOfPeriods],
                                                                      testSetup.standardTokenMock.address,
                                                                      accounts[1]
                                                                    );
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
       await helpers.increaseTime(periodLength+1);
       tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,true,false,false]);
       var tokens = await testSetup.org.token.balanceOf(accounts[1]);
       assert.equal(tokens.toNumber(),nativeTokenReward);
    });

    it("execute proposeContributionReward  send ethers ", async function() {
      var testSetup = await setup(accounts);
      var reputationReward = 12;
      var nativeTokenReward = 12;
      var ethReward = 12;
      var periodLength = 50;
      var numberOfPeriods = 1;
      //send some ether to the org avatar
      var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
      web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     reputationReward,
                                                                     [nativeTokenReward,ethReward,0,periodLength,numberOfPeriods],
                                                                     testSetup.standardTokenMock.address,
                                                                     otherAvatar.address
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      await helpers.increaseTime(periodLength+1);
      await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
      var eth = web3.eth.getBalance(otherAvatar.address);
      assert.equal(eth.toNumber(),ethReward);
     });

     it("execute proposeContributionReward  send externalToken ", async function() {
       var testSetup = await setup(accounts);
       //give some tokens to organization avatar
       await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
       var reputationReward = 12;
       var nativeTokenReward = 12;
       var ethReward = 12;
       var externalTokenReward = 12;
       var periodLength = 50;
       var numberOfPeriods = 1;
       //send some ether to the org avatar
       var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
       web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      reputationReward,
                                                                      [nativeTokenReward,ethReward,externalTokenReward,periodLength,numberOfPeriods],
                                                                      testSetup.standardTokenMock.address,
                                                                      otherAvatar.address
                                                                    );
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
       await helpers.increaseTime(periodLength+1);
       await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,false,true]);
       var tokens = await testSetup.standardTokenMock.balanceOf(otherAvatar.address);
       assert.equal(tokens.toNumber(),externalTokenReward);
      });

      it("execute proposeContributionReward proposal decision=='no' send externalToken  ", async function() {
        var testSetup = await setup(accounts);
        var reputationReward = 12;
        var nativeTokenReward = 12;
        var ethReward = 12;
        var externalTokenReward = 12;
        var periodLength = 50;
        var numberOfPeriods = 1;
        //send some ether to the org avatar
        var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
        web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
        var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                       "description",
                                                                       reputationReward,
                                                                       [nativeTokenReward,ethReward,externalTokenReward,periodLength,numberOfPeriods],
                                                                       testSetup.standardTokenMock.address,
                                                                       otherAvatar.address
                                                                     );
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        var organizationProposal = await testSetup.contributionReward.organizationsProposals(testSetup.org.avatar.address,proposalId);
        assert.equal(organizationProposal[6],otherAvatar.address);//beneficiary
        await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
        await helpers.increaseTime(periodLength+1);
        try {
          await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[true,true,true,true]);
          assert(false, 'redeem should revert because there was no positive voting');
        } catch (ex) {
          helpers.assertVMException(ex);
        }
       });


   it("redeem periods ether ", async function() {
     var testSetup = await setup(accounts);
     var reputationReward = 0;
     var nativeTokenReward = 0;
     var ethReward = 3;
     var periodLength = 50;
     var numberOfPeriods = 5;
     //send some ether to the org avatar
     var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
     web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:12});
     var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                    "description",
                                                                    reputationReward,
                                                                    [nativeTokenReward,ethReward,0,periodLength,numberOfPeriods],
                                                                    testSetup.standardTokenMock.address,
                                                                    otherAvatar.address
                                                                  );
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
     await helpers.increaseTime(periodLength+1);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,0,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,1,1,1,1);

     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);

     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "RedeemEther");
     assert.equal(tx.logs[0].args._amount, ethReward);
     var eth = web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,1,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,1,1,0,1);
     //now try again on the same period
     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
     assert.equal(tx.logs.length, 0);
     eth = web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward);

     //now try again on 2nd period
     await helpers.increaseTime(periodLength+1);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,1,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,2,2,1,2);

     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "RedeemEther");
     assert.equal(tx.logs[0].args._amount, ethReward);
     eth = await web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward*2);

     //now try again on 4th period
     await helpers.increaseTime((periodLength*2)+1);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,2,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,4,4,2,4);

     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "RedeemEther");
     assert.equal(tx.logs[0].args._amount, ethReward*2);
     eth = await web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward*4);

     //now try again on 5th period - no ether on avatar should revert
     await helpers.increaseTime(periodLength+1);
     await checkRedeemedPeriods(testSetup,proposalId,0,0,4,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,5,5,1,5);
     try {
          await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
          assert(false, 'redeem should revert because no ether left on avatar');
          } catch (ex) {
           helpers.assertVMException(ex);
     }
     web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:ethReward});

     await checkRedeemedPeriods(testSetup,proposalId,0,0,4,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,5,5,1,5);

     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
     assert.equal(tx.logs.length, 1);
     assert.equal(tx.logs[0].event, "RedeemEther");
     assert.equal(tx.logs[0].args._amount, ethReward);
     eth = await web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward*5);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,5,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,5,5,0,5);


     //cannot redeem any more..
     await helpers.increaseTime(periodLength+1);
     tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[false,false,true,false]);
     assert.equal(tx.logs.length, 0);
     eth = await web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward*5);

     await checkRedeemedPeriods(testSetup,proposalId,0,0,5,0);
     await checkRedeemedPeriodsLeft(testSetup,proposalId,5,5,0,5);
    });

    it("execute proposeContributionReward  mint negative reputation ", async function() {
      var testSetup = await setup(accounts);
      var reputationReward = -12;
      var periodLength = 50;
      var numberOfPeriods = 1;
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     reputationReward,
                                                                     [0,0,0,periodLength,numberOfPeriods],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      await helpers.increaseTime(periodLength+1);
      tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[true,false,false,false]);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, reputationReward);
      var rep = await testSetup.org.reputation.reputationOf(accounts[0]);
      assert.equal(rep.toNumber(),1000+reputationReward);
     });


     it("call execute should revert ", async function() {
       var testSetup = await setup(accounts);
       var reputationReward = -12;
       var periodLength = 50;
       var numberOfPeriods = 1;
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      reputationReward,
                                                                      [0,0,0,periodLength,numberOfPeriods],
                                                                      testSetup.standardTokenMock.address,
                                                                      accounts[0]
                                                                    );
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       try {
            await testSetup.contributionReward.execute(proposalId,testSetup.org.avatar.address,1);
            assert(false, 'only voting machine can call execute');
            } catch (ex) {
             helpers.assertVMException(ex);
       }

      });


      it("get redeemed periods left ", async function() {
        var testSetup = await setup(accounts);
        var periodLength = 1;
        await checkRedeemedPeriodsLeft(testSetup,0,0,0,0,0);
        await checkRedeemedPeriods(testSetup,0,0,0,0,0);
        var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                       "description",
                                                                       0,
                                                                      [0,0,0,periodLength,0],
                                                                       testSetup.standardTokenMock.address,
                                                                       accounts[0]
                                                                     );
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);

        await checkRedeemedPeriods(testSetup,0,0,0,0,0);
        await checkRedeemedPeriodsLeft(testSetup,proposalId,0,0,0,0);

       });

   it("execute proposeContributionReward via genesisProtocol and redeem using Redeemer", async function() {
     var standardTokenMock = await StandardTokenMock.new(accounts[0],1000);
     var testSetup = await setup(accounts,0,true,standardTokenMock.address);
     var reputationReward = 12;
     var nativeTokenReward = 12;
     var ethReward = 12;
     var periodLength = 50;
     var numberOfPeriods = 1;
     //send some ether to the org avatar
     var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
     web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
     var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                    "description",
                                                                    reputationReward,
                                                                    [nativeTokenReward,ethReward,0,periodLength,numberOfPeriods],
                                                                    testSetup.standardTokenMock.address,
                                                                    otherAvatar.address
                                                                  );
     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     await testSetup.contributionRewardParams.votingMachine.genesisProtocol.vote(proposalId,1,{from:accounts[0]});
     await helpers.increaseTime(periodLength+1);
     var arcUtils = await Redeemer.new(testSetup.contributionReward.address,testSetup.contributionRewardParams.votingMachine.genesisProtocol.address);
     var redeemRewards = await arcUtils.redeem.call(proposalId,testSetup.org.avatar.address,accounts[0]);
     assert.equal(redeemRewards[0][3],100); //redeemRewards[0] gpRewards
     assert.equal(redeemRewards[0][4],61);
     assert.equal(redeemRewards[1][0],0); //daoBountyRewards
     assert.equal(redeemRewards[1][1],0); //daoBountyRewards
     assert.equal(redeemRewards[2],false); //isExecuted
     assert.equal(redeemRewards[3],1); //winningVote
     assert.equal(redeemRewards[4],reputationReward); //crReputationReward
     assert.equal(redeemRewards[5],nativeTokenReward); //crNativeTokenReward
     assert.equal(redeemRewards[6],ethReward); //crEthReward
     assert.equal(redeemRewards[7],0); //crExternalTokenReward

     await arcUtils.redeem(proposalId,testSetup.org.avatar.address,accounts[0]);
     var eth = web3.eth.getBalance(otherAvatar.address);
     assert.equal(eth.toNumber(),ethReward);
     assert.equal(await testSetup.org.reputation.reputationOf(otherAvatar.address),reputationReward);
     assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),nativeTokenReward);
     var reputation = await testSetup.org.reputation.reputationOf(accounts[0]);
     var reputationGainAsVoter =  0;
     var proposingRepRewardConstA=60;
     var proposingRepRewardConstB=1;
     var reputationGainAsProposer = (proposingRepRewardConstA*1000 + proposingRepRewardConstB*1000)/1000;
     assert.equal(reputation, 1000+reputationGainAsVoter + reputationGainAsProposer);
    });
    it("execute proposeContributionReward via genesisProtocol and redeem using Redeemer for negative proposal", async function() {
      var standardTokenMock = await StandardTokenMock.new(accounts[0],1000);
      var testSetup = await setup(accounts,0,true,standardTokenMock.address);
      var reputationReward = 12;
      var nativeTokenReward = 12;
      var ethReward = 12;
      var periodLength = 50;
      var numberOfPeriods = 1;
      //send some ether to the org avatar
      var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
      web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     reputationReward,
                                                                     [nativeTokenReward,ethReward,0,periodLength,numberOfPeriods],
                                                                     testSetup.standardTokenMock.address,
                                                                     otherAvatar.address
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.genesisProtocol.vote(proposalId,2,{from:accounts[0]});
      await helpers.increaseTime(periodLength+1);
      var arcUtils = await Redeemer.new(testSetup.contributionReward.address,testSetup.contributionRewardParams.votingMachine.genesisProtocol.address);
      await arcUtils.redeem(proposalId,testSetup.org.avatar.address,accounts[0]);
      var eth = web3.eth.getBalance(otherAvatar.address);
      assert.equal(eth.toNumber(),0);
      assert.equal(await testSetup.org.reputation.reputationOf(otherAvatar.address),0);
      assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),0);
      var reputation = await testSetup.org.reputation.reputationOf(accounts[0]);
      //no reputation reward for proposer for negative proposal.
      //reputation reward for a single voter = 0
      assert.equal(reputation, 1000);
     });

    it("execute proposeContributionReward  mint reputation with period 0 ", async function() {
       var testSetup = await setup(accounts);
       var reputationReward = 12;
       var periodLength = 0;
       var numberOfPeriods = 1;
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                 "description",
                                                                 reputationReward,
                                                                 [0,0,0,periodLength,numberOfPeriods],
                                                                 testSetup.standardTokenMock.address,
                                                                 accounts[1]
                                                               );
       try {
            await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                   "description",
                                                                   reputationReward,
                                                                   [0,0,0,periodLength,2],
                                                                   testSetup.standardTokenMock.address,
                                                                   accounts[1]
                                                                 );
            assert(false, 'if periodLength==0  so numberOfPeriods must be 1');
            } catch (ex) {
             helpers.assertVMException(ex);
       }

       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
       tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[true,false,false,false]);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "RedeemReputation");
       assert.equal(tx.logs[0].args._amount, reputationReward);
       var rep = await testSetup.org.reputation.reputationOf(accounts[1]);
       assert.equal(rep.toNumber(),reputationReward);
       //try to redeem again.
       tx = await testSetup.contributionReward.redeem(proposalId,testSetup.org.avatar.address,[true,false,false,false]);
       assert.equal(tx.logs.length, 0);
       rep = await testSetup.org.reputation.reputationOf(accounts[1]);
       assert.equal(rep.toNumber(),reputationReward);
    });
});
