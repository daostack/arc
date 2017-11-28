"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SchemeRegistrar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

var _settings = require('./settings.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dopts = require('default-options');

var SoliditySchemeRegistrar = (0, _utils.requireContract)("SchemeRegistrar");
var DAOToken = (0, _utils.requireContract)("DAOToken");

var SchemeRegistrar = exports.SchemeRegistrar = function (_ExtendTruffleContrac) {
    _inherits(SchemeRegistrar, _ExtendTruffleContrac);

    function SchemeRegistrar() {
        _classCallCheck(this, SchemeRegistrar);

        return _possibleConstructorReturn(this, (SchemeRegistrar.__proto__ || Object.getPrototypeOf(SchemeRegistrar)).apply(this, arguments));
    }

    _createClass(SchemeRegistrar, [{
        key: 'proposeToAddModifyScheme',
        value: async function proposeToAddModifyScheme() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var defaults = {
                /**
                 * avatar address
                 */
                avatar: undefined
                /**
                 * scheme address
                 */
                , scheme: undefined
                /**
                 * scheme identifier, like "SchemeRegistrar" or "SimpleContributionScheme"
                 */
                , schemeKey: undefined
                /**
                 * scheme parameters
                 */
                , schemeParametersHash: undefined
            };

            var options = dopts(opts, defaults);

            if (!options.avatar) {
                throw new Error("avatar address is not defined");
            }

            if (!options.scheme) {
                throw new Error("scheme is not defined");
            }

            if (!options.schemeKey) {
                throw new Error("schemeKey is not defined");
            }

            if (!options.schemeParametersHash) {
                throw new Error("schemeParametersHash is not defined");
            }

            var settings = await (0, _settings.getSettings)();
            var newScheme = await settings.daostackContracts[options.schemeKey].contract.at(options.scheme);
            var fee = await newScheme.fee();
            var tokenAddress = await newScheme.nativeToken();
            // Note that the javascript wrapper "newScheme" we've gotten here is defined in this version of Arc.  If newScheme is 
            // actually coming from a different version of Arc, then theoretically the permissions could be different from this version.
            var permissions = Number(newScheme.getDefaultPermissions());

            if (permissions > this.getDefaultPermissions()) {
                throw new Error("SchemeRegistrar cannot work with schemes having greater permissions than its own");
            }

            var tx = await this.contract.proposeScheme(options.avatar, options.scheme, options.schemeParametersHash, (permissions & 2) != 0, tokenAddress, fee, true);

            return tx;
        }
    }, {
        key: 'proposeToRemoveScheme',
        value: async function proposeToRemoveScheme() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var defaults = {
                /**
                 * avatar address
                 */
                avatar: undefined
                /**
                 * scheme address
                 */
                , scheme: undefined
            };

            var options = dopts(opts, defaults);

            if (!options.avatar) {
                throw new Error("avatar address is not defined");
            }

            if (!options.scheme) {
                throw new Error("scheme address is not defined");
            }

            var tx = await this.contract.proposeToRemoveScheme(options.avatar, options.scheme);

            return tx;
        }
    }, {
        key: 'setParams',
        value: async function setParams(params) {
            return await this._setParameters(params.voteParametersHash, params.voteParametersHash, params.votingMachine);
        }
    }, {
        key: 'getDefaultPermissions',
        value: function getDefaultPermissions(overrideValue) {
            return overrideValue || '0x00000003';
        }
    }], [{
        key: 'new',
        value: async function _new() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            // TODO: provide options to use an existing token or specifiy the new token
            var defaults = {
                fee: 0, // the fee to use this scheme
                beneficiary: (0, _utils.getDefaultAccount)(),
                tokenAddress: undefined // the address of a token to use
            };

            var options = dopts(opts, defaults);

            var token = void 0;
            if (options.tokenAddress == undefined) {
                token = await DAOToken.new('schemeregistrartoken', 'SRT');
            } else {
                token = await DAOToken.at(options.tokenAddress);
            }

            contract = await SoliditySchemeRegistrar.new(token.address, options.fee, options.beneficiary);
            return new this(contract);
        }
    }]);

    return SchemeRegistrar;
}((0, _utils.ExtendTruffleContract)(SoliditySchemeRegistrar));