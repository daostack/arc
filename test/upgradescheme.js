const helpers = require("./helpers");
const UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const AdminUpgradeabilityProxy = artifacts.require("./AdminUpgradeabilityProxy.sol");
const ImplementationProvider = artifacts.require("./ImplementationProvider.sol");

class UpgradeSchemeParams {
  constructor() {
  }
}

var registration;
const setupUpgradeSchemeParams = async function(
                                              accounts,
                                              genesisProtocol,
                                              token
                                            ) {
  var upgradeSchemeParams = new UpgradeSchemeParams();

  if (genesisProtocol === true) {
    upgradeSchemeParams.votingMachine = await helpers.setupGenesisProtocol(accounts,token,helpers.NULL_ADDRESS);
    upgradeSchemeParams.initdata = await new web3.eth.Contract(registration.upgradeScheme.abi)
                          .methods
                          .initialize(helpers.NULL_ADDRESS,
                            upgradeSchemeParams.votingMachine.genesisProtocol.address,
                            upgradeSchemeParams.votingMachine.uintArray,
                            upgradeSchemeParams.votingMachine.voteOnBehalf,
                            helpers.NULL_ADDRESS,
                            registration.packageInstance.address)
                          .encodeABI();
    } else {
      upgradeSchemeParams.votingMachine = await helpers.setupAbsoluteVote(helpers.NULL_ADDRESS,50);
      upgradeSchemeParams.initdata = await new web3.eth.Contract(registration.upgradeScheme.abi)
                        .methods
                        .initialize(helpers.NULL_ADDRESS,
                          upgradeSchemeParams.votingMachine.absoluteVote.address,
                          [0,0,0,0,0,0,0,0,0,0,0],
                          helpers.NULL_ADDRESS,
                          upgradeSchemeParams.votingMachine.params,
                          registration.packageInstance.address)
                        .encodeABI();
  }
  return upgradeSchemeParams;
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

  testSetup.upgradeSchemeParams= await setupUpgradeSchemeParams(
                     accounts,
                     genesisProtocol,
                     tokenAddress,
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
                                                                      [web3.utils.fromAscii("UpgradeScheme")],
                                                                      testSetup.upgradeSchemeParams.initdata,
                                                                      [helpers.getBytesLength(testSetup.upgradeSchemeParams.initdata)],
                                                                      [permissions],
                                                                      "metaData");
  testSetup.registration = registration;
  testSetup.upgradeScheme = await UpgradeScheme.at(await helpers.getSchemeAddress(registration.daoFactory.address,tx));
  return testSetup;
};

contract('UpgradeScheme', function(accounts) {
  before(function() {
    helpers.etherForEveryone(accounts);
  });

    it("proposeUpgrade log", async function() {
       var testSetup = await setup(accounts);

       await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

       var tx = await testSetup.upgradeScheme.proposeUpgrade(
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

       var tx = await testSetup.upgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH);

       var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
       await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,0,0,helpers.NULL_ADDRESS,{from:accounts[2]});
       //check organizationsProposals after execution
       var organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
       assert.equal(organizationProposal,false);
    });

    it("execute proposeVote -positive decision - proposal data delete", async function() {
        var testSetup = await setup(accounts);

        await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);

        var tx = await testSetup.upgradeScheme.proposeUpgrade(
          [0, 1, 1],
          [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
          [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
          helpers.NULL_HASH
        );

        var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');
        var organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal,true);

        await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
        //check organizationsProposals after execution
        organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
        assert.equal(organizationProposal,false);
     });

    it("execute proposeVote -positive decision - non existing package reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      try {
        await testSetup.upgradeScheme.proposeUpgrade(
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

    it("execute proposeVote -positive decision - non existing contract reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      try {
        await testSetup.upgradeScheme.proposeUpgrade(
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

    it("execute proposeVote -positive decision - unequal array lengths reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      try {
        await testSetup.upgradeScheme.proposeUpgrade(
          [0, 1, 1],
          [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken")],
          [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
          helpers.NULL_HASH
        );
        assert(false, "contract arrays lengths must match");
      } catch(error) {
        helpers.assertVMException(error);
      }
    });

    it("execute proposeVote -positive decision - too many contracts reverts", async function() {
      var testSetup = await setup(accounts);
      await helpers.registrationAddVersionToPackege(registration,[0, 1, 1]);
      let contractsNames = [];
      let contractsToUpgrade = [];
      for (let i = 0; i < 21; i++) {
        contractsNames.push(web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation"));
        contractsToUpgrade.push(testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address);
      }
      try {
        await testSetup.upgradeScheme.proposeUpgrade(
          [0, 1, 1],
          contractsNames,
          contractsToUpgrade,
          helpers.NULL_HASH
        );
        assert(false, "can upgrade up to 60 contracts at a time");
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

      var tx = await testSetup.upgradeScheme.proposeUpgrade(
        [0, 1, 1],
        [web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation")],
        [testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address],
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal,false);

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
    it("execute proposeVote -positive decision - verify version upgraded up to 60 contracts", async function() {
      this.timeout(50000);
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

      let contractsNames = [];
      let contractsToUpgrade = [];
      for (let i = 0; i < 20; i++) {
        contractsNames.push(web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation"));
        contractsToUpgrade.push(testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address);
      }

      var tx = await testSetup.upgradeScheme.proposeUpgrade(
        [0, 1, 1],
        contractsNames,
        contractsToUpgrade,
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      await testSetup.upgradeSchemeParams.votingMachine.absoluteVote.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal,false);

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
    })

    it("execute proposeVote -positive decision - verify version upgraded up to 60 contracts + genesisProtocol", async function() {
      this.timeout(50000);
      var testSetup = await setup(accounts,0,true,helpers.NULL_ADDRESS);
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

      let contractsNames = [];
      let contractsToUpgrade = [];
      for (let i = 0; i < 20; i++) {
        contractsNames.push(web3.utils.fromAscii("Avatar"),web3.utils.fromAscii("DAOToken"),web3.utils.fromAscii("Reputation"));
        contractsToUpgrade.push(testSetup.org.avatar.address, testSetup.org.token.address, testSetup.org.reputation.address);
      }

      var tx = await testSetup.upgradeScheme.proposeUpgrade(
        [0, 1, 1],
        contractsNames,
        contractsToUpgrade,
        helpers.NULL_HASH
      );
      var proposalId = await helpers.getValueFromLogs(tx, '_proposalId');

      await testSetup.upgradeSchemeParams.votingMachine.genesisProtocol.vote(proposalId,1,0,helpers.NULL_ADDRESS,{from:accounts[2]});
      var organizationProposal = await testSetup.upgradeScheme.organizationProposals(proposalId);
      assert.equal(organizationProposal,false);

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
          await testSetup.upgradeScheme.initialize(
            testSetup.org.avatar.address,
            testSetup.upgradeSchemeParams.votingMachine.absoluteVote.address,
            [0,0,0,0,0,0,0,0,0,0,0],
            helpers.NULL_ADDRESS,
            testSetup.upgradeSchemeParams.votingMachine.params,
            testSetup.registration.packageInstance.address
          );
          assert(false, "cannot init twice");
        } catch(error) {
          helpers.assertVMException(error);
        }

    });

});
