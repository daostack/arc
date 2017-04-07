module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    kovan: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas:5000000
    }
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
