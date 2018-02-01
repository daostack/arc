import * as helpers from './helpers';
const constants = require('./constants');
const ContributionReward = artifacts.require("./ContributionReward.sol");
const StandardTokenMock = artifacts.require('./test/StandardTokenMock.sol');
const DaoCreator = artifacts.require("./DaoCreator.sol");
const Avatar = artifacts.require("./Avatar.sol");


export class ContributionRewardParams {
  constructor() {
  }
}

const setupContributionRewardParams = async function(
                                            contributionReward,
                                            orgNativeTokenFee=0,
                                            ) {
  var contributionRewardParams = new ContributionRewardParams();
  contributionRewardParams.votingMachine = await helpers.setupAbsoluteVote();
  contributionRewardParams.orgNativeTokenFee =  orgNativeTokenFee;
  await contributionReward.setParameters(contributionRewardParams.orgNativeTokenFee,
                                         contributionRewardParams.votingMachine.params,
                                         contributionRewardParams.votingMachine.absoluteVote.address);
  contributionRewardParams.paramsHash = await contributionReward.getParametersHash(contributionRewardParams.orgNativeTokenFee,
                                                                                   contributionRewardParams.votingMachine.params,
                                                                                   contributionRewardParams.votingMachine.absoluteVote.address);
  return contributionRewardParams;
};

const setup = async function (accounts,orgNativeTokenFee=0) {
   var testSetup = new helpers.TestSetup();
   testSetup.fee = 10;
   testSetup.standardTokenMock = await StandardTokenMock.new(accounts[1],100);
   testSetup.contributionReward = await ContributionReward.new();
   testSetup.daoCreator = await DaoCreator.new({gas:constants.GENESIS_SCHEME_GAS_LIMIT});
   testSetup.org = await helpers.setupOrganization(testSetup.daoCreator,accounts[0],1000,1000);
   testSetup.contributionRewardParams= await setupContributionRewardParams(testSetup.contributionReward,orgNativeTokenFee);
   var permissions = "0x00000000";
   await testSetup.daoCreator.setSchemes(testSetup.org.avatar.address,[testSetup.contributionReward.address],[testSetup.contributionRewardParams.paramsHash],[permissions]);
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
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                     [0,0,0,0],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "NewContributionProposal");
     });

     it("proposeContributionReward fees", async function() {
       var testSetup = await setup(accounts,14);

       var balanceBefore  = await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address);
       //give approval to scheme to do the fees transfer
       await testSetup.org.token.approve(testSetup.contributionReward.address,100);
       await testSetup.standardTokenMock.approve(testSetup.contributionReward.address,100);
       var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                      "description",
                                                                      [0,0,0,0],
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
        var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                       "description",
                                                                       [0,0,0,0],
                                                                       testSetup.standardTokenMock.address,
                                                                       accounts[0]
                                                                     );
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await helpers.checkVoteInfo(testSetup.contributionRewardParams.votingMachine.absoluteVote,proposalId,accounts[0],[1,testSetup.contributionRewardParams.votingMachine.reputationArray[0]]);
       });

       it("proposeContributionReward check beneficiary==0", async function() {
         var testSetup = await setup(accounts);
         var beneficiary = 0;
         var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                        "description",
                                                                        [0,0,0,0],
                                                                        testSetup.standardTokenMock.address,
                                                                        beneficiary
                                                                      );
         assert.equal(await helpers.getValueFromLogs(tx, '_beneficiary'),accounts[0]);
        });

    it("execute proposeContributionReward  yes ", async function() {
      var testSetup = await setup(accounts);
      var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                     "description",
                                                                    [0,0,0,0],
                                                                     testSetup.standardTokenMock.address,
                                                                     accounts[0]
                                                                   );
      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
      var organizationsProposals = await testSetup.contributionReward.organizationsProposals(testSetup.org.avatar.address,proposalId);
      assert.equal(organizationsProposals[6],0);//beneficiary
     });

      it("execute proposeContributionReward  mint reputation ", async function() {
        var testSetup = await setup(accounts);
        var reputationReward = 12;
        var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                       "description",
                                                                       [0,reputationReward,0,0],
                                                                       testSetup.standardTokenMock.address,
                                                                       accounts[1]
                                                                     );
        //Vote with reputation to trigger execution
        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
        await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
        var rep = await testSetup.org.reputation.reputationOf(accounts[1]);
        assert.equal(rep.toNumber(),reputationReward);
       });

       it("execute proposeContributionReward  mint tokens ", async function() {
         var testSetup = await setup(accounts);
         var reputationReward = 12;
         var nativeTokenReward = 12;
         var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                        "description",
                                                                        [nativeTokenReward,reputationReward,0,0],
                                                                        testSetup.standardTokenMock.address,
                                                                        accounts[1]
                                                                      );
         //Vote with reputation to trigger execution
         var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
         await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
         var tokens = await testSetup.org.token.balanceOf(accounts[1]);
         assert.equal(tokens.toNumber(),nativeTokenReward);
        });

        it("execute proposeContributionReward  send ethers ", async function() {
          var testSetup = await setup(accounts);
          var reputationReward = 12;
          var nativeTokenReward = 12;
          var ethReward = 12;
          //send some ether to the org avatar
          var otherAvatar = await Avatar.new();
          web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
          var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                         "description",
                                                                         [nativeTokenReward,reputationReward,ethReward,0],
                                                                         testSetup.standardTokenMock.address,
                                                                         otherAvatar.address
                                                                       );
          //Vote with reputation to trigger execution
          var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
          await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
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
           //send some ether to the org avatar
           var otherAvatar = await Avatar.new();
           web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
           var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                          "description",
                                                                          [nativeTokenReward,reputationReward,ethReward,externalTokenReward],
                                                                          testSetup.standardTokenMock.address,
                                                                          otherAvatar.address
                                                                        );
           //Vote with reputation to trigger execution
           var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
           await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,1,{from:accounts[2]});
           var tokens = await testSetup.standardTokenMock.balanceOf(otherAvatar.address);
           assert.equal(tokens.toNumber(),externalTokenReward);
          });

          it("execute proposeContributionReward proposal decision=='no' send externalToken  ", async function() {
            var testSetup = await setup(accounts);
            var reputationReward = 12;
            var nativeTokenReward = 12;
            var ethReward = 12;
            var externalTokenReward = 12;
            //send some ether to the org avatar
            var otherAvatar = await Avatar.new();
            web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
            var tx = await testSetup.contributionReward.proposeContributionReward(testSetup.org.avatar.address,
                                                                           "description",
                                                                           [nativeTokenReward,reputationReward,ethReward,externalTokenReward],
                                                                           testSetup.standardTokenMock.address,
                                                                           otherAvatar.address
                                                                         );
            //Vote with reputation to trigger execution
            var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
            var organizationsProposals = await testSetup.contributionReward.organizationsProposals(testSetup.org.avatar.address,proposalId);
            assert.equal(organizationsProposals[6],otherAvatar.address);//beneficiary
            await testSetup.contributionRewardParams.votingMachine.absoluteVote.vote(proposalId,0,{from:accounts[2]});
            var tokens = await testSetup.standardTokenMock.balanceOf(otherAvatar.address);
            assert.equal(tokens.toNumber(),0);
            organizationsProposals = await testSetup.contributionReward.organizationsProposals(testSetup.org.avatar.address,proposalId);
            assert.equal(organizationsProposals[6],0);//beneficiary
           });
});
