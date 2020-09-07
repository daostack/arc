require('dotenv').config();
require("babel-polyfill");
require("babel-register")({
  "presets": ["es2015"],
  "plugins": ["syntax-async-functions","transform-regenerator"]
});



const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "2b47226e9844437592bd1bdac8401cf8";

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    live: {
      network_id: 1,
      host: "localhost",
      port: 8546,
      gas: 4543760
    },
    ropsten: {
      network_id: 3,
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
    rinkeby: {
      network_id: 4,
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/${infuraKey}`),
      network_id: 42,       
      gas: 5500000,        
      confirmations: 1,    
      timeoutBlocks: 200,  
      skipDryRun: true
    },
    development: {
      network_id: "*",
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },
  rpc: {
    host: "localhost",
    port: 8545
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  compilers: {
    solc: {
      version: "0.5.17",    // Fetch exact version from solc-bin (default: truffle's version)
      optimizer: {
        enabled: true,
        runs: 200
      }
      }
  }
};
