//this migration file is used only for testing purpose
var constants = require('../test/constants');
var Avatar = artifacts.require('./Avatar.sol');
var Controller = artifacts.require('./Controller.sol');
var UController = artifacts.require('./UController.sol');
var DaoCreator = artifacts.require('./DaoCreator.sol');
var DaoOrgansCreator = artifacts.require('./DaoOrgansCreator.sol');
var GlobalConstraintRegistrar = artifacts.require('./GlobalConstraintRegistrar.sol');
var SchemeRegistrar = artifacts.require('./SchemeRegistrar.sol');
var SimpleICO = artifacts.require('./SimpleICO.sol');
var AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
var ContributionReward = artifacts.require('./ContributionReward.sol');
var UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
var DAOToken = artifacts.require('./DAOToken.sol');
var Reputation = artifacts.require('./Reputation.sol');

// TEST_ORGANIZATION ORG parameters:
const orgName = "TEST_ORGANIZATION";
const tokenName = "TestToken";
const tokenSymbol = "TST";
const founders = [web3.eth.accounts[0]];
const initRep = 10;
const initRepInWei = [web3.toWei(initRep)];
const initToken = 1000;
const initTokenInWei = [web3.toWei(initToken)];


// DAOstack parameters for universal schemes:

const votePrec = 50;

//Deploy test organization with the following schemes:
//schemeRegistrar, upgradeScheme,globalConstraintRegistrar,simpleICO,contributionReward.
module.exports = async function(deployer) {
    deployer.deploy(DaoCreator, {gas: constants.GENESIS_SCHEME_GAS_LIMIT}).then(async function(){
       await deployer.deploy(DaoOrgansCreator);
       var daoOrgansCreatorInst = await DaoOrgansCreator.deployed();
       var returnedParams = await daoOrgansCreatorInst.createDaoOrgans(tokenName, tokenSymbol, founders,
              initTokenInWei, initRepInWei);
       var reputationInst = await Reputation.at(returnedParams.logs[0].args._nativeReputation);
       var daoTokenInst = await DAOToken.at(returnedParams.logs[0].args._nativeToken);

      var daoCreatorInst = await DaoCreator.deployed();
      returnedParams = await daoCreatorInst.forgeOrg(daoOrgansCreatorInst.address,orgName, daoTokenInst.address, reputationInst.address,0,{gas: constants.GENESIS_SCHEME_GAS_LIMIT});
      avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      var ControllerInst = await Controller.at(await avatarInst.owner());
      var reputationAddress = await ControllerInst.nativeReputation();
      await deployer.deploy(AbsoluteVote);
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

      await deployer.deploy(SimpleICO);
      var simpleICOInst = await SimpleICO.deployed();

      await deployer.deploy(ContributionReward);
      var contributionRewardInst = await ContributionReward.deployed();

      // Voting parameters and schemes params:
      var voteParametersHash = await AbsoluteVoteInst.getParametersHash(reputationAddress, votePrec, true);

      await schemeRegistrarInst.setParameters(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);
      var schemeRegisterParams = await schemeRegistrarInst.getParametersHash(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);

      await globalConstraintRegistrarInst.setParameters(reputationAddress, votePrec);
      var schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(reputationAddress, votePrec);

      await upgradeSchemeInst.setParameters(voteParametersHash, AbsoluteVoteInst.address);
      var schemeUpgradeParams = await upgradeSchemeInst.getParametersHash(voteParametersHash, AbsoluteVoteInst.address);


      await simpleICOInst.setParameters(1000, 1, 1, 2, web3.eth.accounts[0], web3.eth.accounts[0]);
      var simpleICOParams = await simpleICOInst.getParametersHash(1000, 1, 1, 2, web3.eth.accounts[0], web3.eth.accounts[0]);
      await contributionRewardInst.setParameters(10,voteParametersHash, AbsoluteVoteInst.address);
      var contributionRewardParams = await contributionRewardInst.getParametersHash(10,voteParametersHash, AbsoluteVoteInst.address);

      var schemesArray = [schemeRegistrarInst.address,
                          globalConstraintRegistrarInst.address,
                          upgradeSchemeInst.address,
                          simpleICOInst.address,
                          contributionRewardInst.address];
      const paramsArray = [schemeRegisterParams, schemeGCRegisterParams, schemeUpgradeParams,simpleICOParams,contributionRewardParams];
      const permissionArray = ['0x0000001F', '0x00000005', '0x0000000a','0x00000001','0x00000001'];

      // set DAOstack initial schmes:
      await daoCreatorInst.setSchemes(
        avatarInst.address,
        schemesArray,
        paramsArray,
        permissionArray);
      //now deploy with universal controller
      await deployer.deploy(UController, {gas: constants.GENESIS_SCHEME_GAS_LIMIT});
      var uController = await UController.deployed();
      returnedParams = await daoOrgansCreatorInst.createDaoOrgans(tokenName, tokenSymbol, founders,
             initTokenInWei, initRepInWei);
      reputationInst = await Reputation.at(returnedParams.logs[0].args._nativeReputation);
      daoTokenInst = await DAOToken.at(returnedParams.logs[0].args._nativeToken);
      returnedParams = await daoCreatorInst.forgeOrg(daoOrgansCreatorInst.address,orgName,daoTokenInst.address, reputationInst.address,
                       uController.address,{gas: constants.GENESIS_SCHEME_GAS_LIMIT});
      avatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      await daoCreatorInst.setSchemes(
          avatarInst.address,
          schemesArray,
          paramsArray,
          permissionArray);
     });
  };
