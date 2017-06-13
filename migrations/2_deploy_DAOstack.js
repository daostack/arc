// Imports:
var UniversalSimpleVote = artifacts.require('./UniversalSimpleVote.sol');
var UniversalUpgradeScheme = artifacts.require('./UniversalUpgradeScheme.sol');
var UniversalGenesisScheme = artifacts.require('./schemes/UniversalGenesisScheme.sol');
var UniversalSchemeRegister = artifacts.require('./schemes/UniversalSchemeRegister.sol');
var UniversalSimpleContribution = artifacts.require('./schemes/UniversalSimpleContribution.sol');
var OrganizationsBoard = artifacts.require('./schemes/OrganizationsBoard.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var MintableToken = artifacts.require('./schemes/controller/MintableToken.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var SimpleICO = artifacts.require('./schemes/SimpleICO.sol');

// Instances:
var UniversalSimpleVoteInst;
var UniversalUpgradeSchemeInst;
var UniversalGenesisSchemeInst;
var UniversalSchemeRegisterIsnt;
var UniversalSimpleContributionInst;
var ControllerInst;
var OrganizationsBoardInst;
var ReputationInst;
var MintableTokenInst;
var SimpleICOInst;

// DAOstack ORG parameters:
var orgName = "DAOstack";
var tokenName = "Stack";
var tokenSymbol = "STK";
var founders = [web3.eth.accounts[0]];
var initRep = 10;
var initRepInWei = [web3.toWei(initRep)];
var initToken = 100;
var initTokenInWei = [web3.toWei(initToken)];
var tokenAddress;
var reputationAddress;

// DAOstack parameters for universal schemes:
var schemeRegister = 50;
var schemeRemove = 50;
var simpleContApplicationFee = web3.toWei(10);
var simpleContApprove = 50;

// Universal schemes fees:
var UniversalRegisterFee = web3.toWei(5);
var UniversalSimpleContributionFee = web3.toWei(5);

// ICO parameters:
var cap = 50;
var price = 200;
var periodInBlocks = 50000;
var capInWei = web3.toWei(cap);

// Billboard Params
var addToBillboardFee = 5;
var billboardFeeInWei = web3.toWei(addToBillboardFee);

module.exports = function(deployer) {

// Deploy UniversalSimpleVote:
	deployer.deploy(UniversalSimpleVote).then(function (){
		return UniversalSimpleVote.deployed();
	}).then(function(inst) {
		UniversalSimpleVoteInst = inst;
	}).then(function() {

	// Deploy UniversalUpgrade:
		deployer.deploy(UniversalUpgradeScheme).then(function (){
			return UniversalUpgradeScheme.deployed();
		}).then(function(inst) {
			UniversalUpgradeSchemeInst = inst;
		}).then(function() {

// Deploy UniversalGenesisScheme:
		return deployer.deploy(UniversalGenesisScheme);
	}).then(function() {
    return UniversalGenesisScheme.deployed();
  }).then(function(inst) {
    UniversalGenesisSchemeIsnt = inst;
	}).then(function() {

// Deploy UniversalSchemeRegister:
		return deployer.deploy(UniversalSchemeRegister, '0x0', 0, '0x0');
	}).then(function() {
		return UniversalSchemeRegister.deployed();
	}).then(function(inst) {
		UniversalSchemeRegisterIsnt = inst;
	}).then(function() {

// Create DAOstack:
		return UniversalSchemeRegisterIsnt.parametersHash(schemeRegister, schemeRemove, UniversalSimpleVoteInst.address);
	}).then(function(hashedParameters) {
		return UniversalGenesisSchemeIsnt.forgeOrg(orgName, tokenName, tokenSymbol,
			 																	founders, initTokenInWei, initRepInWei,
																		 		UniversalSchemeRegisterIsnt.address, hashedParameters,
																				UniversalUpgradeScheme.address, hashedParameters,
																				UniversalGenesisSchemeIsnt.address, hashedParameters);
	}).then(function (returnedParams) {
		return Controller.at(returnedParams.logs[0].args._controller);
	}).then(function (inst){
		ControllerInst = inst;
		return ControllerInst.nativeToken();
	}).then(function (address){
		tokenAddress = address;
		console.log('logging: ', ControllerInst.address)
		return ControllerInst.nativeReputation();
	}).then(function (address){
		reputationAddress = address;
	}).then(function (){
		return MintableToken.at(tokenAddress);
	}).then(function (inst){
		MintableTokenInst = inst;
	}).then(function (){

// Set UniversalSchemeRegister nativeToken and register DAOstack to it:
		return UniversalSchemeRegisterIsnt.updateParameters(tokenAddress, UniversalRegisterFee, ControllerInst.address);
	}).then(function (){
		return MintableTokenInst.approve(UniversalSchemeRegisterIsnt.address, UniversalRegisterFee);
	}).then(function (){
		return UniversalSchemeRegisterIsnt.addOrUpdateOrg(ControllerInst.address, schemeRegister, schemeRemove, UniversalSimpleVote.address);
/*

// Deploy UniversalSimpleContribution and register DAOstack to it:
		return deployer.deploy(UniversalSimpleContribution, tokenAddress, UniversalSimpleContributionFee, ControllerInst.address);
	}).then(function() {
		return UniversalSimpleContribution.deployed();
	}).then(function(inst) {
		UniversalSimpleContributionIsnt = inst;
		UniversalSimpleContributionIsnt.parametersHash(simpleContApprove, tokenAddress, simpleContApplicationFee, UniversalSimpleVote.address);
	}).then(function(hash) {
		var simpleContHash = hash;
		UniversalSchemeRegisterIsnt.proposeScheme(ControllerInst.address, UniversalSimpleContributionIsnt.address, simpleContHash, false);
	}).then(function() {
		UniversalSimpleContributionIsnt.addOrUpdateOrg(ControllerInst.address, tokenAddress, UniversalSimpleContributionFee, ControllerInst.address);


		console.log('controller address: ', ControllerInst.address);
		return deployer.deploy(OrganizationsBoard, ControllerInst.address, billboardFeeInWei, 'DAOstack');
	}).then(function () {
		return OrganizationsBoard.deployed();
	}).then(function(inst) {
		OrganizationsBoardInst = inst;
		return GenesisSchemeInst.proposeScheme(OrganizationsBoardInst.address, { from: web3.eth.accounts[0] });
	}).then(function() {
		return OrganizationsBoardInst.controller()
	}).then(function(contAddrssAtOrgBoard) {
		console.log('controller at org board: ', contAddrssAtOrgBoard)
	}).then(function() {
		return GenesisSchemeInst.voteScheme(OrganizationsBoardInst.address, true, { from: web3.eth.accounts[0] });
	}).then(function() {
		return ControllerInst.schemes(OrganizationsBoardInst.address);
	}).then(function(isListed) {
		console.log('is Organization board listed: ', isListed);
	}).then(function() {
		return ControllerInst.nativeReputation();
	}).then(function(repAddrss) {
		return Reputation.at(repAddrss)
	}).then(function(inst) {
		ReputationInst = inst;
		return ReputationInst.reputationOf(web3.eth.accounts[0]);
	}).then(function() {
		return deployer.deploy(SimpleICO, ControllerInst.address, web3.eth.accounts[0], capInWei ,price, periodInBlocks);
	}).then(function() {
		return SimpleICO.deployed();
	}).then(function(inst) {
		SimpleICOInst = inst;
		GenesisSchemeInst.proposeScheme(SimpleICOInst.address, { from: web3.eth.accounts[0] } );
	}).then(function(inst) {
		return GenesisSchemeInst.voteScheme(SimpleICOInst.address, true, { from: web3.eth.accounts[0] });
	}).then(function(inst) {
		return ControllerInst.schemes(SimpleICOInst.address);
	}).then(function(isListed) {
		console.log('is simple ICO board listed: ', isListed);
		*/
	});

};
