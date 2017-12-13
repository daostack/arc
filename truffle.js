require("babel-polyfill");
require("babel-register")({
  "presets": ["es2015"],
  "plugins": ["syntax-async-functions","transform-regenerator"]
});

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4543760
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4543760
    },
    kovan: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4543760
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
