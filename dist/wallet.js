'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wallet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ethers = require('ethers');

var ethers = _interopRequireWildcard(_ethers);

var _organization = require('./organization.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bip39 = require('bip39');

// TODO: move all the provider connection stuff to settings.js
var ethProvider = process.env.ETH_PROVIDER; // If provider not specified will default to local RPC (testrpc, Geth, or Parity..)
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

var Wallet = exports.Wallet = function () {
  function Wallet() {
    _classCallCheck(this, Wallet);
  }

  // Create a new wallet and encrypt it with password
  // The wallet will be generated deterministically from a mnemonic created using bip39


  _createClass(Wallet, [{
    key: 'getEncryptedJSON',
    value: function getEncryptedJSON() {
      return this.encryptedJSON;
    }

    // TODO: convert to ether?

  }, {
    key: 'getEtherBalance',
    value: async function getEtherBalance() {
      return await this.wallet.getBalance();
    }
  }, {
    key: 'getMnemonic',
    value: function getMnemonic() {
      return this.mnemonic;
    }
  }, {
    key: 'getOrgTokenBalance',
    value: async function getOrgTokenBalance(organizationAvatarAddress) {
      var org = await _organization.Organization.at(organizationAvatarAddress);
      var balance = await org.controller.balanceOf(this.getPublicAddress());
      return ethers.utils.formatEther(balance);
    }
  }, {
    key: 'getPublicAddress',
    value: function getPublicAddress() {
      return this.wallet.address;
    }
  }, {
    key: 'getProvider',
    value: function getProvider() {
      return this.wallet.provider;
    }
  }, {
    key: 'sendEther',
    value: async function sendEther(accountAddress, numEther) {
      return await this.wallet.send(accountAddress, ethers.utils.parseEther(numEther.toString()));
    }
  }], [{
    key: 'new',
    value: async function _new(password, progressCallback) {
      var wallet = new Wallet();
      wallet.mnemonic = bip39.generateMnemonic();
      wallet.wallet = ethers.Wallet.fromMnemonic(wallet.mnemonic);
      wallet.wallet.provider = provider;
      wallet.encryptedJSON = await wallet.wallet.encrypt(password, progressCallback);
      return wallet;
    }

    // Unencrypt an encrypted wallet

  }, {
    key: 'fromEncrypted',
    value: async function fromEncrypted(encryptedJSON, password, progressCallback) {
      var wallet = new Wallet();
      wallet.wallet = await ethers.Wallet.fromEncryptedWallet(encryptedJSON, password, progressCallback);
      wallet.wallet.provider = provider;
      wallet.encryptedJSON = encryptedJSON;
      return wallet;
    }

    // Recover a wallet from a mnemonic and then encrypt it with a new password
    // TODO: what happens with an invalid mnemonic?

  }, {
    key: 'fromMnemonic',
    value: async function fromMnemonic(mnemonic, password, progressCallback) {
      var wallet = new Wallet();
      wallet.wallet = ethers.Wallet.fromMnemonic(mnemonic);
      wallet.mnemonic = mnemonic;
      wallet.wallet.provider = provider;
      wallet.encryptedJSON = await wallet.wallet.encrypt(password, progressCallback);
      return wallet;
    }
  }]);

  return Wallet;
}();