'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSettings = undefined;

var _utils = require('./utils.js');

var _globalconstraintregistrar = require('../lib/globalconstraintregistrar.js');

var _schemeregistrar = require('../lib/schemeregistrar.js');

var _simplecontributionscheme = require('../lib/simplecontributionscheme.js');

var _upgradescheme = require('../lib/upgradescheme.js');

// TODO: these are settings for testing. Need some way to switch to "production settings"
var GenesisScheme = (0, _utils.requireContract)("GenesisScheme");

var SimpleICO = (0, _utils.requireContract)("SimpleICO");
var SimpleVote = (0, _utils.requireContract)("SimpleVote");
var AbsoluteVote = (0, _utils.requireContract)("AbsoluteVote");
var TokenCapGC = (0, _utils.requireContract)("TokenCapGC");


var getSettings = async function getSettings() {
  var contributionScheme = await _simplecontributionscheme.SimpleContributionScheme.deployed();
  var genesisScheme = await GenesisScheme.deployed();
  var globalConstraintRegistrar = await _globalconstraintregistrar.GlobalConstraintRegistrar.deployed();
  var schemeRegistrar = await _schemeregistrar.SchemeRegistrar.deployed();
  var simpleICO = await SimpleICO.deployed();
  var tokenCapGC = await TokenCapGC.deployed();
  var upgradeScheme = await _upgradescheme.UpgradeScheme.deployed();
  var simpleVote = await SimpleVote.deployed();
  var absoluteVote = await AbsoluteVote.deployed();

  return {
    votingMachine: absoluteVote.address,
    daostackContracts: {
      SimpleContributionScheme: {
        contract: _simplecontributionscheme.SimpleContributionScheme,
        address: contributionScheme.address
      },
      GenesisScheme: {
        contract: GenesisScheme,
        address: genesisScheme.address
      },
      GlobalConstraintRegistrar: {
        contract: _globalconstraintregistrar.GlobalConstraintRegistrar,
        address: globalConstraintRegistrar.address
      },
      SchemeRegistrar: {
        contract: _schemeregistrar.SchemeRegistrar,
        address: schemeRegistrar.address
      },
      SimpleICO: {
        contract: SimpleICO,
        address: simpleICO.address
      },
      TokenCapGC: {
        contract: TokenCapGC,
        address: tokenCapGC.address
      },
      UpgradeScheme: {
        contract: _upgradescheme.UpgradeScheme,
        address: upgradeScheme.address
      },
      AbsoluteVote: {
        contract: AbsoluteVote,
        address: absoluteVote.address
      },
      SimpleVote: {
        contract: SimpleVote,
        address: simpleVote.address
      }
    }
  };
};

exports.getSettings = getSettings;