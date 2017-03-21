var SimpleVote = artifacts.require('./SimpleVote.sol');
var GenesisScheme = artifacts.require("./schemes/GenesisScheme.sol");

module.exports = function(deployer) {
	deployer.deploy(SimpleVote).then(function() {
	  return deployer.deploy(GenesisScheme, 'AdamCoin', 'ADM', ['0x359a4c49ba06cef000441ACC65EC6813c4097541'], [45], [10], SimpleVote.address);
	});
};