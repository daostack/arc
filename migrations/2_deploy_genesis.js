var SimpleVote = artifacts.require('./SimpleVote.sol');
var GenesisScheme = artifacts.require('./schemes/GenesisScheme.sol');
var OrganizationsBoard = artifacts.require('./schemes/OrganizationsBoard.sol');
var Controller = artifacts.require('./schemes/controller/Controller.sol');
var Reputation = artifacts.require('./schemes/controller/Reputation.sol');
var SimpleICO = artifacts.require('./schemes/SimpleICO.sol')
var SimpleVoteInst;
var GenesisSchemeInst;
var ControllerInst;
var OrganizationsBoardInst;
var ReputationInst;
var SimpleICOInst;

// Founder parameters:
var initRep = 10;
var initToken = 100;
var initTokenInWei = web3.toWei(initToken);

// ICO parameters:
var cap = 50;
var price = 200;
var periodInBlocks = 50000;
var capInWei = web3.toWei(cap);

// Billboard Params
var addToBillboardFee = 5;
var billboardFeeInWei = web3.toWei(addToBillboardFee);

module.exports = function(deployer) {
	deployer.deploy(SimpleVote).then(function (){
		return SimpleVote.deployed();
	}).then(function(inst) {
		SimpleVoteInst = inst;
	}).then(function() {
		return deployer.deploy(GenesisScheme, 'Stack', 'STK', [web3.eth.accounts[0]], [initTokenInWei], [initRep], SimpleVoteInst.address);
	}).then(function() {
		return GenesisScheme.deployed();
	}).then(function(inst) {
		GenesisSchemeInst = inst;
	}).then(function() {
		return GenesisSchemeInst.controller();
	}).then(function (contAddrss) {
		return Controller.at(contAddrss);
	}).then(function (inst){
		ControllerInst = inst;
	}).then(function (){
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
	});

};
