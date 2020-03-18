import * as helpers from './helpers';
const ArcUpgradeScheme = artifacts.require('./ArcUpgradeScheme.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const AdminUpgradeabilityProxy = artifacts.require("./AdminUpgradeabilityProxy.sol");
const ImplementationProvider = artifacts.require("./ImplementationProvider.sol");

export class ArcUpgradeSchemeParams {
  constructor() {
  }
}

var registration;
const setupArcUpgradeSchemeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token,
                                              avatarAddress,
                                            ) {
  var arcUpgradeSchemeParams = new ArcUpgradeSchemeParams();

  if (genesisProtocol === true) {
    arcUpgradeSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    arcUpgradeSchemeParams.initdata = await new web3.eth.Contract(registration.arcUpgradeScheme.abi)
                          .methods
                          .initialize(avatarAddress,
                            arcUpgradeSchemeParams.votingMachine.genesisProtocol.address,
                            arcUpgradeSchemeParams.votingMachine.params,
                            registration.packageInstance.address)
                          .encodeABI();
    } else {
      arcUpgradeSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      arcUpgradeSchemeParams.initdata = await new web3.eth.Contract(registration.arcUpgradeScheme.abi)
                        .methods
                        .initialize(avatarAddress,
                          arcUpgradeSchemeParams.votingMachine.absoluteVote.address,
                          arcUpgradeSchemeParams.votingMachine.params,
                          registration.packageInstance.address)
                        .encodeABI();
  }
  return arcUpgradeSchemeParams;
};

const setup = async function (accounts,reputationAccount=0,genesisProtocol = false,tokenAddress=0) {
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
  testSetup.org = await helpers.setupOrganizationWithArraysDAOFactory(testSetup.proxyAdmin,
                                                                      accounts,
                                                                      registration,
                                                                      [accounts[0],
                                                                      accounts[1],
                                                                      account2],
                                                                      [1000,0,0],
                                                                      testSetup.reputationArray);
  testSetup.arcUpgradeSchemeParams= await setupArcUpgradeSchemeParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
                     testSetup.org.avatar.address,
                     );

  var permissions = "0x0000001f";
  var tx = await registration.daoFactory.setSchemes(
                          testSetup.org.avatar.address,
                          [web3.utils.fromAscii("ArcUpgradeScheme")],
                          testSetup.arcUpgradeSchemeParams.initdata,
                          [helpers.getBytesLength(testSetup.arcUpgradeSchemeParams.initdata)],
                          [permissions],
                          "metaData",{from:testSetup.proxyAdmin});
  testSetup.registration = registration;
  testSetup.arcUpgradeScheme = await ArcUpgradeScheme.at(tx.logs[1].args._scheme);
  return testSetup;
};

contract('ArcUpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("proposeUpgrade log", async function() {
       var testSetup = await setup(accounts);

       await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

       var tx = await testSetup.arcUpgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH);
       assert.equal(tx.logs.length, 1);
       assert.equal(tx.logs[0].event, "NewUpgradeProposal");
    });

    it("execute proposeUpgrade -no decision - proposal data delete", async function() {
      var testSetup = await setup(accounts);

      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

       var tx = await testSetup.arcUpgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH);

       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.arcUpgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var organizationProposal = await testSetup.arcUpgradeScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.exist,false);
       assert.equal(organizationProposal.passed,false);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var testSetup = await setup(accounts);

        await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

        var tx = await testSetup.arcUpgradeScheme.proposeUpgrade(
          [0, 1, 1],
          [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
          [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
          helpers.NULL_HASH
        );

        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var organizationProposal = await testSetup.arcUpgradeScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal.exist,true);
        assert.equal(organizationProposal.passed,false);

        await testSetup.arcUpgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        organizationProposal = await testSetup.arcUpgradeScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal.exist,false);
        assert.equal(organizationProposal.passed,false);
     });

    it("execute proposeVote -positive decision - non existing package reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      try {
        await testSetup.arcUpgradeScheme.proposeUpgrade(
          [0, 1, 2],
          [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
          [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
          helpers.NULL_HASH
        );
        assert(false, "cannot upgrade to non existing package version");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("execute proposeVote -positive decision - non existing package reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      try {
        await testSetup.arcUpgradeScheme.proposeUpgrade(
          [0, 1, 1],
          [web3.utils.fromAscii("Avtar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
          [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
          helpers.NULL_HASH
        );
        assert(false, "cannot upgrade to non existing contract name");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("execute proposeVote -positive decision - cannot execute twice", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      var tx = await testSetup.arcUpgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

       await testSetup.arcUpgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       var organizationProposal = await testSetup.arcUpgradeScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal.exist,false);
       assert.equal(organizationProposal.passed,false); 
       try {
         await testSetup.arcUpgradeScheme.execute(proposalId);
         assert(false, "cannot call execute after it been executed");
       } catch(error) {
         helpers.assertVMException(error);
       }
    });

    it("execute proposeVote -positive decision - verify version upgraded", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

      let avatarProxy = await AdminUpgradeabilityProxy.at(testSetup.org.avatar.address);
      let tokenProxy = await AdminUpgradeabilityProxy.at(testSetup.org.token.address);
      let reputationProxy = await AdminUpgradeabilityProxy.at(testSetup.org.reputation.address);

      let oldImpAddress = await testSetup.registration.packageInstance.getContract([0,1,0]);
      let oldImp = await ImplementationProvider.at(oldImpAddress);

      assert.equal(
        await avatarProxy.implementation.call({from: testSetup.org.avatar.address}),
        await oldImp.getImplementation("Avatar")
      );
      assert.equal(
        await tokenProxy.implementation.call({from: testSetup.org.avatar.address}),
        await oldImp.getImplementation("DAOToken")
      );
      assert.equal(
        await reputationProxy.implementation.call({from: testSetup.org.avatar.address}),
        await oldImp.getImplementation("Reputation")
      );

      var tx = await testSetup.arcUpgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      await testSetup.arcUpgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var organizationProposal = await testSetup.arcUpgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal.exist,false);
      assert.equal(organizationProposal.passed,false); 
      
      let newImpAddress = await testSetup.registration.packageInstance.getContract([0,1,1]);
      let newImp = await ImplementationProvider.at(newImpAddress);

      assert.equal(
        await avatarProxy.implementation.call({from: testSetup.org.avatar.address}),
        await newImp.getImplementation("Avatar")
      );
      assert.equal(
        await tokenProxy.implementation.call({from: testSetup.org.avatar.address}),
        await newImp.getImplementation("DAOToken")
      );
      assert.equal(
        await reputationProxy.implementation.call({from: testSetup.org.avatar.address}),
        await newImp.getImplementation("Reputation")
      );
    });

    it("cannot init twice", async function() {
        var testSetup = await setup(accounts);

        try {
          await testSetup.arcUpgradeScheme.initialize(
            testSetup.org.avatar.address,
            testSetup.arcUpgradeSchemeParams.votingMachine.absoluteVote.address,
            testSetup.arcUpgradeSchemeParams.votingMachine.params,
            testSetup.registration.packageInstance.address
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }

    });

});
