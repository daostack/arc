module.exports = {
  build: {
    "index.html": "index.html",
    "token.html": "token.html",
    "token.js": [
      "javascripts/token.js"
    ],
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  rpc: {
    host: "localhost",
    port: 8545
  },
  networks: {
    "live": {
        network_id: 1 // Ethereum public network
    },
    "morden": {
        network_id: 2 // Official Ethereum test network
    },
    "development": {
        network_id: "default"
    }
  }
};
