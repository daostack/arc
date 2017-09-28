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
 * This must be called on library initialization else network will default to 'testrpc'.
 * Returns web3
 */
export function configure(options) {
    
    // not used at the moment:  const network = options && options.network && options.network.name ? options.network.name : 'testrpc';

    /** 
     * web3 is set automatically in testing and migration, or for production, in utils.requireContract() before the first contract is imported (as the contracts will have been via the export statements above).
     * Return it for use by the client.
     */
    return web3;
}
