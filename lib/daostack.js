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

import { getDefaultAccount } from './utils.js';


/**
 * DAOStack library
 *
 */
// TODO: documentation!

const daostack = (function() {

    async function createSchemeRegistrar(opts={}) {
        // TODO: remove this function, use SchemeREgistrar.new(..) instead
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
        // TODO: remove this function, use UpgradeScheme.new(..) instead
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

    // create an organization. Returns on Organization object
    async function forgeOrganization(
        opts = {},
    ) {
        const msg = 'WARNING: daostack.forgeOrganization will be replaced by Organization.new';
        console.log(msg);
        throw msg;
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
        createSchemeRegistrar,
        createUpgradeScheme,
    };

}());

export { daostack, Organization };
