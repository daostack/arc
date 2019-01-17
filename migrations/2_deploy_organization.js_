//this migration file is used only for testing purpose
var constants = require('../test/constants');
var Avatar = artifacts.require('./Avatar.sol');
var UController = artifacts.require('./UController.sol');
var DaoCreator = artifacts.require('./DaoCreator.sol');
var GlobalConstraintRegistrar = artifacts.require('./GlobalConstraintRegistrar.sol');
var SchemeRegistrar = artifacts.require('./SchemeRegistrar.sol');
var AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
var ContributionReward = artifacts.require('./ContributionReward.sol');
var UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
var ControllerCreator = artifacts.require('./ControllerCreator.sol');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';


// TEST_ORGANIZATION ORG parameters:
const orgName = "TEST_ORGANIZATION";
const tokenName = "TestToken";
const tokenSymbol = "TST";
const founders = [];
const initRep = web3.utils.toWei("10");
const initRepInWei = [initRep];
const initToken = web3.utils.toWei("1000");
const initTokenInWei = [initToken];
const cap = web3.utils.toWei("100000000","ether");



// DAOstack parameters for universal schemes:

const votePrec = 50;

var accounts;

//Deploy test organization with the following schemes:
//schemeRegistrar, upgradeScheme,globalConstraintRegistrar,simpleICO,contributionReward.
module.exports = async function(deployer) {
    deployer.deploy(ControllerCreator, {gas: constants.ARC_GAS_LIMIT}).then(async function(){
      var controllerCreator = await ControllerCreator.deployed();
      await deployer.deploy(DaoCreator,controllerCreator.address);
      var daoCreatorInst = await DaoCreator.deployed(controllerCreator.address,{gas: constants.ARC_GAS_LIMIT});
      // Create DAOstack:

      await web3.eth.getAccounts(function(err,res) { accounts = res; });
      founders[0] = accounts[0];
      var returnedParams = await daoCreatorInst.forgeOrg(orgName, tokenName, tokenSymbol, founders,
          initTokenInWei, initRepInWei,NULL_ADDRESS,cap,{gas: constants.ARC_GAS_LIMIT});
      var AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      await deployer.deploy(AbsoluteVote,{gas: constants.ARC_GAS_LIMIT});
      // Deploy AbsoluteVote:
      var AbsoluteVoteInst = await AbsoluteVote.deployed();
      // Deploy SchemeRegistrar:
      await deployer.deploy(SchemeRegistrar);
      var schemeRegistrarInst = await SchemeRegistrar.deployed();
      // Deploy UniversalUpgrade:
      await deployer.deploy(UpgradeScheme);
      var upgradeSchemeInst = await UpgradeScheme.deployed();
      // Deploy UniversalGCScheme register:
      await deployer.deploy(GlobalConstraintRegistrar);
      var globalConstraintRegistrarInst = await GlobalConstraintRegistrar.deployed();

      await deployer.deploy(ContributionReward);
      var contributionRewardInst = await ContributionReward.deployed();

      // Voting parameters and schemes params:
      var voteParametersHash = await AbsoluteVoteInst.getParametersHash(votePrec, NULL_ADDRESS);

      await schemeRegistrarInst.setParameters(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);
      var schemeRegisterParams = await schemeRegistrarInst.getParametersHash(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);
      await globalConstraintRegistrarInst.setParameters(voteParametersHash, AbsoluteVoteInst.address);
      var schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(voteParametersHash, AbsoluteVoteInst.address);
      await upgradeSchemeInst.setParameters(voteParametersHash, AbsoluteVoteInst.address);
      var schemeUpgradeParams = await upgradeSchemeInst.getParametersHash(voteParametersHash, AbsoluteVoteInst.address);

      await contributionRewardInst.setParameters(10,voteParametersHash, AbsoluteVoteInst.address);
      var contributionRewardParams = await contributionRewardInst.getParametersHash(10,voteParametersHash, AbsoluteVoteInst.address);

      var schemesArray = [schemeRegistrarInst.address,
                          globalConstraintRegistrarInst.address,
                          upgradeSchemeInst.address,
                          contributionRewardInst.address];
      const paramsArray = [schemeRegisterParams, schemeGCRegisterParams, schemeUpgradeParams,contributionRewardParams];
      const permissionArray = ['0x0000001F', '0x00000005', '0x0000000a','0x00000001'];

      // set DAOstack initial schmes:
      await daoCreatorInst.setSchemes(
        AvatarInst.address,
        schemesArray,
        paramsArray,
        permissionArray);
      //now deploy with universal controller
      await deployer.deploy(UController, {gas: constants.ARC_GAS_LIMIT});
      var uController = await UController.deployed();
      returnedParams = await daoCreatorInst.forgeOrg(orgName, tokenName, tokenSymbol, founders,
          initTokenInWei, initRepInWei,uController.address,cap,{gas: constants.ARC_GAS_LIMIT});
      AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      await daoCreatorInst.setSchemes(
          AvatarInst.address,
          schemesArray,
          paramsArray,
          permissionArray);
     });
  };
