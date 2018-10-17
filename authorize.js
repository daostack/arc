#!/usr/bin/env node

require('dotenv').config()
const crypto = require("crypto");
const yargs = require('yargs');
const axios = require('axios');
const fs = require('fs');

const {rpcUrl, token} = yargs
  .option('rpcUrl', {
    desc: 'The graph-node rpc url',
    type: 'string',
    default: 'http://localhost:8020/'
  })
  .option('token', {
    desc: 'The graph-node master token used to register api keys',
    type: 'string',
    default: process.env.GRAPH_MASTER_TOKEN
  })
  .argv

const key = crypto.randomBytes(16).toString('hex');

axios.post(`${rpcUrl}`, {jsonrpc: '2.0', method: 'subgraph_authorize', id: '1', params: {subgraph_api_keys: {daostack: key}}}, {headers: {'Authorization': "Bearer " + token, 'Content-Type': 'application/json'}})
  .then(response => {
    if(response.data.error) {
      throw response.data.error
    }
    fs.writeFileSync('.api_key', key, 'utf-8')
    console.log(`Success: key=${key}`);
  })
  .catch(err => console.error(`An error occurred: ${err.message}`));


