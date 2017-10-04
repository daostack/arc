export * from './daostack.js';
export * from './globalconstraintregistrar.js';
export * from './organization.js';
export * from './schemeregistrar.js';
export * from './settings.js';
export * from './simplecontributionscheme.js';
export * from './simplevote.js';
export * from './utils.js';
import  { web3 } from './utils.js';

/**
 * Configure the emergent-arc module.
 * 
 * @return: Web3 web3 as a convenience for the client.
 * `web3` is set automatically in testing and migration, or elsewhere (development, production) 
 * in utils.requireContract() when the first contract is imported
 * (as the contracts will have been done via the export statements at the top of this module).
 */
export function configure(options) {
    
    // not used at the moment:  const network = options && options.network && options.network.name ? options.network.name : 'testrpc';
    /**
     * TODO: supply testrpc url in options?  Problem is that at this point web3 has already been set in utils
     * so it's too late at this point to set the url.  Would need to somehow effect this initialization before
     * any contract imports have been attempted.  Need to figure out how to export the modules above somewhere
     * else, or separately.
     */

    return web3;
}