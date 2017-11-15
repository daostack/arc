"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpgradeScheme = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dopts = require('default-options');

var SolidityUpgradeScheme = (0, _utils.requireContract)("UpgradeScheme");
var DAOToken = (0, _utils.requireContract)("DAOToken");

var UpgradeScheme = exports.UpgradeScheme = function (_ExtendTruffleContrac) {
  _inherits(UpgradeScheme, _ExtendTruffleContrac);

  function UpgradeScheme() {
    _classCallCheck(this, UpgradeScheme);

    return _possibleConstructorReturn(this, (UpgradeScheme.__proto__ || Object.getPrototypeOf(UpgradeScheme)).apply(this, arguments));
  }

  _createClass(UpgradeScheme, [{
    key: 'setParams',
    value: async function setParams(params) {
      return await this._setParameters(params.voteParametersHash, params.votingMachine);
    }
  }, {
    key: 'getDefaultPermissions',
    value: function getDefaultPermissions(overrideValue) {
      return overrideValue || '0x00000009';
    }
  }], [{
    key: 'new',
    value: async function _new() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // TODO: provide options to use an existing token or specifiy the new token
      var defaults = {
        fee: 0, // the fee to use this scheme
        beneficiary: (0, _utils.getDefaultAccount)(),
        tokenAddress: null // the address of a token to use
      };

      var options = dopts(opts, defaults);

      var token = void 0;
      if (options.tokenAddress == null) {
        token = await DAOToken.new('schemeregistrartoken', 'SRT');
        // TODO: or is it better to throw an error?
        // throw new Error('A tokenAddress must be provided');
      } else {
        token = await DAOToken.at(options.tokenAddress);
      }

      contract = await SolidityUpgradeScheme.new(token.address, options.fee, options.beneficiary);
      return new this(contract);
    }
  }]);

  return UpgradeScheme;
}((0, _utils.ExtendTruffleContract)(SolidityUpgradeScheme));