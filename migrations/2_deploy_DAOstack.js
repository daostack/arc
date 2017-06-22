// Imports:
var UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
var UniversalGenesisScheme = artifacts.require('./schemes/UniversalGenesisScheme.sol');
var UniversalSchemeRegister = artifacts.require('./schemes/UniversalSchemeRegister.sol');
var UniversalGCRegister = artifacts.require('./schemes/UniversalGCRegister.sol');
var UniversalUpgradeScheme = artifacts.require('./UniversalUpgradeScheme.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var MintableToken = artifacts.require('./schemes/controller/MintableToken.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var Avatar = artifacts.require('./schemes/controller/Avatar.sol');

// Instances:
var UniversalSimpleVoteInst;
var UniversalGenesisSchemeInst;
var UniversalSchemeRegisterIsnt;
var UniversalGCRegisterInst;
var UniversalUpgradeSchemeInst;
var ControllerInst;
var OrganizationsBoardInst;
var ReputationInst;
var MintableTokenInst;
var AvatarInst;
var SimpleICOInst;

// DAOstack ORG parameters:
var orgName = "DAOstack";
var tokenName = "Stack";
var tokenSymbol = "STK";
var founders = [web3.eth.accounts[0]];
var initRep = 10;
var initRepInWei = [web3.toWei(initRep)];
var initToken = 1000;
var initTokenInWei = [web3.toWei(initToken)];
var tokenAddress;
var reputationAddress;
var avatarAddress;

// DAOstack parameters for universal schemes:
var voteParametersHash;
var votePrec = 50;
var schemeRegisterParams;
var schemeGCRegisterParams;
var schemeUpgradeParams;

// Universal schemes fees:
var UniversalRegisterFee = web3.toWei(5);

module.exports = function(deployer) {

// Deploy UniversalGenesisScheme:
	deployer.deploy(UniversalGenesisScheme).then(function (){
		return UniversalGenesisScheme.deployed();
	}).then(function(inst) {
		UniversalGenesisSchemeIsnt = inst;
	}).then(function() {

// Create DAOstack:
		return UniversalGenesisSchemeIsnt.forgeOrg(orgName, tokenName, tokenSymbol, founders,
																				initTokenInWei, initRepInWei);
	}).then(function (returnedParams) {
		return Controller.at(returnedParams.logs[0].args._controller);
	}).then(function (inst){
		ControllerInst = inst;
		return ControllerInst.nativeToken();
	}).then(function (address){
		tokenAddress = address;
		console.log('logging, controller address: ', ControllerInst.address)
		return ControllerInst.nativeReputation();
	}).then(function (address){
		reputationAddress = address;
	}).then(function (){
		return MintableToken.at(tokenAddress);
	}).then(function (inst){
		MintableTokenInst = inst;
	}).then(function (){
		return ControllerInst.avatar();
	}).then(function (address){
		avatarAddress = address;
		return Avatar.at(avatarAddress);
	}).then(function (inst){
		AvatarInst = inst;
	}).then(function (){

// Deploy UniversalSimpleVote:
		return deployer.deploy(UniversalSimpleVote);
	}).then(function() {
    return UniversalSimpleVote.deployed();
  }).then(function(inst) {
		UniversalSimpleVoteInst = inst;
	}).then(function() {

// Deploy UniversalSchemeRegister:
		return deployer.deploy(UniversalSchemeRegister, tokenAddress, UniversalRegisterFee, avatarAddress);
	}).then(function() {
		return UniversalSchemeRegister.deployed();
	}).then(function(inst) {
		UniversalSchemeRegisterIsnt = inst;
	}).then(function() {

// Deploy UniversalUpgrade:
		return deployer.deploy(UniversalUpgradeScheme, tokenAddress, UniversalRegisterFee, avatarAddress);
	}).then(function() {
		return UniversalUpgradeScheme.deployed();
	}).then(function(inst) {
		UniversalUpgradeSchemeInst = inst;
	}).then(function() {

// Deploy UniversalGCScheme register:
		return deployer.deploy(UniversalGCRegister, tokenAddress, UniversalRegisterFee, avatarAddress);
	}).then(function() {
		return UniversalGCRegister.deployed();
	}).then(function(inst) {
		UniversalGCRegisterInst = inst;
	}).then(function() {

// Voting parameters and schemes params:
		return UniversalSimpleVoteInst.hashParameters(reputationAddress, votePrec);
	}).then(function(hash) {
		voteParametersHash = hash;
	}).then(function() {
		return UniversalSchemeRegisterIsnt.parametersHash(voteParametersHash, voteParametersHash, UniversalSimpleVoteInst.address);
	}).then(function(hashedParameters) {
		schemeRegisterParams = hashedParameters;
		return UniversalGCRegisterInst.parametersHash(voteParametersHash, UniversalSimpleVoteInst.address);
	}).then(function(hashedParameters) {
		schemeGCRegisterParams = hashedParameters;
		return UniversalUpgradeSchemeInst.parametersHash(voteParametersHash, UniversalSimpleVoteInst.address);
	}).then(function(hashedParameters) {
		schemeUpgradeParams = hashedParameters;
	}).then(function() {

// List DAOstack initial schmes:
	return UniversalGenesisSchemeIsnt.listInitialSchemes(ControllerInst.address,
																												UniversalSchemeRegisterIsnt.address,
																												UniversalUpgradeSchemeInst.address,
																												UniversalGCRegisterInst.address,
																												schemeRegisterParams,
																												schemeUpgradeParams,
																												schemeGCRegisterParams);
	}).then(function (){

// Set UniversalSchemeRegister nativeToken and register DAOstack to it:
		return MintableTokenInst.approve(UniversalSchemeRegisterIsnt.address, UniversalRegisterFee);
	}).then(function (){
		return UniversalSchemeRegisterIsnt.addOrUpdateOrg(ControllerInst.address, voteParametersHash, voteParametersHash, UniversalSimpleVote.address);

	}).then(function (){
// Set UniversalGCScheme nativeToken and register DAOstack to it:
		return MintableTokenInst.approve(UniversalGCRegisterInst.address, UniversalRegisterFee);
	}).then(function (){
		return UniversalGCRegisterInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, UniversalSimpleVote.address);
	}).then(function (){

// Set UniversalUpgradeScheme nativeToken and register DAOstack to it:
		return MintableTokenInst.approve(UniversalUpgradeSchemeInst.address, UniversalRegisterFee);
	}).then(function (){
		return UniversalUpgradeSchemeInst.addOrUpdateOrg(ControllerInst.address, voteParametersHash, UniversalSimpleVote.address);

	});

};
