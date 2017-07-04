// Imports:
var UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
var GenesisScheme = artifacts.require('./schemes/GenesisScheme.sol');
var SchemeRegistrar = artifacts.require('./schemes/SchemeRegistrar.sol');
var GlobalConstraintRegistrar = artifacts.require('./schemes/GlobalConstraintRegistrar.sol');
var UpgradeScheme = artifacts.require('./UpgradeScheme.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var MintableToken = artifacts.require('./schemes/controller/MintableToken.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var Avatar = artifacts.require('./schemes/controller/Avatar.sol');

// Instances:
var simpleVoteInst;
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
    // Deploy GenesisScheme:
    // apparently we must wrap the first deploy call in a then to avoid 
    // what seem to be race conditions during deployment
    // await deployer.deploy(GenesisScheme)
    deployer.deploy(GenesisScheme).then(async function(){

        genesisSchemeInst = await GenesisScheme.deployed();
        // Create DAOstack:
        returnedParams = await genesisSchemeInst.forgeOrg(orgName, tokenName, tokenSymbol, founders,
            initTokenInWei, initRepInWei);
        ControllerInst = await Controller.at(returnedParams.logs[0].args._controller);
        tokenAddress = await ControllerInst.nativeToken();
        reputationAddress = await ControllerInst.nativeReputation();
        MintableTokenInst = await MintableToken.at(tokenAddress);
        avatarAddress = await ControllerInst.avatar();
        AvatarInst = await Avatar.at(avatarAddress);
        await deployer.deploy(UniversalSimpleVote);
        // Deploy UniversalSimpleVote:
        simpleVoteInst = await UniversalSimpleVote.deployed();
        // Deploy SchemeRegistrar:
        await deployer.deploy(SchemeRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
        schemeRegistrarInst = await SchemeRegistrar.deployed();
        // Deploy UniversalUpgrade:
        await deployer.deploy(UpgradeScheme, tokenAddress, UniversalRegisterFee, avatarAddress);
        UniversalUpgradeSchemeInst = await UpgradeScheme.deployed();
        // Deploy UniversalGCScheme register:
        await deployer.deploy(GlobalConstraintRegistrar, tokenAddress, UniversalRegisterFee, avatarAddress);
        UniversalGCRegisterInst = await GlobalConstraintRegistrar.deployed();
        // Voting parameters and schemes params:
        voteParametersHash = await simpleVoteInst.hashParameters(reputationAddress, votePrec);
        schemeRegisterParams = await schemeRegistrarInst.parametersHash(voteParametersHash, voteParametersHash, simpleVoteInst.address);
        schemeGCRegisterParams = await UniversalGCRegisterInst.parametersHash(voteParametersHash, simpleVoteInst.address);
        schemeUpgradeParams = await UniversalUpgradeSchemeInst.parametersHash(voteParametersHash, simpleVoteInst.address);
        // set DAOstack initial schmes:
        await genesisSchemeInst.setInitialSchemes(
            ControllerInst.address,
            schemeRegistrarInst.address,
            UniversalUpgradeSchemeInst.address,
            UniversalGCRegisterInst.address,
            schemeRegisterParams,
            schemeUpgradeParams,
            schemeGCRegisterParams);

        // Set SchemeRegistrar nativeToken and register DAOstack to it:
        await MintableTokenInst.approve(schemeRegistrarInst.address, UniversalRegisterFee);
        await schemeRegistrarInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, voteParametersHash, simpleVoteInst.address);
        await MintableTokenInst.approve(UniversalGCRegisterInst.address, UniversalRegisterFee);
        await UniversalGCRegisterInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, simpleVoteInst.address);
        // Set UpgradeScheme nativeToken and register DAOstack to it:
        await MintableTokenInst.approve(UniversalUpgradeSchemeInst.address, UniversalRegisterFee);
        await UniversalUpgradeSchemeInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, simpleVoteInst.address);
        return;
    })
};
