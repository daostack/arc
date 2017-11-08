'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _organization = require('./organization.js');

Object.keys(_organization).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _organization[key];
    }
  });
});

var _globalconstraintregistrar = require('./globalconstraintregistrar.js');

Object.keys(_globalconstraintregistrar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _globalconstraintregistrar[key];
    }
  });
});

var _upgradescheme = require('./upgradescheme.js');

Object.keys(_upgradescheme).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _upgradescheme[key];
    }
  });
});

var _schemeregistrar = require('./schemeregistrar.js');

Object.keys(_schemeregistrar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _schemeregistrar[key];
    }
  });
});

var _simplecontributionscheme = require('./simplecontributionscheme.js');

Object.keys(_simplecontributionscheme).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _simplecontributionscheme[key];
    }
  });
});

var _utils = require('./utils.js');

Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _utils[key];
    }
  });
});

var _wallet = require('./wallet.js');

Object.keys(_wallet).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _wallet[key];
    }
  });
});
exports.configure = configure;
exports.getUniversalSchemes = getUniversalSchemes;

var _settings = require('./settings.js');

/**
 * Configure the emergent-arc module.
 *
 * @return: Web3 web3 as a convenience for the client.
 * `web3` is set automatically in testing and migration, or elsewhere (development, production)
 * in utils.requireContract() when the first contract is imported
 * (as the contracts will have been done via the export statements at the top of this module).
 */
function configure(options) {
  options; // for lint
  // not used at the moment:  const network = options && options.network && options.network.name ? options.network.name : 'testrpc';
  /**
   * TODO: supply testrpc url in options?  Problem is that at this point web3 has already been set in utils
   * so it's too late at this point to set the url.  Would need to somehow effect this initialization before
   * any contract imports have been attempted.  Need to figure out how to export the modules above somewhere
   * else, or separately.
   */

  return (0, _utils.getWeb3)();
}

/**
 * returns addresses and TruffleContracts of universal schemes.
 */
async function getUniversalSchemes() {
  return (await (0, _settings.getSettings)()).daostackContracts;
}