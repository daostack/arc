require("babel-polyfill");
require("babel-register")({
  "presets": ["es2015"],
  "plugins": ["syntax-async-functions","transform-regenerator"]
});

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
      network_id: 42,
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
    development: {
      network_id: "*",
      host: "localhost",
      port: 8545,
      gas: 4543760
    },
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
