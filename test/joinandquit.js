import * as helpers from './helpers';
const JoinAndQuit = artifacts.require("./JoinAndQuit.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const Avatar = artifacts.require("./Avatar.sol");



export class JoinAndQuitParams {
  constructor() {
  }
}

const setupJoinAndQuit = async function(
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            avatarAddress,
                                            _fundingToken,
                                            _minFeeToJoin,
                                            _memberReputation,
                                            _fundingGoal,
                                            _fundingGoalDeadLine
                                            ) {
  var joinAndQuitParams = new JoinAndQuitParams();

  if (genesisProtocol === true) {
    joinAndQuitParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    joinAndQuitParams.initdata = await new web3.eth.Contract(registration.joinAndQuit.abi)
                          .methods
                          .initialize(avatarAddress,
                            joinAndQuitParams.votingMachine.genesisProtocol.address,
                            joinAndQuitParams.votingMachine.params,
                            _fundingToken,
                            _minFeeToJoin,
                            _memberReputation,
                            _fundingGoal,
                           _fundingGoalDeadLine)
                          .encodeABI();
    } else {
  joinAndQuitParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  joinAndQuitParams.initdata = await new web3.eth.Contract(registration.joinAndQuit.abi)
                        .methods
                        .initialize(avatarAddress,
                          joinAndQuitParams.votingMachine.absoluteVote.address,
                          joinAndQuitParams.votingMachine.params,
                          _fundingToken,
                          _minFeeToJoin,
                          _memberReputation,
                          _fundingGoal,
                         _fundingGoalDeadLine)
                        .encodeABI();
  }
  return joinAndQuitParams;
};
var registration;
const setup = async function (accounts,
                              genesisProtocol = false,
                              tokenAddress=0,
                              minFeeToJoin = 100,
                              memberReputation = 100,
                              fundingGoal = 1000,
                              fundingGoalDeadLine = 3000) {
  var testSetup = new helpers.TestSetup();
  testSetup.standardTokenMock = await ERC20Mock.new(accounts[0],100000);
  registration = await helpers.registerImplementation();

  if (genesisProtocol) {
     testSetup.reputationArray = [1000,100,0];
  } else {
     testSetup.reputationArray = [2000,4000,7000];
  }
  testSetup.proxyAdmin = accounts[5];
  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      accounts[2]],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray);
  testSetup.fundingGoalDeadLine = (await web3.eth.getBlock("latest")).timestamp + fundingGoalDeadLine;
  testSetup.minFeeToJoin = minFeeToJoin;

  testSetup.joinAndQuitParams= await setupJoinAndQuit(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     testSetup.org.avatar.address,
                     testSetup.standardTokenMock.address,
                     minFeeToJoin,
                     memberReputation,
                     fundingGoal,
                     testSetup.fundingGoalDeadLine);

  var permissions = "0x00000000";
  var tx = await registration.daoFactory.setSchemes(
                          testSetup.org.avatar.address,
                          [web3.utils.fromAscii("JoinAndQuit")],
                          testSetup.joinAndQuitParams.initdata,
                          [helpers.getBytesLength(testSetup.joinAndQuitParams.initdata)],
                          [permissions],
                          "metaData",{from:testSetup.proxyAdmin});

  testSetup.joinAndQuit = await JoinAndQuit.at(tx.logs[1].args._scheme);

  return testSetup;
};
contract('JoinAndQuit', accounts => {

    it("initialize", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.joinAndQuit.votingMachine(),testSetup.joinAndQuitParams.votingMachine.absoluteVote.address);
       assert.equal(await testSetup.joinAndQuit.fundingGoalDeadLine(),testSetup.fundingGoalDeadLine);
    });

    it("propose log", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);

      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           helpers.NULL_ADDRESS);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),testSetup.minFeeToJoin);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "JoinInProposal");
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(tx.logs[0].args._descriptionHash, "description-hash");
      assert.equal(tx.logs[0].args._proposedMember, accounts[0]);
      assert.equal(tx.logs[0].args._fundAmount, testSetup.minFeeToJoin);
     });

    it("proposeJoinAndQuit check proposedMember", async() => {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);

      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           accounts[1]);
      assert.equal(tx.logs[0].args._proposedMember, accounts[1]);
      assert.equal((await testSetup.joinAndQuit.proposals(tx.logs[0].args._proposalId)).proposedMember,accounts[1]);
    });

    it("proposeJoinAndQuit check minFeeToJoin", async() => {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.proposeToJoinIn(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin-1,
                                                    accounts[1]);
         assert(false, 'minFeeToJoin');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
  });

    it("execute proposeJoinAndQuit yes ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           helpers.NULL_ADDRESS);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var proposal = await testSetup.joinAndQuit.proposals(proposalId);
      assert.equal(proposal.accepted,true);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
      assert.equal(await testSetup.joinAndQuit.fundings(accounts[0]),testSetup.minFeeToJoin);
     });

     it("execute proposeJoinAndQuit no", async function() {
       var testSetup = await setup(accounts);
       await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
       var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                            "description-hash",
                                                            testSetup.minFeeToJoin,
                                                            helpers.NULL_ADDRESS);

       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var proposal = await testSetup.joinAndQuit.proposals(proposalId);
       assert.equal(proposal.accepted,false);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
       assert.equal(await testSetup.joinAndQuit.fundings(accounts[0]),0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[0]),100000);
      });
   //
   //  it("execute proposeJoinAndQuit  mint reputation ", async function() {
   //    var testSetup = await setup(accounts);
   //    var reputationReward = 12;
   //    var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                   web3.utils.asciiToHex("description"),
   //                                                                   reputationReward,
   //                                                                   [0,0,0],
   //                                                                   testSetup.standardTokenMock.address,
   //                                                                   accounts[1],
   //                                                                   helpers.NULL_ADDRESS
   //                                                                 );
   //    //Vote with reputation to trigger execution
   //    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //    await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //    tx = await testSetup.JoinAndQuit.redeem(proposalId,[true,false,false,false]);
   //    assert.equal(tx.logs.length, 1);
   //    assert.equal(tx.logs[0].event, "RedeemReputation");
   //    assert.equal(tx.logs[0].args._amount, reputationReward);
   //    var rep = await testSetup.org.reputation.balanceOf(accounts[1]);
   //    assert.equal(rep.toNumber(),testSetup.reputationArray[1]+reputationReward);
   //   });
   //
   //  it("execute proposeJoinAndQuit  mint tokens ", async function() {
   //     var testSetup = await setup(accounts);
   //     var reputationReward = 12;
   //     var nativeTokenReward = 12;
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                    web3.utils.asciiToHex("description"),
   //                                                                    reputationReward,
   //                                                                    [nativeTokenReward,0,0],
   //                                                                    testSetup.standardTokenMock.address,
   //                                                                    accounts[1],
   //                                                                    helpers.NULL_ADDRESS
   //                                                                  );
   //     //Vote with reputation to trigger execution
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //     await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //     tx = await testSetup.JoinAndQuit.redeem(proposalId,[false,true,false,false]);
   //     var tokens = await testSetup.org.token.balanceOf(accounts[1]);
   //     assert.equal(tokens.toNumber(),nativeTokenReward);
   //  });
   //
   //  it("execute proposeJoinAndQuit  send ethers ", async function() {
   //    var testSetup = await setup(accounts);
   //    var reputationReward = 12;
   //    var nativeTokenReward = 12;
   //    var ethReward = 12;
   //    //send some ether to the org avatar
   //    var otherAvatar = await Avatar.new();
   //    await otherAvatar.initialize('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS,accounts[0]);
   //    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //
   //    var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                   web3.utils.asciiToHex("description"),
   //                                                                   reputationReward,
   //                                                                   [nativeTokenReward,ethReward,0],
   //                                                                   testSetup.standardTokenMock.address,
   //                                                                   otherAvatar.address,
   //                                                                   helpers.NULL_ADDRESS
   //                                                                 );
   //    //Vote with reputation to trigger execution
   //    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //    await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //    await testSetup.JoinAndQuit.redeem(proposalId,[false,false,true,false]);
   //    var vault = await otherAvatar.vault();
   //    var eth = await web3.eth.getBalance(vault);
   //    assert.equal(eth,ethReward);
   //   });
   //
   //   it("execute proposeJoinAndQuit  send externalToken ", async function() {
   //     var testSetup = await setup(accounts);
   //     //give some tokens to organization avatar
   //     await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   //     var reputationReward = 12;
   //     var nativeTokenReward = 12;
   //     var ethReward = 12;
   //     var externalTokenReward = 12;
   //     //send some ether to the org avatar
   //     var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
   //     await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                    web3.utils.asciiToHex("description"),
   //                                                                    reputationReward,
   //                                                                    [nativeTokenReward,ethReward,externalTokenReward],
   //                                                                    testSetup.standardTokenMock.address,
   //                                                                    otherAvatar.address,
   //                                                                    helpers.NULL_ADDRESS
   //                                                                  );
   //     //Vote with reputation to trigger execution
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //     await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //     await testSetup.JoinAndQuit.redeem(proposalId,[false,false,false,true]);
   //     var tokens = await testSetup.standardTokenMock.balanceOf(otherAvatar.address);
   //     assert.equal(tokens.toNumber(),externalTokenReward);
   //    });
   //
   //    it("execute proposeJoinAndQuit proposal decision=='no' send externalToken  ", async function() {
   //      var testSetup = await setup(accounts);
   //      var reputationReward = 12;
   //      var nativeTokenReward = 12;
   //      var ethReward = 12;
   //      var externalTokenReward = 12;
   //
   //      //send some ether to the org avatar
   //      var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
   //      await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //      var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                     web3.utils.asciiToHex("description"),
   //                                                                     reputationReward,
   //                                                                     [nativeTokenReward,ethReward,externalTokenReward],
   //                                                                     testSetup.standardTokenMock.address,
   //                                                                     otherAvatar.address,
   //                                                                     helpers.NULL_ADDRESS
   //                                                                   );
   //      //Vote with reputation to trigger execution
   //      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //      var organizationProposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //      assert.equal(organizationProposal[5],otherAvatar.address);//beneficiary
   //      await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //
   //      try {
   //        await testSetup.JoinAndQuit.redeem(proposalId,[true,true,true,true]);
   //        assert(false, 'redeem should revert because there was no positive voting');
   //      } catch (ex) {
   //        helpers.assertVMException(ex);
   //      }
   //     });
   //
   //  it("execute proposeJoinAndQuit  mint negative reputation ", async function() {
   //    var testSetup = await setup(accounts);
   //    var reputationReward = -12;
   //
   //
   //    var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                   web3.utils.asciiToHex("description"),
   //                                                                   reputationReward,
   //                                                                   [0,0,0],
   //                                                                   testSetup.standardTokenMock.address,
   //                                                                   accounts[0],
   //                                                                   helpers.NULL_ADDRESS
   //                                                                 );
   //    //Vote with reputation to trigger execution
   //    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //    await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //
   //    tx = await testSetup.JoinAndQuit.redeem(proposalId,[true,false,false,false]);
   //    assert.equal(tx.logs.length, 1);
   //    assert.equal(tx.logs[0].event, "RedeemReputation");
   //    assert.equal(tx.logs[0].args._amount, reputationReward);
   //    var rep = await testSetup.org.reputation.balanceOf(accounts[0]);
   //    assert.equal(rep.toNumber(),testSetup.reputationArray[0]+reputationReward);
   //   });
   //
   //
   //   it("call execute should revert ", async function() {
   //     var testSetup = await setup(accounts);
   //     var reputationReward = -12;
   //
   //
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                    web3.utils.asciiToHex("description"),
   //                                                                    reputationReward,
   //                                                                    [0,0,0],
   //                                                                    testSetup.standardTokenMock.address,
   //                                                                    accounts[0],
   //                                                                    helpers.NULL_ADDRESS
   //                                                                  );
   //     //Vote with reputation to trigger execution
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //     try {
   //          await testSetup.JoinAndQuit.executeProposal(proposalId,1);
   //          assert(false, 'only voting machine can call execute');
   //          } catch (ex) {
   //           helpers.assertVMException(ex);
   //     }
   //
   //    });
   //
   // it("execute proposeJoinAndQuit via genesisProtocol and redeem using Redeemer", async function() {
   //   var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
   //   var testSetup = await setup(accounts,true,standardTokenMock.address);
   //   var reputationReward = 12;
   //   var nativeTokenReward = 12;
   //   var ethReward = 12;
   //
   //
   //   //send some ether to the org avatar
   //   var otherAvatar = await Avatar.new();
   //   await otherAvatar.initialize('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS,accounts[0]);
   //   await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //   var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                  web3.utils.asciiToHex("description"),
   //                                                                  reputationReward,
   //                                                                  [nativeTokenReward,ethReward,0],
   //                                                                  testSetup.standardTokenMock.address,
   //                                                                  otherAvatar.address,
   //                                                                  helpers.NULL_ADDRESS
   //                                                                );
   //   //Vote with reputation to trigger execution
   //   var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //   await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[0]});
   //
   //   var arcUtils = await Redeemer.new();
   //   var redeemRewards = await arcUtils.redeemFromCRExt.call(testSetup.JoinAndQuit.address,
   //                                                  testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                                                  proposalId,
   //                                                  accounts[0]);
   //   assert.equal(redeemRewards[0][1],100); //redeemRewards[0] gpRewards
   //   assert.equal(redeemRewards[0][2],60);
   //   assert.equal(redeemRewards[1][0],0); //daoBountyRewards
   //   assert.equal(redeemRewards[1][1],0); //daoBountyRewards
   //   assert.equal(redeemRewards[2],false); //isExecuted
   //   assert.equal(redeemRewards[3],1); //winningVote
   //   assert.equal(redeemRewards[4],reputationReward); //crReputationReward
   //   assert.equal(redeemRewards[5],nativeTokenReward); //crNativeTokenReward
   //   assert.equal(redeemRewards[6],ethReward); //crEthReward
   //   assert.equal(redeemRewards[7],0); //crExternalTokenReward
   //
   //   await arcUtils.redeemFromCRExt(testSetup.JoinAndQuit.address,
   //                         testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                         proposalId,
   //                         accounts[0]);
   //   var vault = await otherAvatar.vault();
   //   var eth = await web3.eth.getBalance(vault);
   //   assert.equal(eth,ethReward);
   //   assert.equal(await testSetup.org.reputation.balanceOf(otherAvatar.address),reputationReward);
   //   assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),nativeTokenReward);
   //   var reputation = await testSetup.org.reputation.balanceOf(accounts[0]);
   //   var reputationGainAsVoter =  0;
   //   var proposingRepRewardConstA=60;
   //   var reputationGainAsProposer = proposingRepRewardConstA;
   //   assert.equal(reputation, 1000+reputationGainAsVoter + reputationGainAsProposer);
   //  });
   //
   //  it("execute proposeJoinAndQuit via genesisProtocol and redeem using Redeemer for un excuted boosted proposal", async function() {
   //    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
   //    var testSetup = await setup(accounts,true,standardTokenMock.address);
   //    var reputationReward = 12;
   //    var nativeTokenReward = 12;
   //    var ethReward = 12;
   //    //send some ether to the org avatar
   //    var otherAvatar = await Avatar.new();
   //    await otherAvatar.initialize('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS,accounts[0]);
   //    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //    var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                   web3.utils.asciiToHex("description"),
   //                                                                   reputationReward,
   //                                                                   [nativeTokenReward,ethReward,0],
   //                                                                   testSetup.standardTokenMock.address,
   //                                                                   otherAvatar.address,
   //                                                                   helpers.NULL_ADDRESS
   //                                                                 );
   //    //Vote with reputation to trigger execution
   //    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //    await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[1]});
   //
   //    await standardTokenMock.approve(testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,1000);
   //    await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.stake(proposalId,1,1000);
   //    await helpers.increaseTime(60+1);
   //    var arcUtils = await Redeemer.new();
   //
   //    var redeemRewards = await arcUtils.redeemFromCRExt.call(testSetup.JoinAndQuit.address,
   //                                                   testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                                                   proposalId,
   //                                                   accounts[0]);
   //
   //    assert.equal(redeemRewards[0][1],0); //redeemRewards[0] gpRewards
   //    assert.equal(redeemRewards[0][2],60);
   //    assert.equal(redeemRewards[1][0],0); //daoBountyRewards
   //    assert.equal(redeemRewards[1][1],15); //daoBountyRewards
   //    assert.equal(redeemRewards[2],true); //isExecuted
   //    assert.equal(redeemRewards[3],1); //winningVote
   //    assert.equal(redeemRewards[4],reputationReward); //crReputationReward
   //    assert.equal(redeemRewards[5],nativeTokenReward); //crNativeTokenReward
   //    assert.equal(redeemRewards[6],ethReward); //crEthReward
   //    assert.equal(redeemRewards[7],0); //crExternalTokenReward
   //
   //    await arcUtils.redeemFromCRExt(testSetup.JoinAndQuit.address,
   //                          testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                          proposalId,
   //                          accounts[0]);
   //    var vault = await otherAvatar.vault();
   //    var eth = await web3.eth.getBalance(vault);
   //    assert.equal(eth,ethReward);
   //    assert.equal(await testSetup.org.reputation.balanceOf(otherAvatar.address),reputationReward);
   //    assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),nativeTokenReward);
   //    var reputation = await testSetup.org.reputation.balanceOf(accounts[0]);
   //    var reputationGainAsVoter =  0;
   //    var proposingRepRewardConstA=60;
   //    var reputationGainAsProposer = proposingRepRewardConstA;
   //    assert.equal(reputation, 1000+reputationGainAsVoter + reputationGainAsProposer);
   //   });
   //
   //  it("execute proposeJoinAndQuit via genesisProtocol and redeem using Redeemer for negative proposal", async function() {
   //    var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
   //    var testSetup = await setup(accounts,true,standardTokenMock.address);
   //    var reputationReward = 12;
   //    var nativeTokenReward = 12;
   //    var ethReward = 12;
   //
   //
   //    //send some ether to the org avatar
   //    var otherAvatar = await Avatar.new();
   //    await otherAvatar.initialize('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS,accounts[0]);
   //    await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //    var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                   web3.utils.asciiToHex("description"),
   //                                                                   reputationReward,
   //                                                                   [nativeTokenReward,ethReward,0],
   //                                                                   testSetup.standardTokenMock.address,
   //                                                                   otherAvatar.address,
   //                                                                   helpers.NULL_ADDRESS
   //                                                                 );
   //    //Vote with reputation to trigger execution
   //    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //    await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[0]});
   //
   //    var arcUtils = await Redeemer.new();
   //    await arcUtils.redeemFromCRExt(testSetup.JoinAndQuit.address,
   //                          testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                          proposalId,
   //                          accounts[0]);
   //    var vault = await otherAvatar.vault();
   //    var eth = await web3.eth.getBalance(vault);
   //    assert.equal(eth,0);
   //    assert.equal(await testSetup.org.reputation.balanceOf(otherAvatar.address),0);
   //    assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),0);
   //    var reputation = await testSetup.org.reputation.balanceOf(accounts[0]);
   //    //no reputation reward for proposer for negative proposal.
   //    //reputation reward for a single voter = 0
   //    assert.equal(reputation, 1000);
   //   });
   //
   //   it("execute proposeJoinAndQuit via genesisProtocol and redeem using Redeemer ExpiredInQueue", async function() {
   //     var standardTokenMock = await ERC20Mock.new(accounts[0],1000);
   //     var testSetup = await setup(accounts,true,standardTokenMock.address);
   //     var reputationReward = 12;
   //     var nativeTokenReward = 12;
   //     var ethReward = 12;
   //
   //
   //     //send some ether to the org avatar
   //     var otherAvatar = await Avatar.new('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS);
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                    web3.utils.asciiToHex("description"),
   //                                                                    reputationReward,
   //                                                                    [nativeTokenReward,ethReward,0],
   //                                                                    testSetup.standardTokenMock.address,
   //                                                                    otherAvatar.address,
   //                                                                    helpers.NULL_ADDRESS
   //                                                                  );
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //
   //     await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[1]});
   //     await helpers.increaseTime(60+1);
   //     var arcUtils = await Redeemer.new();
   //     await arcUtils.redeemFromCRExt(testSetup.JoinAndQuit.address,
   //                           testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.address,
   //                           proposalId,
   //                           accounts[1]);
   //     var proposal = await testSetup.JoinAndQuitParams.votingMachine.genesisProtocol.proposals(proposalId);
   //     assert.equal(proposal.state,1); //ExpiredInQueue
   //     var reputation = await testSetup.org.reputation.balanceOf(accounts[1]);
   //     //accounts[1] redeems its deposit rep.
   //     assert.equal(reputation.toNumber(), 100);
   //    });
   //
   //  it("execute proposeJoinAndQuit  mint reputation with period 0 ", async function() {
   //     var testSetup = await setup(accounts);
   //     var reputationReward = 12;
   //
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                               web3.utils.asciiToHex("description"),
   //                                                               reputationReward,
   //                                                               [0,0,0],
   //                                                               testSetup.standardTokenMock.address,
   //                                                               accounts[1],
   //                                                               helpers.NULL_ADDRESS,
   //                                                               {from:accounts[2]}
   //                                                             );
   //     //Vote with reputation to trigger execution
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //     await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //     tx = await testSetup.JoinAndQuit.redeem(proposalId,[true,false,false,false]);
   //     assert.equal(tx.logs.length, 1);
   //     assert.equal(tx.logs[0].event, "RedeemReputation");
   //     assert.equal(tx.logs[0].args._amount, reputationReward);
   //     var rep = await testSetup.org.reputation.balanceOf(accounts[1]);
   //     assert.equal(rep.toNumber(),testSetup.reputationArray[1]+reputationReward);
   //     //try to redeem again.
   //     tx = await testSetup.JoinAndQuit.redeem(proposalId,[true,false,false,false]);
   //     assert.equal(tx.logs.length, 0);
   //     rep = await testSetup.org.reputation.balanceOf(accounts[1]);
   //     assert.equal(rep.toNumber(),testSetup.reputationArray[1]+reputationReward);
   //  });
   //
   //  it("cannot initialize twice", async function() {
   //     var testSetup = await setup(accounts);
   //    try {
   //      await testSetup.JoinAndQuit.initialize(
   //                                             testSetup.org.avatar.address,
   //                                             testSetup.JoinAndQuitParams.votingMachine.absoluteVote.address,
   //                                             testSetup.JoinAndQuitParams.votingMachine.absoluteVote.address,
   //                                             helpers.NULL_ADDRESS
   //                                             );
   //      assert(false, 'cannot initialize twice');
   //    } catch (ex) {
   //      helpers.assertVMException(ex);
   //    }
   //   });
   //   it("execute proposeJoinAndQuit to self and redeem from external contract ", async function() {
   //     var testSetup = await setup(accounts,false,0,accounts[0]);
   //     var reputationReward = 12;
   //     var nativeTokenReward = 12;
   //     var ethReward = 12;
   //     await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,30,{from:accounts[1]});
   //     var externalTokenReward = 12;
   //     //send some ether to the org avatar
   //     await web3.eth.sendTransaction({from:accounts[0],to:testSetup.org.avatar.address, value:20});
   //     var tx = await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                    web3.utils.asciiToHex("description"),
   //                                                                    reputationReward,
   //                                                                    [nativeTokenReward,ethReward,externalTokenReward],
   //                                                                    testSetup.standardTokenMock.address,
   //                                                                    testSetup.JoinAndQuit.address,
   //                                                                    helpers.NULL_ADDRESS
   //                                                                  );
   //     //Vote with reputation to trigger execution
   //     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
   //     await testSetup.JoinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
   //     await testSetup.JoinAndQuit.redeem(proposalId,[true,true,true,true]);
   //     var contVault = await testSetup.JoinAndQuit.vault();
   //     var eth = await web3.eth.getBalance(contVault);
   //     assert.equal(eth,ethReward);
   //     var otherAvatar = await Avatar.new();
   //     await otherAvatar.initialize('otheravatar', helpers.NULL_ADDRESS, helpers.NULL_ADDRESS,accounts[0]);
   //
   //     //redeem ether
   //     try {
   //         await testSetup.JoinAndQuit.redeemEtherByRewarder(proposalId,otherAvatar.address,1,{from:accounts[1]});
   //         assert(false, 'only service contract can redeem');
   //       } catch (ex) {
   //         helpers.assertVMException(ex);
   //       }
   //     tx = await testSetup.JoinAndQuit.redeemEtherByRewarder(proposalId,otherAvatar.address,1);
   //     assert.equal(tx.logs.length, 1);
   //     assert.equal(tx.logs[0].event, "RedeemEther");
   //     assert.equal(tx.logs[0].args._amount, 1);
   //     var vault = await otherAvatar.vault();
   //     assert.equal(await web3.eth.getBalance(vault),1);
   //     //cannot redeem more than the proposal reward
   //     var proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.ethRewardLeft, ethReward - 1);
   //     try {
   //         await testSetup.JoinAndQuit.redeemEtherByRewarder(proposalId,otherAvatar.address,proposal.ethRewardLeft+1);
   //         assert(false, 'cannot redeem more than the proposal reward');
   //      } catch (ex) {
   //         helpers.assertVMException(ex);
   //     }
   //     await testSetup.JoinAndQuit.redeemEtherByRewarder(proposalId,otherAvatar.address,proposal.ethRewardLeft);
   //     assert.equal(await web3.eth.getBalance(vault),ethReward);
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.ethRewardLeft, 0);
   //
   //     //redeem nativeToken
   //     try {
   //         await testSetup.JoinAndQuit.redeemNativeTokenByRewarder(proposalId,otherAvatar.address,1,{from:accounts[1]});
   //         assert(false, 'only service contract can redeem');
   //       } catch (ex) {
   //         helpers.assertVMException(ex);
   //       }
   //     tx = await testSetup.JoinAndQuit.redeemNativeTokenByRewarder(proposalId,otherAvatar.address,1);
   //     assert.equal(tx.logs.length, 1);
   //     assert.equal(tx.logs[0].event, "RedeemNativeToken");
   //     assert.equal(tx.logs[0].args._amount, 1);
   //
   //     assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),1);
   //     //cannot redeem more than the proposal reward
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.nativeTokenRewardLeft, nativeTokenReward - 1);
   //     try {
   //         await testSetup.JoinAndQuit.redeemNativeTokenByRewarder(proposalId,otherAvatar.address,proposal.nativeTokenRewardLeft+1);
   //         assert(false, 'cannot redeem more than the proposal reward');
   //      } catch (ex) {
   //         helpers.assertVMException(ex);
   //     }
   //     await testSetup.JoinAndQuit.redeemNativeTokenByRewarder(proposalId,otherAvatar.address,proposal.nativeTokenRewardLeft);
   //     assert.equal(await testSetup.org.token.balanceOf(otherAvatar.address),nativeTokenReward);
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.nativeTokenRewardLeft, 0);
   //
   //
   //     //redeem externalToken
   //     try {
   //         await testSetup.JoinAndQuit.redeemExternalTokenByRewarder(proposalId,otherAvatar.address,1,{from:accounts[1]});
   //         assert(false, 'only service contract can redeem');
   //       } catch (ex) {
   //         helpers.assertVMException(ex);
   //       }
   //     tx = await testSetup.JoinAndQuit.redeemExternalTokenByRewarder(proposalId,otherAvatar.address,1);
   //     assert.equal(tx.logs.length, 1);
   //     assert.equal(tx.logs[0].event, "RedeemExternalToken");
   //     assert.equal(tx.logs[0].args._amount, 1);
   //
   //     assert.equal(await testSetup.standardTokenMock.balanceOf(otherAvatar.address),1);
   //     //cannot redeem more than the proposal reward
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.externalTokenRewardLeft, externalTokenReward - 1);
   //     try {
   //         await testSetup.JoinAndQuit.redeemExternalTokenByRewarder(proposalId,otherAvatar.address,proposal.externalTokenRewardLeft+1);
   //         assert(false, 'cannot redeem more than the proposal reward');
   //      } catch (ex) {
   //         helpers.assertVMException(ex);
   //     }
   //     await testSetup.JoinAndQuit.redeemExternalTokenByRewarder(proposalId,otherAvatar.address,proposal.externalTokenRewardLeft);
   //     assert.equal(await testSetup.standardTokenMock.balanceOf(otherAvatar.address),externalTokenReward);
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.externalTokenRewardLeft, 0);
   //
   //
   //     //redeem reputation
   //     try {
   //         await testSetup.JoinAndQuit.redeemReputationByRewarder(proposalId,otherAvatar.address,1,{from:accounts[1]});
   //         assert(false, 'only service contract can redeem');
   //       } catch (ex) {
   //         helpers.assertVMException(ex);
   //       }
   //     tx = await testSetup.JoinAndQuit.redeemReputationByRewarder(proposalId,otherAvatar.address,1);
   //     assert.equal(tx.logs.length, 1);
   //     assert.equal(tx.logs[0].event, "RedeemReputation");
   //     assert.equal(tx.logs[0].args._amount, 1);
   //
   //     assert.equal(await testSetup.org.reputation.balanceOf(otherAvatar.address),1);
   //     //cannot redeem more than the proposal reward
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.reputationChangeLeft, reputationReward - 1);
   //     try {
   //         await testSetup.JoinAndQuit.redeemReputationByRewarder(proposalId,otherAvatar.address,proposal.reputationChangeLeft+1);
   //         assert(false, 'cannot redeem more than the proposal reward');
   //      } catch (ex) {
   //         helpers.assertVMException(ex);
   //     }
   //     await testSetup.JoinAndQuit.redeemReputationByRewarder(proposalId,otherAvatar.address,proposal.reputationChangeLeft);
   //     assert.equal(await testSetup.org.reputation.balanceOf(otherAvatar.address),reputationReward);
   //     proposal = await testSetup.JoinAndQuit.organizationProposals(proposalId);
   //     assert.equal(proposal.reputationChangeLeft, 0);
   //
   //    });
   //
   //    it("negativ rep change is not allowed for rewarder to set ", async function() {
   //      var testSetup = await setup(accounts,false,0,accounts[0]);
   //      var reputationReward = -12;
   //      var nativeTokenReward = 12;
   //      var ethReward = 12;
   //      var externalTokenReward = 12;
   //      try {
   //           await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                       web3.utils.asciiToHex("description"),
   //                                                                       reputationReward,
   //                                                                       [nativeTokenReward,ethReward,externalTokenReward],
   //                                                                       testSetup.standardTokenMock.address,
   //                                                                       testSetup.JoinAndQuit.address,
   //                                                                       helpers.NULL_ADDRESS
   //                                                                     );
   //           assert(false, 'negativ rep change is not allowed for rewarder to set');
   //       } catch (ex) {
   //          helpers.assertVMException(ex);
   //      }
   //       await testSetup.JoinAndQuit.proposeJoinAndQuit(
   //                                                                     web3.utils.asciiToHex("description"),
   //                                                                     0,
   //                                                                     [nativeTokenReward,ethReward,externalTokenReward],
   //                                                                     testSetup.standardTokenMock.address,
   //                                                                     testSetup.JoinAndQuit.address,
   //                                                                     helpers.NULL_ADDRESS
   //                                                                   );
   //  });

});
