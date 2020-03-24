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
  testSetup.memberReputation = memberReputation;
  testSetup.fundingGoal = fundingGoal;

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

    it("donation", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      var tx = await testSetup.joinAndQuit.donate(10);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),10);
      assert.equal(tx.logs[0].event, "Donation");
      assert.equal(tx.logs[0].args._donation, 10);
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
     });

    it("reputation redeem ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           helpers.NULL_ADDRESS);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.joinAndQuit.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.memberReputation);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[0]),testSetup.reputationArray[0]+testSetup.memberReputation);
    });

    it("reputation cannot redeemed ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           helpers.NULL_ADDRESS);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      try {
         await testSetup.joinAndQuit.redeemReputation(proposalId);
         assert(false, 'reputation cannot redeemed');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("rageQuit", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      var tx = await testSetup.joinAndQuit.proposeToJoinIn(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           helpers.NULL_ADDRESS);

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal(await testSetup.joinAndQuit.fundings(accounts[0]),testSetup.minFeeToJoin);
      await testSetup.joinAndQuit.rageQuit();
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),0);
      assert.equal(await testSetup.joinAndQuit.fundings(accounts[0]),0);
      try {
         await testSetup.joinAndQuit.rageQuit();
         assert(false, 'cannot rage quite twice without refunding');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
      await testSetup.standardTokenMock.transfer(accounts[1],100);
      await testSetup.standardTokenMock.transfer(accounts[2],100);
      await testSetup.standardTokenMock.transfer(accounts[3],100);

      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,100,{from:accounts[1]});
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,100,{from:accounts[2]});
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,100,{from:accounts[3]});

      await testSetup.joinAndQuit.donate(3,{from:accounts[1]});
      await testSetup.joinAndQuit.donate(4,{from:accounts[1]});
      await testSetup.joinAndQuit.donate(1,{from:accounts[2]});
      await testSetup.joinAndQuit.donate(5,{from:accounts[3]});

      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),3+4+1+5);
      assert.equal(await testSetup.joinAndQuit.fundings(accounts[1]),7);
      assert.equal(await testSetup.joinAndQuit.totalDonation(),13);
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[1]});
      assert.equal(tx.logs[0].event, "RageQuit");
      assert.equal(tx.logs[0].args._refund, 3+4);
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[2]});
      assert.equal(tx.logs[0].args._refund, 1);
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,100);
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
      assert.equal(tx.logs[0].args._refund, 5+100);
    });

    it("checkFundedBeforeDeadLine ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal);
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_KEY();
      let value = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_VALUE();
      assert.equal(await avatar.db(key),"");
      var tx = await testSetup.joinAndQuit.donate(testSetup.fundingGoal);
      assert.equal(tx.logs[0].event, "FundedDeadLineReached");
      assert.equal(await avatar.db(key),value);
    });

    it("checkFundedBeforeDeadLine after deadline", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal);
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_KEY();
      assert.equal(await avatar.db(key),"");
      await helpers.increaseTime(testSetup.fundingGoalDeadLine);
      await testSetup.joinAndQuit.donate(testSetup.fundingGoal);
      assert.equal(await avatar.db(key),"");
    });
});
