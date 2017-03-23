var SimpleVote = artifacts.require('./SimpleVote.sol');
var GenesisScheme = artifacts.require("./schemes/GenesisScheme.sol");
var OrganizationsBoard = artifacts.require("./schemes/OrganizationsBoard.sol");
var Controller = artifacts.require("./schemes/controller/Controller.sol");
var Reputation = artifacts.require("./schemes/controller/Reputation.sol");
var SimpleVoteInst;
var GenesisSchemeInst;
var ControllerInst;
var OrganizationsBoardInst;
var ReputationInst;

module.exports = function(deployer) {
	deployer.deploy(SimpleVote).then(function (){
		return SimpleVote.deployed();
	}).then(function(inst) {
		SimpleVoteInst = inst;
	}).then(function() {
		return deployer.deploy(GenesisScheme, 'AdamCoin', 'ADM', [web3.eth.accounts[0]], [100], [10], SimpleVoteInst.address);
	}).then(function() {
		return GenesisScheme.deployed();
	}).then(function(inst) {
		GenesisSchemeInst = inst;
		return GenesisSchemeInst.collectFoundersShare( { from: web3.eth.accounts[0] });
	}).then(function() {
		return GenesisSchemeInst.controller();
	}).then(function (contAddrss) {
		return Controller.at(contAddrss);
	}).then(function (inst){
		ControllerInst = inst;
	}).then(function (){
		return deployer.deploy(OrganizationsBoard, ControllerInst.address, 5, 'AdamDAO');
	}).then(function () {
		return OrganizationsBoard.deployed();
	}).then(function(inst) {
		OrganizationsBoardInst = inst;
		return GenesisSchemeInst.proposeScheme(OrganizationsBoardInst.address, { from: web3.eth.accounts[0] });
	}).then(function() {
		return GenesisSchemeInst.voteScheme(OrganizationsBoardInst.address, true, { from: web3.eth.accounts[0] });
	}).then(function() {
		return ControllerInst.schemes(OrganizationsBoardInst.address);
	}).then(function(isListed) {
		console.log('isListed', isListed);
	}).then(function() {
		return ControllerInst.nativeReputation();
	}).then(function(repAddrss) {
		return Reputation.at(repAddrss)
	}).then(function(inst) {
		ReputationInst = inst;
		return ReputationInst.reputationOf(web3.eth.accounts[0]);
	});

};
