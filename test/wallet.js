/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import * as ethers from 'ethers';

import { Wallet } from '../lib/wallet.js';
import * as helpers from './helpers';

contract('Wallet', function(accounts) {
  it('creates a new wallet on the blockchain', async function() {
    this.timeout(10000);
    var wallet = Wallet.new();
    assert.equal(wallet.getPublicAddress().length, 42);
    assert.equal(await wallet.getEtherBalance(), 0);
    assert.notEqual(wallet.getMnemonic().length, 0);
  });

  it('can be encrypted and decrypted', async function() {
    this.timeout(10000);
    var wallet = Wallet.new();
    console.log("Encrypt wallet");
    var encryptedJSON = await wallet.encrypt("Passw0rd", function(progress) { process.stdout.write("."); });
    console.log("\n");
    console.log("Decrypting wallet");
    var wallet2 = await Wallet.fromEncrypted(encryptedJSON, "Passw0rd", function(progress) { process.stdout.write(","); });
    assert.equal(wallet.getPublicAddress(), wallet2.getPublicAddress());
  });

  it('can be recovered from a mnemonic', function() {
    this.timeout(10000);
    var wallet = Wallet.new();
    var mnemonic = wallet.getMnemonic();
    var wallet2 = Wallet.fromMnemonic(mnemonic);
    assert.equal(wallet.wallet.privateKey, wallet2.wallet.privateKey);
  });

  it('can send and receive ether', async function() {
    this.timeout(10000);
    var wallet = Wallet.new();
    await web3.eth.sendTransaction({to: wallet.getPublicAddress(), from: accounts[0], value: web3.toWei(100, "ether")});
    let balance = await wallet.getEtherBalance();
    assert.equal(balance, 100.0);

    const toBalanceBefore = await web3.eth.getBalance(accounts[2]);
    await wallet.sendEther(accounts[2], 10);
    balance = await wallet.getEtherBalance();
    assert.equal(balance, 89.99958);
    const toBalanceAfter = await web3.eth.getBalance(accounts[2]);
    assert(toBalanceAfter.equals(toBalanceBefore.plus(web3.toWei(10, "ether"))));
  });

  it('can receive org tokens', async function() {
    this.timeout(10000);
    let wallet1 = Wallet.new();
    let wallet2 = Wallet.new();
    const orgOptions = {
      founders: [
        {
          address: wallet1.getPublicAddress(),
          tokens: 100,
          reputation: 100
        },
        {
          address: wallet2.getPublicAddress(),
          tokens: 100,
          reputation: 100
        },
      ]
    };
    let org = await helpers.forgeOrganization(orgOptions);
    assert.equal(await wallet1.getOrgTokenBalance(org.avatar.address), 100);
  });

  // it('can sign transactions', async function() {
  //   this.timeout(10000);
  //   //var wallet = await setupWallet();
  //   //const organization = await helpers.forgeOrganization();
  // })
});