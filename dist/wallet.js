'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wallet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ethers = require('ethers');

var ethers = _interopRequireWildcard(_ethers);

var _utils = require('./utils.js');

var _organization = require('./organization.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bip39 = require('bip39');


// TODO: move all the provider connection stuff to settings.js
var ethProvider = process.env.ETH_PROVIDER || 'local'; // 'infura', 'etherscan', otherwise will default to local RPC (testrpc, Geth, or Parity..)
var ethNetwork = process.env.ETH_NETWORK || 'kovan'; // Options are 'homestead', 'ropsten', 'rinkeby', 'kovan'
var ethApiToken = process.env.ETH_API_TOKEN; // Required for Infura or Etherscan

var provider = void 0;
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

var web3 = (0, _utils.getWeb3)();

// This class is used to create new wallets, encrypt and unencrypt them, and send signed transactions using the privateKey
// It is particularly useful in e.g. a server side app, where the app manually handles unencrypting the wallet itself

var Wallet = exports.Wallet = function () {
  function Wallet() {
    _classCallCheck(this, Wallet);
  }

  // Create a new wallet, generated deterministically from a mnemonic created using bip39


  _createClass(Wallet, [{
    key: 'encrypt',


    // Encrypt a wallet and return the Secret Storage JSON
    value: async function encrypt(password, progressCallback) {
      return await this.wallet.encrypt(password, progressCallback);
    }

    // Return amount of ether in the wallet.
    // If inWei = false then return num Ether as a string.
    // See details on units here http://ethdocs.org/en/latest/ether.html

  }, {
    key: 'getEtherBalance',
    value: async function getEtherBalance(inWei) {
      inWei = inWei || false;
      var wei = await web3.eth.getBalance(this.getPublicAddress());
      return inWei ? wei : Number(web3.fromWei(wei, "ether"));
    }
  }, {
    key: 'getMnemonic',
    value: function getMnemonic() {
      return this.mnemonic;
    }

    // Return amount of an organization's token in the wallet.
    // If inWei = false then return num Ether as a formated string with one decimal place
    // See details on units here http://ethdocs.org/en/latest/ether.html

  }, {
    key: 'getOrgTokenBalance',
    value: async function getOrgTokenBalance(organizationAvatarAddress, inWei) {
      inWei = inWei || false;
      var org = await _organization.Organization.at(organizationAvatarAddress);
      var balance = await org.token.balanceOf(this.getPublicAddress());
      return inWei ? web3.toWei(balance.valueOf(), "ether") : balance.valueOf();
    }
  }, {
    key: 'getProvider',
    value: function getProvider() {
      return this.wallet.provider;
    }
  }, {
    key: 'getPublicAddress',
    value: function getPublicAddress() {
      return this.wallet.address;
    }
  }, {
    key: 'sendEther',
    value: async function sendEther(toAccountAddress, numEther) {
      return await this.wallet.send(toAccountAddress, ethers.utils.parseEther(numEther.toString()));
    }
  }, {
    key: 'sendOrgTokens',
    value: async function sendOrgTokens(organizationAvatarAddress, toAccountAddress, numTokens) {
      var org = await _organization.Organization.at(organizationAvatarAddress);

      // Get raw transaction data so we can sign ourselves
      var transactionData = org.token.transfer.request(toAccountAddress, numTokens, { from: this.getPublicAddress() }).params[0].data;

      var transaction = {
        to: org.token.address,
        value: 0,
        data: transactionData,
        // This ensures the transaction cannot be replayed on different networks
        chainId: ethers.providers.Provider.chainId[ethNetwork]
      };

      var transactionHash = await this.wallet.sendTransaction(transaction);
      return transactionHash;
    }
  }], [{
    key: 'new',
    value: function _new() {
      var wallet = new Wallet();
      wallet.mnemonic = bip39.generateMnemonic();
      wallet.wallet = ethers.Wallet.fromMnemonic(wallet.mnemonic);
      wallet.wallet.provider = provider;
      return wallet;
    }
  }, {
    key: 'fromPrivateKey',
    value: function fromPrivateKey(privateKey) {
      var wallet = new Wallet();
      wallet.wallet = new ethers.Wallet(privateKey, provider);
      return wallet;
    }

    // Unencrypt an encrypted Secret Storage JSON Wallet

  }, {
    key: 'fromEncrypted',
    value: async function fromEncrypted(encryptedJSON, password, progressCallback) {
      var wallet = new Wallet();
      wallet.wallet = await ethers.Wallet.fromEncryptedWallet(encryptedJSON, password, progressCallback);
      wallet.wallet.provider = provider;
      return wallet;
    }

    // Recover a wallet from a mnemonic
    // TODO: what happens with an invalid mnemonic?

  }, {
    key: 'fromMnemonic',
    value: function fromMnemonic(mnemonic) {
      var wallet = new Wallet();
      wallet.wallet = ethers.Wallet.fromMnemonic(mnemonic);
      wallet.mnemonic = mnemonic;
      wallet.wallet.provider = provider;
      return wallet;
    }
  }]);

  return Wallet;
}();