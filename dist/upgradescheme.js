"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpgradeScheme = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

var _settings = require('./settings.js');

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
        key: 'proposeController',


        /*******************************************
         * proposeController
         */
        value: async function proposeController() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var defaults = {
                /**
                 * avatar address
                 */
                avatar: undefined
                /**
                 *  controller address
                 */
                , controller: undefined
            };

            var options = dopts(opts, defaults, { allowUnknown: true });

            if (!options.avatar) {
                throw new Error("avatar address is not defined");
            }

            if (!options.controller) {
                throw new Error("controller address is not defined");
            }

            var tx = await this.contract.proposeUpgrade(options.avatar, options.controller);

            return tx;
        }

        /********************************************
         * proposeUpgradingScheme
         */

    }, {
        key: 'proposeUpgradingScheme',
        value: async function proposeUpgradingScheme() {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            /**
             * Note that explicitly supplying any property with a value of undefined will prevent the property
             * from taking on its default value (weird behavior of default-options)
             */
            var defaults = {
                /**
                 * avatar address
                 */
                avatar: undefined
                /**
                 *  upgrading scheme address
                 */
                , scheme: undefined
                /**
                 * hash of the parameters of the upgrading scheme. These must be already registered with the new scheme.
                 */
                , schemeParametersHash: undefined
                /**
                 * true to register organization into the scheme when the proposal is approved.
                 * If false then caller must do it manually via scheme.registerOrganization(avatarAddress).
                 * Default is true.
                 */
                , autoRegister: true
                /**
                 * The fee that the scheme charges to register an organization in the new upgrade scheme.
                 * The controller will be asked in advance to approve this expenditure.
                 * 
                 * If the new UpgradeScheme is an Arc scheme, you may omit fee and we will
                 * obtain the values directly from the submitted scheme.
                 * Otherwise fee is required.
                 * 
                 * The fee is paid using the token given by tokenAddress.  In Wei.
                 */
                , fee: null
                /**
                 * address of token that will be used when paying the fee.
                 * 
                 * If the new UpgradeScheme is an Arc scheme, you may omit tokenAddress and we will
                 * obtain the values directly from the submitted scheme.
                 * Otherwise tokenAddress is required.
                 */
                , tokenAddress: null
            };

            var options = dopts(opts, defaults, { allowUnknown: true });

            if (!options.avatar) {
                throw new Error("avatar address is not defined");
            }

            if (!options.scheme) {
                throw new Error("scheme is not defined");
            }

            if (!options.schemeParametersHash) {
                throw new Error("schemeParametersHash is not defined");
            }

            var feeIsDefined = options.fee !== null && options.fee !== undefined;
            var tokenAddressIsDefined = !!options.tokenAddress;

            /**
             * throws an Error if not valid, yields 0 if null or undefined
             */
            var web3 = (0, _utils.getWeb3)();
            var fee = web3.toBigNumber(options.fee);
            var tokenAddress = options.tokenAddress;

            if (!feeIsDefined || !tokenAddressIsDefined) {
                try {
                    var settings = await (0, _settings.getSettings)();
                    var newScheme = await settings.daostackContracts.UpgradeScheme.contract.at(options.scheme);
                    if (!feeIsDefined) {
                        fee = await newScheme.fee();
                    }
                    if (!tokenAddressIsDefined) {
                        tokenAddress = await newScheme.nativeToken();
                    }
                } catch (ex) {
                    throw new Error("Unable to obtain default information from the given scheme address. The scheme is probably not an Arc UpgradeScheme and in that case you must supply fee and tokenAddress.");
                }
            }

            if (fee < 0) {
                throw new Error("fee cannot be less than 0");
            }

            var tx = await this.contract.proposeChangeUpgradingScheme(options.avatar, options.scheme, options.schemeParametersHash, tokenAddress, fee);

            if (options.autoRegister) {
                this.contract.registerOrganization(options.avatar);
            }

            return tx;
        }
    }, {
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

            var options = dopts(opts, defaults, { allowUnknown: true });

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