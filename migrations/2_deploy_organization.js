//this migration file is used only for testing purpose
var constants = require("../test/constants");
var Avatar = artifacts.require("./Avatar.sol");
var DAOToken = artifacts.require("./DAOToken.sol");
var Controller = artifacts.require("./Controller.sol");
var ActorsFactory = artifacts.require("./ActorsFactory.sol");
var DAOFactory = artifacts.require("./DAOFactory.sol");
var GlobalConstraintRegistrar = artifacts.require(
  "./GlobalConstraintRegistrar.sol"
);
var SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
var SchemesFactory = artifacts.require("./SchemesFactory.sol");
var SimpleICO = artifacts.require("./SimpleICO.sol");
var AbsoluteVote = artifacts.require("./AbsoluteVote.sol");
var ContributionReward = artifacts.require("./ContributionReward.sol");
var UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
var ControllerFactory = artifacts.require("./ControllerFactory.sol");

// TEST_ORGANIZATION ORG parameters:
const orgName = "TEST_ORGANIZATION";
const tokenName = "TestToken";
const tokenSymbol = "TST";
const founders = [];
const initRep = web3.utils.toWei("10");
const initRepInWei = [initRep];
const initToken = web3.utils.toWei("1000");
const initTokenInWei = [initToken];
const cap = web3.utils.toWei("100000000", "ether");

const NULL_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
// DAOstack parameters for universal schemes:

const votePrec = 50;

var accounts;

//Deploy test organization with the following schemes:
//schemeRegistrar, upgradeScheme,globalConstraintRegistrar,simpleICO,contributionReward.
module.exports = async function(deployer) {
  deployer
    .deploy(Controller, { gas: constants.ARC_GAS_LIMIT })
    .then(async function() {
      var controller = await Controller.deployed();

      await deployer.deploy(ControllerFactory, controller.address);

      var controllerFactory = await ControllerFactory.deployed();

      await deployer.deploy(Avatar);
      await deployer.deploy(DAOToken);

      var avatarLibrary = await Avatar.deployed();
      var daoTokenLibrary = await DAOToken.deployed();

      await deployer.deploy(
        ActorsFactory,
        avatarLibrary.address,
        daoTokenLibrary.address
      );

      var actorsFactory = await ActorsFactory.deployed();

      await deployer.deploy(
        DAOFactory,
        controllerFactory.address,
        actorsFactory.address
      );

      var daoFactoryInst = await DAOFactory.deployed();

      await deployer.deploy(SchemesFactory);

      var schemesFactoryInst = await SchemesFactory.deployed();

      // Create DAOstack:
      await web3.eth.getAccounts(function(err, res) {
        accounts = res;
      });

      founders[0] = accounts[0];

      var returnedParams = await daoFactoryInst.forgeOrg(
        orgName,
        tokenName,
        tokenSymbol,
        founders,
        initTokenInWei,
        initRepInWei,
        cap,
        { gas: constants.ARC_GAS_LIMIT }
      );

      var AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      await deployer.deploy(AbsoluteVote, { gas: constants.ARC_GAS_LIMIT });
      // Deploy AbsoluteVote:
      var AbsoluteVoteInst = await AbsoluteVote.deployed();

      // Deploy UniversalGCScheme register:
      await deployer.deploy(GlobalConstraintRegistrar);
      var globalConstraintRegistrarInst = await GlobalConstraintRegistrar.deployed();

      await deployer.deploy(SchemeRegistrar);

      await deployer.deploy(SimpleICO);

      await deployer.deploy(ContributionReward);

      await deployer.deploy(UpgradeScheme);

      var contributionRewardLibrary = await ContributionReward.deployed();

      var schemeRegistrarLibrary = await SchemeRegistrar.deployed();

      var simpleICOLibrary = await SimpleICO.deployed();

      var upgradeSchemeLibrary = await UpgradeScheme.deployed();

      schemesFactoryInst.setSchemeRegistrarLibraryAddress(
        schemeRegistrarLibrary.address
      );

      schemesFactoryInst.setSimpleICOLibraryAddress(simpleICOLibrary.address);

      schemesFactoryInst.setContributionRewardLibraryAddress(
        contributionRewardLibrary.address
      );

      schemesFactoryInst.setUpgradeSchemeLibraryAddress(
        upgradeSchemeLibrary.address
      );

      // Voting parameters and schemes params:
      var voteParametersHash = await AbsoluteVoteInst.getParametersHash(
        votePrec,
        true
      );

      var SchemeRegistrarInstTx = await schemesFactoryInst.createSchemeRegistrar(
        AvatarInst.address,
        AbsoluteVoteInst.address,
        voteParametersHash,
        voteParametersHash
      );

      var schemeRegistrarInst = await SchemeRegistrar.at(
        SchemeRegistrarInstTx.logs[0].args._newSchemeAddress
      );

      await globalConstraintRegistrarInst.setParameters(
        voteParametersHash,
        AbsoluteVoteInst.address
      );
      var schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(
        voteParametersHash,
        AbsoluteVoteInst.address
      );

      var upgradeSchemeInstTx = await schemesFactoryInst.createUpgradeScheme(
        AvatarInst.address,
        AbsoluteVoteInst.address,
        voteParametersHash
      );

      var upgradeSchemeInst = await UpgradeScheme.at(
        upgradeSchemeInstTx.logs[0].args._newSchemeAddress
      );

      var simpleICOInstTx = await schemesFactoryInst.createSimpleICO(
        AvatarInst.address,
        1000,
        1,
        1,
        2,
        web3.eth.accounts[0]
      );

      var simpleICOInst = await SimpleICO.at(
        simpleICOInstTx.logs[0].args._newSchemeAddress
      );

      var contributionRewardInstTx = await schemesFactoryInst.createContributionReward(
        AvatarInst.address,
        AbsoluteVoteInst.address,
        voteParametersHash,
        10
      );

      var contributionRewardInst = await ContributionReward.at(
        contributionRewardInstTx.logs[0].args._newSchemeAddress
      );

      var schemesArray = [
        schemeRegistrarInst.address,
        globalConstraintRegistrarInst.address,
        upgradeSchemeInst.address,
        simpleICOInst.address,
        contributionRewardInst.address
      ];
      const paramsArray = [
        NULL_HASH,
        schemeGCRegisterParams,
        NULL_HASH,
        NULL_HASH,
        NULL_HASH
      ];
      const permissionArray = [
        "0x0000001F",
        "0x00000005",
        "0x0000000a",
        "0x00000001",
        "0x00000001"
      ];

      // set DAOstack initial schmes:
      await daoFactoryInst.setSchemes(
        AvatarInst.address,
        schemesArray,
        paramsArray,
        permissionArray
      );
    });
};
