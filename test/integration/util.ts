require('dotenv').config();
process.env = {
  ethereum: 'http://127.0.0.1:8545',
  node_http: 'http://127.0.0.1:8000/by-name/daostack/graphql',
  node_ws: 'http://127.0.0.1:8001/by-name/daostack',
  test_mnemonic:
    'behave pipe turkey animal voyage dial relief menu blush match jeans general',
  ...process.env,
};

const { execute } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');
import axios from 'axios';
import * as HDWallet from 'hdwallet-accounts';
const Web3 = require('web3');

const { node_ws, node_http, ethereum, test_mnemonic } = process.env;

export async function sendQuery(q: string, maxDelay = 1000) {
  await new Promise((res, rej) => setTimeout(res, maxDelay));
  const {
    data: { data },
  } = await axios.post(node_http, {
    query: q,
  });

  return data;
}

export const addressLength = 40;
export const hashLength = 64;
export const nullAddress = '0x' + padZeros('', 40);
export const nullParamsHash = '0x' + padZeros('', 64);

export async function getWeb3() {
  const web3 = new Web3(ethereum);
  const hdwallet = HDWallet(10, test_mnemonic);
  Array(10)
    .fill(10)
    .map((_, i) => i)
    .forEach((i) => {
      const pk = hdwallet.accounts[i].privateKey;
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      web3.eth.accounts.wallet.add(account);
    });
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  return web3;
}

export function getContractAddresses() {
  return require('../../migration.json');
}

export async function getOptions(web3) {
  const block = await web3.eth.getBlock('latest');
  return {
    from: web3.eth.defaultAccount,
    gas: block.gasLimit - 100000,
  };
}

export function padZeros(str: string, max = 36) {
  str = str.toString();
  return str.length < max ? padZeros('0' + str, max) : str;
}

export const createSubscriptionObservable = (
  query: string,
  variables = 0,
  wsurl = node_ws,
) => {
  const client = new SubscriptionClient(wsurl, { reconnect: true }, ws);
  const link = new WebSocketLink(client);
  return execute(link, { query, variables });
};
