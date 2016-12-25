module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.autolink();
  deployer.deploy(Ownable);
  deployer.deploy(Token);
  deployer.deploy(MintableToken);
  deployer.deploy(Reputation);
};
