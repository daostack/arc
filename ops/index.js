require("dotenv").config();
process.env = {
  ethereum: "http://127.0.0.1:8545",
  test_mnemonic:
    "behave pipe turkey animal voyage dial relief menu blush match jeans general",
  ...process.env
};
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const handlebars = require("handlebars");
const yaml = require("js-yaml");
const Web3 = require("web3");
const HDWallet = require("hdwallet-accounts");

const DAOToken = require("@daostack/arc/build/contracts/DAOToken.json");
const GenesisProtocol = require("@daostack/arc/build/contracts/GenesisProtocol.json");

async function configure({ env, ...rest }) {
  const { [env]: publicConfig } = yaml.safeLoad(
    fs.readFileSync(__dirname + "/config.yaml", "utf-8")
  );
  const { [env]: privateConfig } = rest;
  const config = {
    env,
    development: env === "development",
    ...publicConfig,
    ...privateConfig
  };

  fs.writeFileSync(
    "config.json",
    JSON.stringify(config, undefined, 2),
    "utf-8"
  );

  const subgraph = handlebars.compile(
    fs.readFileSync("subgraph.handlebars.yaml", "utf-8")
  );
  fs.writeFileSync("subgraph.yaml", subgraph(config), "utf-8");

  const dockerCompose = handlebars.compile(
    fs.readFileSync("docker-compose.handlebars.yml", "utf-8")
  );
  fs.writeFileSync("docker-compose.yml", dockerCompose(config), "utf-8");
}

async function migrate(web3) {
  const { ethereum, test_mnemonic } = process.env;
  web3 = web3 || new Web3(ethereum);
  const hdwallet = HDWallet(10, test_mnemonic);
  Array(10)
    .fill(10)
    .map((_, i) => i)
    .forEach(i => {
      const pk = hdwallet.accounts[i].privateKey;
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      web3.eth.accounts.wallet.add(account);
    });
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;

  const opts = {
    from: web3.eth.defaultAccount,
    gas: (await web3.eth.getBlock("latest")).gasLimit - 100000
  };

  const GEN = new web3.eth.Contract(DAOToken.abi, undefined, opts);
  const gen = await GEN.deploy({
    data: DAOToken.bytecode,
    arguments: ["GEN", "GEN", "1000000000000000000000000000"]
  }).send();

  const GP = new web3.eth.Contract(GenesisProtocol.abi, undefined, opts);
  const gp = await GP.deploy({
    data: GenesisProtocol.bytecode,
    arguments: [gen.options.address]
  }).send();

  const addresses = {
    DAOToken: gen.options.address,
    GenesisProtocol: gp.options.address
  };

  await configure({
    env: "development",
    development: { addresses }
  });

  return addresses;
}

async function generateAbis() {
  const base = "./node_modules/@daostack/arc/build/contracts";
  if (!fs.existsSync("./abis/")) {
    fs.mkdirSync("./abis/");
  }
  const files = fs.readdirSync(base);
  files.forEach(file => {
    const abi = JSON.parse(fs.readFileSync(path.join(base, file), "utf-8")).abi;
    fs.writeFileSync(
      path.join("./abis/", file),
      JSON.stringify(abi, undefined, 2),
      "utf-8"
    );
  });
}

// if called as the main file run the cli, otherwise expose functions as a library
if (require.main === module) {
  yargs
    .command(
      "migrate",
      "Migrate contracts to ganache and configure the project appropriatly",
      yargs => yargs,
      () => migrate()
    )
    .command(
      "generate-abis",
      "Fill the ./abis folder with abis from the @daostack/arc package",
      yargs => yargs,
      () => generateAbis()
    )
    .command(
      "configure",
      "Configure the project to a predefined configuration",
      yargs =>
        yargs.option("env", {
          alias: "e",
          desc: "Configuration choice",
          choices: ["mainnet", "kovan", "development"],
          default: "development"
        }),
      configure
    )
    .demandCommand()
    .completion()
    .env("daostack")
    .help().argv;
} else {
  module.exports = {
    configure,
    migrate
  };
}
