import * as ethers from 'ethers';
const bip39 = require('bip39');

import { Organization } from './organization.js';

// TODO: move all the provider connection stuff to settings.js
const ethProvider = process.env.ETH_PROVIDER; // If provider not specified will default to local RPC (testrpc, Geth, or Parity..)
const ethNetwork = process.env.ETH_NETWORK || 'kovan'; // Options are 'homestead', 'ropsten', 'rinkeby', 'kovan'
const ethApiToken = process.env.ETH_API_TOKEN; // Required for Infura or Etherscan

let provider;
switch (ethProvider) {
  case 'infura':
    provider = new ethers.providers.InfuraProvider(ethNetwork, ethApiToken);
    break;
  case 'etherscan':
    provider = new ethers.providers.EtherscanProvider(ethNetwork, ethApiToken);
    break;
  default:
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545', ethNetwork);
}

export class Wallet {
  constructor() {
  }

  static async new(password, progressCallback) {
    let wallet = new Wallet();
    wallet.mnemonic = bip39.generateMnemonic();
    wallet.wallet = ethers.Wallet.fromMnemonic(wallet.mnemonic);
    wallet.wallet.provider = provider;
    wallet.encryptedJSON = await wallet.wallet.encrypt(password, progressCallback);
    return wallet;
  }

  static async fromEncrypted(encryptedJSON, password, progressCallback) {
    let wallet = new Wallet();
    wallet.wallet = await ethers.Wallet.fromEncryptedWallet(encryptedJSON, password, progressCallback);
    wallet.wallet.provider = provider;
    wallet.encryptedJSON = encryptedJSON;
    return wallet;
  }


  async giveOrgTokens(organizationAvatarAddress, numTokens) {
    let org = await Organization.at(organizationAvatarAddress);
    org.token.transfer(this.getPublicAddress(), ethers.utils.parseEther(numTokens));
  }

  getEncryptedJSON() {
    return this.encryptedJSON;
  }

  async getEtherBalance() {
    return await this.wallet.getBalance();
  }

  getMnemonic() {
    return this.mnemonic;
  }

  async getOrgTokenBalance(organizationAvatarAddress) {
    let org = await Organization.at(organizationAvatarAddress);
    let balance = await org.controller.balanceOf(this.getPublicAddress());
    return ethers.utils.formatEther(balance);
  }

  getPublicAddress() {
    return this.wallet.address;
  }

  getProvider() {
    return this.wallet.provider;
  }

}
