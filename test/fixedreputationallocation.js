const helpers = require("./helpers");
const Avatar = artifacts.require("./Avatar.sol");
const DAOToken = artifacts.require("./DAOToken.sol");
const ActorsFactory = artifacts.require("./ActorsFactory.sol");
const DAOFactory = artifacts.require("./DAOFactory.sol");
const Controller = artifacts.require("./Controller.sol");
const ControllerFactory = artifacts.require("./ControllerFactory.sol");
const constants = require("./constants");
const BootstrapSchemesFactory = artifacts.require(
  "./BootstrapSchemesFactory.sol"
);
var FixedReputationAllocation = artifacts.require(
  "./FixedReputationAllocation.sol"
);

const setup = async function(accounts, _repAllocation = 300) {
  var testSetup = new helpers.TestSetup();

  var controller = await Controller.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var controllerFactory = await ControllerFactory.new(controller.address, {
    gas: constants.ARC_GAS_LIMIT
  });

  var avatarLibrary = await Avatar.new({ gas: constants.ARC_GAS_LIMIT });
  var daoTokenLibrary = await DAOToken.new({ gas: constants.ARC_GAS_LIMIT });

  var actorsFactory = await ActorsFactory.new(
    avatarLibrary.address,
    daoTokenLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  testSetup.daoFactory = await DAOFactory.new(
    controllerFactory.address,
    actorsFactory.address,
    {
      gas: constants.ARC_GAS_LIMIT
    }
  );

  testSetup.org = await helpers.setupOrganization(
    testSetup.daoFactory,
    accounts[0],
    0,
    0
  );

  var fixedReputationAllocationLibrary = await FixedReputationAllocation.new({
    gas: constants.ARC_GAS_LIMIT
  });

  var bootstrapSchemesFactory = await BootstrapSchemesFactory.new({
    gas: constants.ARC_GAS_LIMIT
  });

  await bootstrapSchemesFactory.setFixedReputationAllocationLibraryAddress(
    fixedReputationAllocationLibrary.address,
    { gas: constants.ARC_GAS_LIMIT }
  );

  testSetup.fixedReputationAllocation = await FixedReputationAllocation.at(
    (await bootstrapSchemesFactory.createFixedReputationAllocation(
      testSetup.org.avatar.address,
      _repAllocation
    )).logs[0].args._newSchemeAddress
  );

  var permissions = "0x00000000";
  await testSetup.daoFactory.setSchemes(
    testSetup.org.avatar.address,
    [testSetup.fixedReputationAllocation.address],
    [permissions]
  );
  return testSetup;
};

contract("FixedReputationAllocation", accounts => {
  it("initialize", async () => {
    let testSetup = await setup(accounts);
    assert.equal(
      await testSetup.fixedReputationAllocation.reputationReward(),
      300
    );
    assert.equal(await testSetup.fixedReputationAllocation.isEnable(), false);
  });

  it("add beneficiary", async () => {
    let testSetup = await setup(accounts);
    let tx = await testSetup.fixedReputationAllocation.addBeneficiary(
      accounts[0]
    );
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "BeneficiaryAddressAdded");
    assert.equal(tx.logs[0].args._beneficiary, accounts[0]);
  });

  it("add beneficiary check only owner", async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0], {
        from: accounts[1]
      });
      assert(false, "addBeneficiary is only owner");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("add beneficiaries", async () => {
    let testSetup = await setup(accounts);
    let tx = await testSetup.fixedReputationAllocation.addBeneficiaries(
      accounts
    );
    assert.equal(tx.logs.length, accounts.length);
  });

  it("redeem", async () => {
    let testSetup = await setup(accounts);
    let tx = await testSetup.fixedReputationAllocation.addBeneficiaries(
      accounts
    );
    assert.equal(
      await testSetup.fixedReputationAllocation.numberOfBeneficiaries(),
      accounts.length
    );
    assert.equal(
      await testSetup.fixedReputationAllocation.beneficiaryReward(),
      0
    );
    await testSetup.fixedReputationAllocation.enable();
    assert.equal(
      await testSetup.fixedReputationAllocation.beneficiaryReward(),
      300 / accounts.length
    );
    var beneficiaryReward;
    var reputation;
    for (var i = 0; i < accounts.length; i++) {
      tx = await testSetup.fixedReputationAllocation.redeem(accounts[i]);
      assert.equal(tx.logs.length, 1);
      assert.equal(tx.logs[0].event, "Redeem");
      beneficiaryReward = await testSetup.fixedReputationAllocation.beneficiaryReward();
      assert.equal(tx.logs[0].args._amount, beneficiaryReward.toNumber());
      reputation = await testSetup.org.reputation.balanceOf(accounts[i]);
      assert.equal(reputation.toNumber(), tx.logs[0].args._amount);
    }
  });

  it("redeem without enable should revert", async () => {
    let testSetup = await setup(accounts);
    await testSetup.fixedReputationAllocation.addBeneficiaries(accounts);
    try {
      await testSetup.fixedReputationAllocation.redeem(accounts[0]);
      assert(false, "redeem without enable should revert");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("redeem from none white listed beneficiary should revert", async () => {
    let testSetup = await setup(accounts);
    await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0]);
    await testSetup.fixedReputationAllocation.enable();
    try {
      await testSetup.fixedReputationAllocation.redeem(accounts[1]);
      assert(false, "redeem from none white listed beneficiary should revert");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("enable is onlyOwner", async () => {
    let testSetup = await setup(accounts);
    await testSetup.fixedReputationAllocation.addBeneficiary(accounts[0]);
    try {
      await testSetup.fixedReputationAllocation.enable({ from: accounts[1] });
      assert(false, "enable is onlyOwner");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });

  it("cannot initialize twice", async () => {
    let testSetup = await setup(accounts);
    try {
      await testSetup.fixedReputationAllocation.init(
        web3.eth.accounts[0],
        testSetup.org.avatar.address,
        100
      );
      assert(false, "cannot initialize twice");
    } catch (error) {
      helpers.assertVMException(error);
    }
  });
});
