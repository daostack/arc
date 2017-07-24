import  { Organization } from './organization.js';

const Controller = artifacts.require("./Controller.sol");
const Avatar = artifacts.require("./Avatar.sol");
const GenesisScheme = artifacts.require("./GenesisScheme.sol");
const SchemeRegistrar = artifacts.require("./SchemeRegistrar.sol");
const UpgradeScheme = artifacts.require("./UpgradeScheme.sol");
const SimpleVote = artifacts.require("./SimpleVote.sol");
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
        };

        const options = Object.assign({}, defaults, opts);

        let token;
        if (options.tokenAddress == undefined) {
            token = await MintableToken.new('schemeregistrartoken', 'SRT');

        } else {
            token = await MintableToken.at(options.tokenAddress);
        }
        return SchemeRegistrar.new(token.address, options.fee, options.beneficiary);
    }

    async function createUpgradeScheme(opts={}) {
        // TODO: provide options to use an existing token or specifiy the new token
        const defaults = {
            fee: 0, // the fee to use this scheme
            beneficiary: getDefaultAccount(),
            tokenAddress: undefined, // the address of a token to use
        };

        const options = Object.assign({}, defaults, opts);

        let token;
        if (options.tokenAddress == undefined) {
            token = await MintableToken.new('schemeregistrartoken', 'SRT');

        } else {
            token = await MintableToken.at(options.tokenAddress);
        }

        return UpgradeScheme.new(token.address, options.fee, options.beneficiary);
    }

    async function createGlobalConstraintRegistrar(opts={}) {
        // TODO: provide options to use an existing token or specifiy the new token
        const defaults = {
            fee: 0, // the fee to use this scheme
            beneficiary: getDefaultAccount(),
            tokenAddress: undefined, // the address of a token to use
        };

        const options = Object.assign({}, defaults, opts);

        let token;
        if (options.tokenAddress == undefined) {
            token = await MintableToken.new('schemeregistrartoken', 'SRT');

        } else {
            token = await MintableToken.at(options.tokenAddress);
        }
        return GlobalConstraintRegistrar.new(token.address, options.fee, options.beneficiary);
      }

    // create an organization. Returns on Organization object
    async function forgeOrganization(
        opts = {},
    ) {
        const msg = 'WARNING: daostack.forgeOrganization will be replaced by Organization.new';
        console.log(msg);
        throw msg;
        // const accounts = web3.eth.accounts;
        //
        // // TODO: default options (needs to be extended), cf. https://github.com/daostack/daostack/issues/43
        // const defaults = {
        //     founders: [accounts[0], accounts[1], accounts[2]],
        //     tokensForFounders: [1, 2, 3],
        //     repForFounders: [5, 8, 13],
        //     votePrec: 50
        // };
        //
        // const options = Object.assign({}, defaults, opts);
        //
        // let org = {};
        //
        // const universalGenesisSchemeInst = await GenesisScheme.new();
        //
        // const tx = await universalGenesisSchemeInst.forgeOrg(
        //     "Shoes factory",
        //     "Shoes",
        //     "SHO",
        //     options.founders,
        //     options.tokensForFounders,
        //     options.repForFounders,
        // );
        //
        // org.founders = options.founders;
        // org.GenesisScheme = universalGenesisSchemeInst;
        // // get the address of the avatar from the logs
        // const log = tx.logs[0];
        // org.avatarAddress =  log.args._avatar;
        // const avatar =  await Avatar.at(org.avatarAddress);
        // org.avatar = avatar;
        // const controllerAddress = await avatar.owner();
        // org.controllerAddress = controllerAddress;
        // const controller = await Controller.at(org.controllerAddress);
        // org.controller = controller;
        //
        // const schemeRegistrarInst = await createSchemeRegistrar();
        // const upgradeSchemeInst = await createUpgradeScheme();
        // const globalConstraintRegistrarInst = await createGlobalConstraintRegistrar();
        // const simpleVoteInst = await SimpleVote.new();
        // org.votingMachine = simpleVoteInst;
        // const tokenAddress = await controller.nativeToken();
        // const reputationAddress = await controller.nativeReputation();
        //
        // const voteParametersHash = await simpleVoteInst.getParametersHash(reputationAddress, options.votePrec);
        //
        // // not sure if next line is strictly needed
        // await schemeRegistrarInst.setParameters(voteParametersHash, voteParametersHash, simpleVoteInst.address);
        // const schemeRegisterParams = await schemeRegistrarInst.getParametersHash(voteParametersHash, voteParametersHash, simpleVoteInst.address);
        //
        // // not sure if next line is strictly needed
        // await globalConstraintRegistrarInst.setParameters(voteParametersHash, simpleVoteInst.address);
        // const schemeGCRegisterParams = await globalConstraintRegistrarInst.getParametersHash(voteParametersHash, simpleVoteInst.address);
        //
        // // not sure if next line is strictly needed
        // await upgradeSchemeInst.setParameters(voteParametersHash, simpleVoteInst.address);
        // const schemeUpgradeParams = await upgradeSchemeInst.getParametersHash(voteParametersHash, simpleVoteInst.address);
        //
        // const schemeRegisterFee = await schemeRegistrarInst.fee();
        // const schemeGCRegisterFee = await globalConstraintRegistrarInst.fee();
        // const schemeUpgradeFee = await upgradeSchemeInst.fee();
        // const schemeRegisterFeeToken = await schemeRegistrarInst.nativeToken();
        // const schemeGCRegisterFeeToken = await globalConstraintRegistrarInst.nativeToken();
        // const schemeUpgradeFeeToken = await upgradeSchemeInst.nativeToken();
        //
        // const permissionsArray = [3, 5, 9];
        //
        // await universalGenesisSchemeInst.setInitialSchemes(
        //     org.avatarAddress,
        //     [schemeRegistrarInst.address, upgradeSchemeInst.address, globalConstraintRegistrarInst.address],
        //     [schemeRegisterParams, schemeUpgradeParams, schemeGCRegisterParams],
        //     [schemeRegisterFeeToken, schemeGCRegisterFeeToken, schemeUpgradeFeeToken],
        //     [schemeRegisterFee, schemeGCRegisterFee, schemeUpgradeFee],
        //     permissionsArray
        // );
        // org.schemeregistrar = schemeRegistrarInst;
        //
        // // Set SchemeRegistrar nativeToken and register DAOstack to it:
        // await schemeRegistrarInst.registerOrganization(avatar.address);
        // await globalConstraintRegistrarInst.registerOrganization(avatar.address, voteParametersHash, simpleVoteInst.address);
        // await upgradeSchemeInst.registerOrganization(avatar.address, voteParametersHash, simpleVoteInst.address);
        //
        // return org;
    }

    async function _checkForNecessaryFunds() {
      // TODO: this is not working at all yet: the idea is that we check some precodnitions
      // to be able to give some useful user feedback
      return true;

      // check if we have tokens in the schemeregistrar for adding an organization
    	const schemeRegistrarTokenAddress = await schemeRegistrar.nativeToken();
    	const schemeRegistrarToken = await MintableToken.at(schemeRegistrarTokenAddress);
    	const avatarBalance = await schemeRegistrarToken.balanceOf(avatar.address);
    	const fee = await schemeRegistrar.fee();

    	// check if we have the funds to pay the fee
    	if (avatarBalance.toNumber() < fee.toNumber()) {
    		throw Error('The balance of the controller\'s avatar is too low to pay the fee for adding an organization. Balance: ' +  ourBalance.valueOf() + 'fee: '  + fee);
    	}

    	const beneficiary = await schemeRegistrar.beneficiary();
      await controller.ExternalTokenApprove(schemeRegistrarToken, beneficiary, fee.toNumber());
      // check if externaltokenapprove has indeed approved the right allowance
      // TODO: move this to a separate test on the controller
      const allowance = await schemeRegistrarToken.allowance(avatar.address, beneficiary);
    	if (allowance.toNumber() < fee.toNumber()) {
    		throw Error('The allowance of the controllers avatar to the registrars beneficiary is too low to pay the fee for adding an organization. Balance: ' +  ourBalance.valueOf() + 'fee: '  + fee);
    	}
    }

    return  {
        forgeOrganization,
        createSchemeRegistrar,
        createGlobalConstraintRegistrar,
        createUpgradeScheme,
    };

}());

export { daostack, Organization };
