import * as ethers from 'ethers';
const bip39 = require('bip39');
import  { getWeb3 } from './utils.js';

import { Organization } from './organization.js';

// TODO: move all the provider connection stuff to settings.js
const ethProvider = process.env.ETH_PROVIDER || 'local'; // 'infura', 'etherscan', otherwise will default to local RPC (testrpc, Geth, or Parity..)
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

const web3 = getWeb3();

// This class is used to create new wallets, encrypt and unencrypt them, and send signed transactions using the privateKey
// It is particularly useful in e.g. a server side app, where the app manually handles unencrypting the wallet itself
export class Wallet {
  constructor() {}

  // Create a new wallet, generated deterministically from a mnemonic created using bip39
  static new() {
    let wallet = new Wallet();
    wallet.mnemonic = bip39.generateMnemonic();
    wallet.wallet = ethers.Wallet.fromMnemonic(wallet.mnemonic);
    wallet.wallet.provider = provider;
    return wallet;
  }

  static fromPrivateKey(privateKey) {
    let wallet = new Wallet();
    wallet.wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
  }

  // Unencrypt an encrypted Secret Storage JSON Wallet
  static async fromEncrypted(encryptedJSON, password, progressCallback) {
    let wallet = new Wallet();
    wallet.wallet = await ethers.Wallet.fromEncryptedWallet(encryptedJSON, password, progressCallback);
    wallet.wallet.provider = provider;
    return wallet;
  }

  // Recover a wallet from a mnemonic
  // TODO: what happens with an invalid mnemonic?
  static fromMnemonic(mnemonic) {
    let wallet = new Wallet();
    wallet.wallet = ethers.Wallet.fromMnemonic(mnemonic);
    wallet.mnemonic = mnemonic;
    wallet.wallet.provider = provider;
    return wallet;
  }

  // Encrypt a wallet and return the Secret Storage JSON
  async encrypt(password, progressCallback) {
    return await this.wallet.encrypt(password, progressCallback);
  }

  // Return amount of ether in the wallet.
  // If inWei = false then return num Ether as a string.
  // See details on units here http://ethdocs.org/en/latest/ether.html
  async getEtherBalance(inWei) {
    inWei = inWei || false;
    let wei = await web3.eth.getBalance(this.getPublicAddress());
    return inWei ? wei : Number(web3.fromWei(wei, "ether"));
  }

  getMnemonic() {
    return this.mnemonic;
  }

  // Return amount of an organization's token in the wallet.
  // If inWei = false then return num Ether as a formated string with one decimal place
  // See details on units here http://ethdocs.org/en/latest/ether.html
  async getOrgTokenBalance(organizationAvatarAddress, inWei) {
    inWei = inWei || false;
    let org = await Organization.at(organizationAvatarAddress);
    let balance = await org.token.balanceOf(this.getPublicAddress());
    return inWei ? web3.toWei(balance.valueOf(), "ether") : balance.valueOf();
  }

  getProvider() {
    return this.wallet.provider;
  }

  getPublicAddress() {
    return this.wallet.address;
  }

  async sendEther(toAccountAddress, numEther) {
    return await this.wallet.send(toAccountAddress, ethers.utils.parseEther(numEther.toString()));
  }

  async sendOrgTokens(organizationAvatarAddress, toAccountAddress, numTokens) {
    let org = await Organization.at(organizationAvatarAddress);

    // Get raw transaction data so we can sign ourselves
    let transactionData = org.token.transfer.request(toAccountAddress, numTokens, { from: this.getPublicAddress() }).params[0].data;

    var transaction = {
      to: org.token.address,
      value: 0,
      data: transactionData,
      // This ensures the transaction cannot be replayed on different networks
      chainId: ethers.providers.Provider.chainId[ethNetwork]
    };

    let transactionHash = await this.wallet.sendTransaction(transaction);
    return transactionHash;
  }
}
