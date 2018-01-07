// Imports:
var Avatar = artifacts.require('./schemes/controller/Avatar.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var GenesisScheme = artifacts.require('./schemes/GenesisScheme.sol');
var GlobalConstraintRegistrar = artifacts.require('./schemes/GlobalConstraintRegistrar.sol');
var DAOToken = artifacts.require('./schemes/controller/DAOToken.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var SchemeRegistrar = artifacts.require('./schemes/SchemeRegistrar.sol');
var SimpleICO = artifacts.require('./SimpleICO.sol');
var AbsoluteVote = artifacts.require('./AbsoluteVote.sol');
var ContributionReward = artifacts.require('./ContributionReward.sol');
var TokenCapGC = artifacts.require('./TokenCapGC.sol');
var UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
var OrganizationRegister = artifacts.require('./OrganizationRegister.sol');

// Instances:
var AbsoluteVoteInst;
var UniversalGenesisSchemeInst;
var schemeRegistrarInst;
var globalConstraintRegistrarInst;
var upgradeSchemeInst;
var ControllerInst;GenesisScheme
var OrganizationsBoardInst;
var ReputationInst;
var DAOTokenInst;
var AvatarInst;
var SimpleICOInst;

// DAOstack ORG parameters:
var orgName = "DAOstack";
var tokenName = "Stack";
var tokenSymbol = "STK";
var founders = [web3.eth.accounts[0]];
var initRep = 10;
var initRepInWei = [web3.toWei(initRep)];
var initToken = 1000;
var initTokenInWei = [web3.toWei(initToken)];
var tokenAddress;
var reputationAddress;
var avatarAddress;
var controllerAddress;

// DAOstack parameters for universal schemes:
var voteParametersHash;
var votePrec = 50;
var schemeRegisterParams;
var schemeGCRegisterParams;
var schemeUpgradeParams;

// Universal schemes fees:
var UniversalRegisterFee = web3.toWei(5);

module.exports = async function(deployer) {
    // Deploy GenesisScheme:
    // apparently we must wrap the first deploy call in a then to avoid
    // what seem to be race conditions during deployment
    // await deployer.deploy(GenesisScheme)
    deployer.deploy(GenesisScheme, {gas: 6500000}).then(async function(){
      genesisSchemeInst = await GenesisScheme.deployed();
      // Create DAOstack:
      returnedParams = await genesisSchemeInst.forgeOrg(orgName, tokenName, tokenSymbol, founders,
          initTokenInWei, initRepInWei);
      AvatarInst = await Avatar.at(returnedParams.logs[0].args._avatar);
      avatarAddress = AvatarInst.address;
      controllerAddress = await AvatarInst.owner();
      ControllerInst = await Controller.at(controllerAddress);
      tokenAddress = await ControllerInst.nativeToken();
      reputationAddress = await ControllerInst.nativeReputation();
      DAOTokenInst = await DAOToken.at(tokenAddress);
      await deployer.deploy(AbsoluteVote);
      // Deploy AbsoluteVote:
      AbsoluteVoteInst = await AbsoluteVote.deployed();
      // Deploy SchemeRegistrar:
      await deployer.deploy(SchemeRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
      schemeRegistrarInst = await SchemeRegistrar.deployed();
      // Deploy UniversalUpgrade:
      await deployer.deploy(UpgradeScheme, tokenAddress, UniversalRegisterFee, avatarAddress);
      upgradeSchemeInst = await UpgradeScheme.deployed();
      // Deploy UniversalGCScheme register:
      await deployer.deploy(GlobalConstraintRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
      globalConstraintRegistrarInst = await GlobalConstraintRegistrar.deployed();

      // Voting parameters and schemes params:
      voteParametersHash = await AbsoluteVoteInst.getParametersHash(reputationAddress, votePrec, true);

      await schemeRegistrarInst.setParameters(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);
      schemeRegisterParams = await schemeRegistrarInst.getParametersHash(voteParametersHash, voteParametersHash, AbsoluteVoteInst.address);

      await globalConstraintRegistrarInst.setParameters(reputationAddress, votePrec);
      schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(reputationAddress, votePrec);

      await upgradeSchemeInst.setParameters(voteParametersHash, AbsoluteVoteInst.address);
      schemeUpgradeParams = await upgradeSchemeInst.getParametersHash(voteParametersHash, AbsoluteVoteInst.address);

      // Transferring tokens to org to pay fees:
      await DAOTokenInst.transfer(AvatarInst.address, 3*UniversalRegisterFee);

      var schemesArray = [schemeRegistrarInst.address, globalConstraintRegistrarInst.address, upgradeSchemeInst.address];
      var paramsArray = [schemeRegisterParams, schemeGCRegisterParams, schemeUpgradeParams];
      var permissionArray = ['0x00000003', '0x00000005', '0x00000009'];
      var isUniversalArray = [true, true, true];

      // set DAOstack initial schmes:
      await genesisSchemeInst.setSchemes(
        AvatarInst.address,
        schemesArray,
        paramsArray,
        isUniversalArray,
        permissionArray);

      await deployer.deploy(SimpleICO, tokenAddress, UniversalRegisterFee, avatarAddress);
      await deployer.deploy(ContributionReward, tokenAddress, 0, avatarAddress);
    });

    await deployer.deploy(TokenCapGC);
  }
