// some utility functions

const TruffleContract = require('truffle-contract');
import Web3 from "web3";

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Returns TruffleContract given the name of the contract.
 *
 * When testing or migrating, uses .sol
 * Elsewhere (development, production), uses migrated .json
 *
 * Side effect:  It initializes (and uses) `web3` if a global `web3` is not already present, which
 * happens when running in the context of an application (as opposed to tests or migration).
 *
 * @param contractName
 */
export function requireContract(contractName) {
  if (typeof artifacts == 'object') {
    return artifacts.require(`./${contractName}.sol`);
  } else {

    try {
      let myWeb3 = getWeb3();

      const artifact = require(`../build/contracts/${contractName}.json`);
      const contract = new TruffleContract(artifact);

      contract.setProvider(myWeb3.currentProvider);
      contract.defaults({
        from: getDefaultAccount(),
        gas: 0x442168
      });
      return contract;

    } catch(ex) {
      return undefined;
    }
  }
}

var _web3;
var alreadyTriedAndFailed = false;

/**
 * throws an exception when web3 cannot be initialized or there is no default client
 */
export function getWeb3() {

  if (typeof web3 !== 'undefined') {
    return web3; // e.g. set by truffle in test and migration environments
  } else if (_web3) {
    return _web3;
  } else if (alreadyTriedAndFailed) {
    // then avoid time-consuming and futile retry
    throw new Error("already tried and failed");
  }

  var preWeb3;

  // already defined under `window`?
  if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
    // console.log(`Connecting via currentProvider`)
    preWeb3 = new Web3(windowWeb3.currentProvider);
  } else {
    // console.log(`Connecting via http://localhost:8545`)
    preWeb3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  if (!preWeb3) {
    alreadyTriedAndFailed = true;
    throw new Error("web3 not found");
  }

  return _web3 = preWeb3;
}

/**
 * @param tx The transaction
 * @param argName The name of the property whose value we wish to return, from  the args object: tx.logs[index].args[argName]
 * @param eventName Overrides index, identifies which log, where tx.logs[n].event  === eventName
 * @param index Identifies which log, when eventName is not given
 */
export function getValueFromLogs(tx, arg, eventName, index=0) {
  /**
   *
   * tx.logs look like this:
   *
   * [ { logIndex: 13,
   *     transactionIndex: 0,
   *     transactionHash: '0x999e51b4124371412924d73b60a0ae1008462eb367db45f8452b134e5a8d56c8',
   *     blockHash: '0xe35f7c374475a6933a500f48d4dfe5dce5b3072ad316f64fbf830728c6fe6fc9',
   *     blockNumber: 294,
   *     address: '0xd6a2a42b97ba20ee8655a80a842c2a723d7d488d',
   *     type: 'mined',
   *     event: 'NewOrg',
   *     args: { _avatar: '0xcc05f0cde8c3e4b6c41c9b963031829496107bbb' } } ]
   */
  if (!tx.logs || !tx.logs.length) {
    throw new Error('getValueFromLogs: Transaction has no logs');
  }

  if (eventName !== undefined) {
    for (let i=0; i < tx.logs.length; i++) {
      if (tx.logs[i].event  === eventName) {
        index = i;
        break;
      }
    }
    if (index === undefined) {
      let msg = `getValueFromLogs: There is no event logged with eventName ${eventName}`;
      throw new Error(msg);
    }
  } else {
    if (index === undefined) {
      index = tx.logs.length - 1;
    }
  }
  let result = tx.logs[index].args[arg];
  if (!result) {
    let msg = `getValueFromLogs: This log does not seem to have a field "${arg}": ${tx.logs[index].args}`;
    throw new Error(msg);
  }
  return result;
}

/**
 * side-effect is to set web3.eth.defaultAccount.
 * throws an exception on failure.
 */
export function getDefaultAccount() {
  let web3 = getWeb3();
  let defaultAccount = web3.eth.defaultAccount = web3.eth.defaultAccount || web3.eth.accounts[0];

  if (!defaultAccount) {
    throw new Error("eth.accounts[0] is not set");
  }

  // TODO: this should be the default sender account that signs the transactions
  return defaultAccount;
}

export const ExtendTruffleContract = (superclass) => class {
  constructor(contract) {
    this.contract = contract;
    for (var i in this.contract) {
      if (this[i] === undefined){
        this[i] = this.contract[i];
      }
    }
    // for (var prop in this.contract) {
    //   if (!this.hasOwnProperty(prop)) {
    //     this[prop] = superclass[prop];
    //   }
    // }
  }

  static async new() {
    contract = await superclass.new();
    return new this(contract);
  }

  static async at(address) {
    return new this((await superclass.at(address)));
  }

  static async deployed() {
    return new this(await superclass.deployed());
  }

  /**
   * Call setParameters on this scheme.
   * Returns promise of parameters hash.
   * If there are any parameters, then this function must be overridden by the subclass to provide them.
   * @param overrides -- object with properties whose names are expected by the scheme to correspond to parameters.  Overrides the defaults.
   *
   * Should have the following properties:
   *
   *  for all:
   *    voteParametersHash
   *    votingMachine -- address
   *
   *  for SimpleContributionScheme:
   *    orgNativeTokenFee -- number
   *    schemeNativeTokenFee -- number
   */
  // eslint-disable-next-line no-unused-vars
  async setParams(params) {
    return await '';
  }

  async _setParameters() {
     const parametersHash = await this.contract.getParametersHash(...arguments);
    await this.contract.setParameters(...arguments);
    return parametersHash;
  }

  /**
   * The subclass must override this for there to be any permissions at all, unless caller provides a value.
   */
  getDefaultPermissions(overrideValue) {
    return overrideValue || '0x00000000';
  }
};
