const Controller = artifacts.require("./Controller.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const UniversalSimpleVote = artifacts.require("./UniversalSimpleVote.sol");
const GlobalConstraintRegistrar = artifacts.require("./GlobalConstraintRegistrar.sol");
const MintableToken = artifacts.require("./MintableToken.sol");
const Reputation = artifacts.require("./Reputation.sol");

/**
 * DAOStack library 
 *  
 */
// TODO: documentation! 

const daostack = (function() {
    // TODO: we probably need some kind of "initialize" function that sets 
    // the address of already deployed universal schemes

    function getDefaultAccount() {
        // TODO: this should be the default sender account that signs the transactions
        return web3.eth.accounts[0];
    }
    async function createSchemeRegistrar(opts={}) {
        // TODO: provide options to use an existing token or specifiy the new token
        const defaults = {
            fee: 0, // the fee to use this scheme
            beneficiary: getDefaultAccount(),
            tokenAddress: undefined, // the address of a token to use
        }

        const options = Object.assign({}, defaults, opts);
        
        let token;
        if (options.tokenAddress == undefined) {
            token = await MintableToken.new('schemeregistrartoken', 'SRT');

        } else {
            token = await MintableToken.at(options.tokenAddress);
        }
        return SchemeRegistrar.new(token.address, options.fee, options.beneficiary);
    }

    async function createUpgradeScheme() {
        // TODO: provide options to use an existing token or specifiy the new token
        const token = await MintableToken.new('upgradeSchemeToken', 'UST');
        const fee = 3;
        const beneficiary = web3.eth.accounts[1];
        return UpgradeScheme.new(token.address, fee, beneficiary);
    }

    async function createGCRegister() {
        // TODO: provide options to use an existing token or specifiy the new token
        const token = await MintableToken.new('gcregistertoken', 'GCT');
        const fee = 3;
        const beneficiary = web3.eth.accounts[1];
        return GlobalConstraintRegistrar.new(token.address, fee, beneficiary);
    }

    // create an organization. Returns on Organization object
    async function forgeOrganization(
        opts = {},
    ) {
        const accounts = web3.eth.accounts;
        
        // TODO: default options (needs to be extended), cf. https://github.com/daostack/daostack/issues/43
        const defaults = {
            founders: [accounts[0], accounts[1], accounts[2]],
            tokensForFounders: [1, 2, 3],
            repForFounders: [5, 8, 13],
            votePrec: 50,
        }

        const options = Object.assign({}, defaults, opts);

        let org = {}

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