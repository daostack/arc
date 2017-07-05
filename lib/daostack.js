const Controller = artifacts.require("./Controller.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");


const daostack = (function() {

    async function createSchemeRegistrar() {
        const token = await MintableToken.new('schemeregistrartoken', 'SRT');
        await token.mint(1000 * Math.pow(10, 18), web3.eth.accounts[0]);
        const fee = 3;
        const beneficary = web3.eth.accounts[1];
        return SchemeRegistrar.new(token.address, fee, beneficary);
    }

    async function createUpgradeScheme() {
        const token = await MintableToken.new('upgradeSchemeToken', 'UST');
        const fee = 3;
        const beneficary = web3.eth.accounts[1];
        return UpgradeScheme.new(token.address, fee, beneficary);
    }

    async function createGCRegister() {
        const token = await MintableToken.new('gcregistertoken', 'GCT');
        const fee = 3;
        const beneficary = web3.eth.accounts[1];
        return GlobalConstraintRegistrar.new(token.address, fee, beneficary);
    }


    async function forgeOrganization(
        opts = {},
    ) {
        const accounts = web3.eth.accounts;
        const defaults = {
            founders: [accounts[0], accounts[1], accounts[2]],
            tokensForFounders: [1, 2, 3],
            repForFounders: [5, 8, 13],
            votePrec: 50,
        }

        let org = {}
        const options = Object.assign({}, defaults, opts);

        const universalGenesisSchemeInst = await GenesisScheme.new()
        const tx = await universalGenesisSchemeInst.forgeOrg(
            "Shoes factory",
            "Shoes",
            "SHO",
            options.founders,
            options.tokensForFounders,
            options.repForFounders,
        );
       
        org.founders = options.founders;
        org.GenesisScheme = universalGenesisSchemeInst;
        // get the address of the controll from the logs
        const log = tx.logs[0];
        org.controllerAddress = log.args._controller;
        const controller = await Controller.at(org.controllerAddress);
        org.controller = controller;

        const schemeRegistrarInst = await createSchemeRegistrar();
        const universalUpgradeSchemeInst = await createUpgradeScheme(); 
        const universalGCRegisterInst = await createGCRegister();
        const simpleVoteInst = await UniversalSimpleVote.new();

        const tokenAddress = await controller.nativeToken();
        const reputationAddress = await controller.nativeReputation();

        const voteParametersHash = await simpleVoteInst.hashParameters(reputationAddress, options.votePrec);
        const schemeRegisterParams = await schemeRegistrarInst.parametersHash(voteParametersHash, voteParametersHash, simpleVoteInst.address);
        const schemeGCRegisterParams = await universalGCRegisterInst.parametersHash(voteParametersHash, simpleVoteInst.address);
        const schemeUpgradeParams = await universalUpgradeSchemeInst.parametersHash(voteParametersHash, simpleVoteInst.address);
     
        await universalGenesisSchemeInst.setInitialSchemes(
            org.controllerAddress,
            schemeRegistrarInst.address,
            universalUpgradeSchemeInst.address,
            universalGCRegisterInst.address,
            schemeRegisterParams,
            schemeUpgradeParams,
            schemeGCRegisterParams
        );
        org.schemeregistrar = schemeRegistrarInst;
        return org;
    }

    return  {
        forgeOrganization,
        createSchemeRegistrar,
        createGCRegister,
        createUpgradeScheme,
    }

}());

export { daostack };