// Imports:
var UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
var UniversalGenesisScheme = artifacts.require('./schemes/UniversalGenesisScheme.sol');
var SchemeRegistrar = artifacts.require('./schemes/SchemeRegistrar.sol');
var GlobalConstraintRegistrar = artifacts.require('./schemes/GlobalConstraintRegistrar.sol');
var UniversalUpgradeScheme = artifacts.require('./UniversalUpgradeScheme.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var MintableToken = artifacts.require('./schemes/controller/MintableToken.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var Avatar = artifacts.require('./schemes/controller/Avatar.sol');

// Instances:
var UniversalSimpleVoteInst;
var UniversalGenesisSchemeInst;
var schemeRegistrarInst;
var UniversalGCRegisterInst;
var UniversalUpgradeSchemeInst;
var ControllerInst;
var OrganizationsBoardInst;
var ReputationInst;
var MintableTokenInst;
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

// DAOstack parameters for universal schemes:
var voteParametersHash;
var votePrec = 50;
var schemeRegisterParams;
var schemeGCRegisterParams;
var schemeUpgradeParams;

// Universal schemes fees:
var UniversalRegisterFee = web3.toWei(5);

module.exports = async function(deployer) {
    // Deploy UniversalGenesisScheme:
    // apparently we must wrap the first deploy call in a then to avoid 
    // what seem to be race conditions during deployment
    // await deployer.deploy(UniversalGenesisScheme)
    deployer.deploy(UniversalGenesisScheme).then(async function(){

        UniversalGenesisSchemeIsnt = await UniversalGenesisScheme.deployed();
        // Create DAOstack:
        returnedParams = await UniversalGenesisSchemeIsnt.forgeOrg(orgName, tokenName, tokenSymbol, founders,
            initTokenInWei, initRepInWei);
        ControllerInst = await Controller.at(returnedParams.logs[0].args._controller);
        tokenAddress = await ControllerInst.nativeToken();
        reputationAddress = await ControllerInst.nativeReputation();
        MintableTokenInst = await MintableToken.at(tokenAddress);
        avatarAddress = await ControllerInst.avatar();
        AvatarInst = await Avatar.at(avatarAddress);
        await deployer.deploy(UniversalSimpleVote);
        // Deploy UniversalSimpleVote:
        UniversalSimpleVoteInst = await UniversalSimpleVote.deployed();
        // Deploy SchemeRegistrar:
        await deployer.deploy(SchemeRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
        schemeRegistrarInst = await SchemeRegistrar.deployed();
        // Deploy UniversalUpgrade:
        await deployer.deploy(UniversalUpgradeScheme, tokenAddress, UniversalRegisterFee, avatarAddress);
        UniversalUpgradeSchemeInst = await UniversalUpgradeScheme.deployed();
        // Deploy UniversalGCScheme register:
        await deployer.deploy(GlobalConstraintRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
        UniversalGCRegisterInst = await GlobalConstraintRegistrar.deployed();
        // Voting parameters and schemes params:
        voteParametersHash = await UniversalSimpleVoteInst.hashParameters(reputationAddress, votePrec);
        schemeRegisterParams = await schemeRegistrarInst.parametersHash(voteParametersHash, voteParametersHash, UniversalSimpleVoteInst.address);
        schemeGCRegisterParams = await UniversalGCRegisterInst.parametersHash(voteParametersHash, UniversalSimpleVoteInst.address);
        schemeUpgradeParams = await UniversalUpgradeSchemeInst.parametersHash(voteParametersHash, UniversalSimpleVoteInst.address);
        // set DAOstack initial schmes:
        await UniversalGenesisSchemeIsnt.setInitialSchemes(
            ControllerInst.address,
            schemeRegistrarInst.address,
            UniversalUpgradeSchemeInst.address,
            UniversalGCRegisterInst.address,
            schemeRegisterParams,
            schemeUpgradeParams,
            schemeGCRegisterParams);

        // Set SchemeRegistrar nativeToken and register DAOstack to it:
        await MintableTokenInst.approve(schemeRegistrarInst.address, UniversalRegisterFee);
        await schemeRegistrarInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, voteParametersHash, UniversalSimpleVote.address);
        await MintableTokenInst.approve(UniversalGCRegisterInst.address, UniversalRegisterFee);
        await UniversalGCRegisterInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, UniversalSimpleVote.address);
        // Set UniversalUpgradeScheme nativeToken and register DAOstack to it:
        await MintableTokenInst.approve(UniversalUpgradeSchemeInst.address, UniversalRegisterFee);
        await UniversalUpgradeSchemeInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, UniversalSimpleVote.address);
        return;
    })
};
