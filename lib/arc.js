export * from './organization.js';
export * from './globalconstraintregistrar.js';
export * from './upgradescheme.js';
export * from './schemeregistrar.js';
export * from './simplecontributionscheme.js';
export * from './utils.js';
import  { getWeb3 } from './utils.js';
import { getSettings } from './settings.js';

/**
 * Configure the emergent-arc module.
 * 
 * @return: Web3 web3 as a convenience for the client.
 * `web3` is set automatically by truffle in testing and migration, else manually (applications)
 * in utils.requireContract() when the first contract is imported
 * (as the contracts will have been done via the export statements at the top of this module).
 */
export function configure(options) {
    options; // for lint
    // not used at the moment:  const network = options && options.network && options.network.name ? options.network.name : 'testrpc';
    /**
     * TODO: supply testrpc url in options?  Problem is that at this point web3 has already been set in utils
     * so it's too late at this point to set the url.  Would need to somehow effect this initialization before
     * any contract imports have been attempted.  Need to figure out how to export the modules above somewhere
     * else, or separately.
     */

    return getWeb3();
}

/**
 * Returns and object with the following properties:
 * 
 *  allContracts:   An object with each property name being a key identifying a deployed Arc contract,
 *                  (example: "GlobalContraintRegistrar"), and value being an object containing:
 *                      address: of the deployed contract
 *                      contract: a TruffleContract
 * 
 *  schemes: An array containing the set of property values from allContracts that represent schemes
 *          Scheme contracts contain additional methods on "contract", including the following, plus others
 *          unique to each scheme:
 *              setParams(params: any): string (returns hash)
 *              getDefaultPermissions(): string (string represent permissions bits -- see Controller)
 * 
 *  votingMachines: An array containing the set of property values from allContracts that represent voting machines
 */
export async function getDeployedContracts() { 
    const contracts = (await getSettings()).daostackContracts;
    return {
        allContracts : contracts,
        schemes: [
            contracts.SchemeRegistrar
            , contracts.UpgradeScheme
            , contracts.GlobalConstraintRegistrar
            , contracts.SimpleContributionScheme
        ],
        votingMachines: [
            contracts.AbsoluteVote
        ]
    };
}