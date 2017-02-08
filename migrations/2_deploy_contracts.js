module.exports = function(deployer) {
  deployer.autolink();
  deployer.deploy(MintableToken);
  deployer.deploy(Reputation);
  deployer.deploy(Ownable);
  deployer.deploy(SimpleVote);
};
