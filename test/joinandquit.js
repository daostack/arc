const helpers = require("./helpers");
const JoinAndQuit = artifacts.require("./JoinAndQuit.sol");
const ERC20Mock = artifacts.require('./test/ERC20Mock.sol');
const Avatar = artifacts.require("./Avatar.sol");

class JoinAndQuitParams {
  constructor() {
  }
}

const addMember = async function(accounts,_testSetup,_fee,_from) {
  var tx = await _testSetup.joinAndQuit.proposeToJoin(
                                                       "description-hash",
                                                       _fee,
                                                       {value:_fee,from:_from});

  //Vote with reputation to trigger execution
  var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
  await _testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
  return tx;
};

const avatarBalance = async function(_testSetup) {
 let avatar = await Avatar.at(_testSetup.org.avatar.address);
 var vault =  await avatar.vault();
 return  await web3.eth.getBalance(vault);
};

const setupJoinAndQuit = async function(
                                            accounts,
                                            genesisProtocol,
                                            token,
                                            _fundingToken,
                                            _minFeeToJoin,
                                            _memberReputation,
                                            _fundingGoal,
                                            _fundingGoalDeadline,
                                            _rageQuitEnable = true,
                                            ) {
  var joinAndQuitParams = new JoinAndQuitParams();

  if (genesisProtocol === true) {
    joinAndQuitParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    joinAndQuitParams.initdata = await new web3.eth.Contract(registration.joinAndQuit.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            joinAndQuitParams.votingMachine.genesisProtocol.address,
                            joinAndQuitParams.votingMachine.uintArray,
                            joinAndQuitParams.votingMachine.voteOnBehalf,
                            helpers.NULL_HASH,
                            _fundingToken,
                            _minFeeToJoin,
                            _memberReputation,
                            _fundingGoal,
                           _fundingGoalDeadline,
                           _rageQuitEnable)
                          .encodeABI();
    } else {
  joinAndQuitParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
  joinAndQuitParams.initdata = await new web3.eth.Contract(registration.joinAndQuit.abi)
                        .methods
                        .initialize(helpers.NULL_ADDRESS,
                          joinAndQuitParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          joinAndQuitParams.votingMachine.params,
                          _fundingToken,
                          _minFeeToJoin,
                          _memberReputation,
                          _fundingGoal,
                         _fundingGoalDeadline,
                         _rageQuitEnable)
                        .encodeABI();
  }
  return joinAndQuitParams;
};
var registration;
const setup = async function (accounts,
                              ethFunding = false,
                              genesisProtocol = false,
                              tokenAddress=helpers.NULL_ADDRESS,
                              minFeeToJoin = 100,
                              memberReputation = 100,
                              fundingGoal = 1000,
                              fundingGoalDeadline = 3000,
                              rageQuitEnable = true) {
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

  testSetup.joinAndQuitParams= await setupJoinAndQuit(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     fundPath,
                     minFeeToJoin,
                     memberReputation,
                     fundingGoal,
                     testSetup.fundingGoalDeadline,
                     rageQuitEnable);

  var permissions = "0x00000000";
  [testSetup.org,tx] = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[2]],
                                                                      [0],
                                                                      testSetup.reputationArray,
                                                                      0,
                                                                      [web3.utils.fromAscii("JoinAndQuit")],
                                                                      testSetup.joinAndQuitParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.joinAndQuitParams.initdata)],
                                                                      [permissions],
                                                                      "metaData");

  testSetup.joinAndQuit = await JoinAndQuit.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));

  await testSetup.standardTokenMock.transfer(accounts[3],10000);

  return testSetup;
};
contract('JoinAndQuit', accounts => {

    it("initialize", async function() {
       var testSetup = await setup(accounts);
       assert.equal(await testSetup.joinAndQuit.votingMachine(),testSetup.joinAndQuitParams.votingMachine.absoluteVote.address);
       assert.equal(await testSetup.joinAndQuit.fundingGoalDeadline(),testSetup.fundingGoalDeadline);
    });

    it("propose log", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});

      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                            {from:accounts[3]});

      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),testSetup.minFeeToJoin);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "JoinInProposal");
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(tx.logs[0].args._descriptionHash, "description-hash");
      assert.equal(tx.logs[0].args._proposedMember, accounts[3]);
      assert.equal(tx.logs[0].args._feeAmount, testSetup.minFeeToJoin);
     });

     it("propose log with eth", async function() {
       var testSetup = await setup(accounts,true);

       var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                            "description-hash",
                                                            testSetup.minFeeToJoin,

                                                            {value:testSetup.minFeeToJoin,from:accounts[3]});

       assert.equal(await web3.eth.getBalance(testSetup.joinAndQuit.address),testSetup.minFeeToJoin);
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
           await testSetup.joinAndQuit.proposeToJoin(
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

      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin*2);
      await testSetup.joinAndQuit.proposeToJoin(
                                               "description-hash",
                                                testSetup.minFeeToJoin);

      try {
        await testSetup.joinAndQuit.proposeToJoin(
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
       await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,
                                                 testSetup.minFeeToJoin*2,
                                                 {from:candidate});
       var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                          "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:candidate});
       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       await testSetup.joinAndQuit.redeemReputation(proposalId);


       try {
       await testSetup.joinAndQuit.proposeToJoin(
                                                "description-hash",
                                                 testSetup.minFeeToJoin,
                                                 {from:candidate});
            assert(false, 'proposer already have reputation');
         } catch (ex) {
            helpers.assertVMException(ex);
        }
      });


    it("proposeJoinAndQuit check minFeeToJoin", async() => {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.proposeToJoin(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin-1);
         assert(false, 'minFeeToJoin');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
  });

    it("proposeJoinAndQuit check minFeeToJoin with eth", async() => {
      var testSetup = await setup(accounts,true);
      try {
         await testSetup.joinAndQuit.proposeToJoin(
                                                    "description-hash",
                                                    testSetup.minFeeToJoin-1,
                                                    {value:testSetup.minFeeToJoin-1});
         assert(false, 'minFeeToJoin');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
  });

    it("execute proposeJoinAndQuit yes ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var proposal = await testSetup.joinAndQuit.proposals(proposalId);
      assert.equal(proposal.accepted,true);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
     });

    it("execute proposeJoinAndQuit yes with eth", async function() {
      var testSetup = await setup(accounts,true);
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {value:testSetup.minFeeToJoin,from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var proposal = await testSetup.joinAndQuit.proposals(proposalId);
      assert.equal(proposal.accepted,true);
      assert.equal(await avatarBalance(testSetup),testSetup.minFeeToJoin);
      assert.equal(await web3.eth.getBalance(testSetup.joinAndQuit.address),0);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
     });

     it("execute proposeJoinAndQuit no", async function() {
       var testSetup = await setup(accounts);
       await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
       var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                            "description-hash",
                                                            testSetup.minFeeToJoin,
                                                            {from:accounts[3]});

       //Vote with reputation to trigger execution
       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
       await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var proposal = await testSetup.joinAndQuit.proposals(proposalId);
       assert.equal(proposal.accepted,false);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
       assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,0);
       assert.equal(await testSetup.standardTokenMock.balanceOf(accounts[3]),10000);
      });


   it("execute proposeJoinAndQuit no with eth", async function() {
     var testSetup = await setup(accounts,true);
     var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                          "description-hash",
                                                          testSetup.minFeeToJoin,
                                                          {value:testSetup.minFeeToJoin,from:accounts[3]});

     //Vote with reputation to trigger execution
     var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
     var balanceBefore = await web3.eth.getBalance(accounts[3]);
     await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,2,0,helpers.NULL_ADDRESS,{from:accounts[2]});
     var proposal = await testSetup.joinAndQuit.proposals(proposalId);
     assert.equal(proposal.accepted,false);
     assert.equal(await avatarBalance(testSetup),0);
     assert.equal(await web3.eth.getBalance(testSetup.joinAndQuit.address),0);
     assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,0);
     var BN = web3.utils.BN;
     var a = new BN(balanceBefore);
     var b = new BN(testSetup.minFeeToJoin);
     var expectedBalance = a.add(b);
     assert.equal(await web3.eth.getBalance(accounts[3]),expectedBalance);
    });

    it("reputation redeem ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.joinAndQuit.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.memberReputation);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.memberReputation);
      try {
         await testSetup.joinAndQuit.redeemReputation(proposalId);
         assert(false, 'cannot redeem twice');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("reputation redeem memberReputation 0", async function() {
      var testSetup = await setup(accounts, false, false, helpers.NULL_ADDRESS, 100, 0);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.joinAndQuit.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.minFeeToJoin);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.minFeeToJoin);
    });

    it("reputation redeem + genesisProtocol", async function() {
      var testSetup = await setup(accounts,false,true);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      tx = await testSetup.joinAndQuit.redeemReputation(proposalId);
      assert.equal(tx.logs[0].event, "RedeemReputation");
      assert.equal(tx.logs[0].args._amount, testSetup.memberReputation);
      assert.equal(await testSetup.org.reputation.balanceOf(accounts[3]),testSetup.memberReputation);
      try {
         await testSetup.joinAndQuit.redeemReputation(proposalId);
         assert(false, 'cannot redeem twice');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("reputation cannot redeemed ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

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

  it("rageQuit and redeem", async function() {
    var testSetup = await setup(accounts);
    await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
    var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                         "description-hash",
                                                         testSetup.minFeeToJoin,
                                                         {from:accounts[3]});

    //Vote with reputation to trigger execution
    var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
    await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
    assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
    await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.joinAndQuit.address),0);
    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),0);
    assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,0);
    try {
       await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
       assert(false, 'cannot rage quite twice without refunding');
    } catch (ex) {
       helpers.assertVMException(ex);
    }
    await testSetup.standardTokenMock.transfer(accounts[0],1000);
    await testSetup.standardTokenMock.transfer(accounts[1],1000);
    await testSetup.standardTokenMock.transfer(accounts[4],1000);

    await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,1000,{from:accounts[0]});
    await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,1000,{from:accounts[1]});
    await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,1000,{from:accounts[4]});
    await addMember(accounts,testSetup,300,accounts[0]);
    await addMember(accounts,testSetup,100,accounts[1]);
    await addMember(accounts,testSetup,500,accounts[4]);

    assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),900);
    assert.equal((await testSetup.joinAndQuit.fundings(accounts[0])).funding,300);
    assert.equal(await testSetup.joinAndQuit.totalDonation(),900);
    tx = await testSetup.joinAndQuit.rageQuit({from:accounts[0]});
    assert.equal(tx.logs[0].event, "RageQuit");
    assert.equal(tx.logs[0].args._refund, 300);
    tx = await testSetup.joinAndQuit.rageQuit({from:accounts[1]});
    assert.equal(tx.logs[0].args._refund, 100);
    await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,100);
    tx = await testSetup.joinAndQuit.rageQuit({from:accounts[4]});
    assert.equal(tx.logs[0].args._refund, 500+100);

    try {
      await testSetup.joinAndQuit.redeemReputation(proposalId);
      assert(false, 'reputation cannot redeemed after rageQuit');
   } catch (ex) {
      helpers.assertVMException(ex);
   }
  });

    it("rageQuit with eth", async function() {
      var testSetup = await setup(accounts,true);
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3],value:testSetup.minFeeToJoin});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      assert.equal(await avatarBalance(testSetup),testSetup.minFeeToJoin);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
      await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
      assert.equal(await web3.eth.getBalance(testSetup.joinAndQuit.address),0);
      assert.equal(await avatarBalance(testSetup),0);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,0);

      try {
         await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
         assert(false, 'cannot rage quite twice without refunding');
      } catch (ex) {
         helpers.assertVMException(ex);
      }

      await addMember(accounts,testSetup,300,accounts[0]);
      await addMember(accounts,testSetup,100,accounts[1]);
      await addMember(accounts,testSetup,500,accounts[4]);

      assert.equal(await avatarBalance(testSetup),900);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[0])).funding,300);
      assert.equal(await testSetup.joinAndQuit.totalDonation(),900);
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[0]});
      assert.equal(tx.logs[0].event, "RageQuit");
      assert.equal(tx.logs[0].args._refund, 300);
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[1]});
      assert.equal(tx.logs[0].args._refund, 100);
      await web3.eth.sendTransaction({to:testSetup.org.avatar.address, from:accounts[0], value:100});
      tx = await testSetup.joinAndQuit.rageQuit({from:accounts[4]});
      assert.equal(tx.logs[0].args._refund, 500+100);
    });

    it("checkFundedBeforeDeadLine ", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal,{from:accounts[3]});
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_KEY();
      let value = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_VALUE();
      assert.equal(await avatar.db(key),"");

      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.fundingGoal,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.joinAndQuit.getPastEvents('FundedBeforeDeadline', {
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

      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.fundingGoal,
                                                           {value:testSetup.fundingGoal,from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      tx = await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      await testSetup.joinAndQuit.getPastEvents('FundedBeforeDeadline', {
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
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal,{from:accounts[3]});
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
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal,{from:accounts[3]});
      let avatar = await Avatar.at(testSetup.org.avatar.address);
      let key = await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_KEY();
      await testSetup.joinAndQuit.FUNDED_BEFORE_DEADLINE_VALUE();
      assert.equal(await avatar.db(key),"");
      await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,testSetup.fundingGoal-1);
      var tx = await testSetup.joinAndQuit.setFundingGoalReachedFlag();
      await testSetup.joinAndQuit.getPastEvents('FundedBeforeDeadline', {
            fromBlock: tx.blockNumber,
            toBlock: 'latest'
        })
        .then(function(events){
            assert.equal(events.length,0);
        });
        //now fill up the funding goal..
        await testSetup.standardTokenMock.transfer(testSetup.org.avatar.address,1);
        tx = await testSetup.joinAndQuit.setFundingGoalReachedFlag();
        await testSetup.joinAndQuit.getPastEvents('FundedBeforeDeadline', {
              fromBlock: tx.blockNumber,
              toBlock: 'latest'
          })
          .then(function(events){
              assert.equal(events[0].event,"FundedBeforeDeadline");
          });
    });


    it("rageQuit not enable", async function() {
      var testSetup = await setup(accounts, false, false, helpers.NULL_ADDRESS, 100, 0,1000,3000,false);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.rageQuit({from:accounts[3]});
         assert(false, 'rageQuitEnable is false');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("refund", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.minFeeToJoin,{from:accounts[3]});
      var donatorBalance = await testSetup.standardTokenMock.balanceOf(accounts[3]);
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      assert.equal(await testSetup.standardTokenMock.balanceOf(testSetup.org.avatar.address),testSetup.minFeeToJoin);
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.refund({from:accounts[3]});
         assert(false, 'cannot refund before deadline');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
      await helpers.increaseTime(testSetup.fundingGoalDeadline);
      tx = await testSetup.joinAndQuit.refund({from:accounts[3]});
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "Refund");
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(tx.logs[0].args._beneficiary, accounts[3]);
      assert.equal(tx.logs[0].args._refund, testSetup.minFeeToJoin);
      assert.equal((await testSetup.standardTokenMock.balanceOf(accounts[3])).toString(),donatorBalance.toString());
    });

    it("refund - cannot if funding goal reached.", async function() {
      var testSetup = await setup(accounts);
      await testSetup.standardTokenMock.approve(testSetup.joinAndQuit.address,testSetup.fundingGoal+1,{from:accounts[3]});
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.fundingGoal+1,
                                                           {from:accounts[3]});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});

      await helpers.increaseTime(testSetup.fundingGoalDeadline);
      try {
         await testSetup.joinAndQuit.refund({from:accounts[3]});
         assert(false, 'cannot if funding goal reached');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });

    it("refund with eth", async function() {
      var testSetup = await setup(accounts,true);
      var tx = await testSetup.joinAndQuit.proposeToJoin(
                                                           "description-hash",
                                                           testSetup.minFeeToJoin,
                                                           {from:accounts[3],value:testSetup.minFeeToJoin});

      //Vote with reputation to trigger execution
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId',1);
      await testSetup.joinAndQuitParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      assert.equal((await testSetup.joinAndQuit.fundings(accounts[3])).funding,testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.refund({from:accounts[3]});
         assert(false, 'cannot refund before deadline');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
      await helpers.increaseTime(testSetup.fundingGoalDeadline);
      var balanceBefore = await avatarBalance(testSetup);
      tx = await testSetup.joinAndQuit.refund({from:accounts[3]});
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "Refund");
      assert.equal(tx.logs[0].args._avatar, testSetup.org.avatar.address);
      assert.equal(tx.logs[0].args._beneficiary, accounts[3]);
      assert.equal(tx.logs[0].args._refund, testSetup.minFeeToJoin);
      assert.equal(await avatarBalance(testSetup),balanceBefore - testSetup.minFeeToJoin);
      try {
         await testSetup.joinAndQuit.refund({from:accounts[3]});
         assert(false, 'cannot refund twice');
      } catch (ex) {
         helpers.assertVMException(ex);
      }
    });


});
