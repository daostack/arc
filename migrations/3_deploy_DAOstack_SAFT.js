// Imports:
var SaftTokenSale = artifacts.require('./other/SaftTokenSale.sol');

// Sale parameters:
var date = new Date().getTime();
var startTime = date + 10000;
var endTime = date + 50000;
var rate = 100;
var capInEth = 2;
var cap = web3.toWei(capInEth);
var wallet = web3.eth.accounts[3];

module.exports = async function(deployer) {
  await deployer.deploy(SaftTokenSale, startTime, endTime, rate, cap, wallet);
}
