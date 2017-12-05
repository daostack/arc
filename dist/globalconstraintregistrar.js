"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GlobalConstraintRegistrar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dopts = require('default-options');

var SolidityGlobalConstraintRegistrar = (0, _utils.requireContract)("GlobalConstraintRegistrar");
var DAOToken = (0, _utils.requireContract)("DAOToken");

var GlobalConstraintRegistrar = exports.GlobalConstraintRegistrar = function (_ExtendTruffleContrac) {
  _inherits(GlobalConstraintRegistrar, _ExtendTruffleContrac);

  function GlobalConstraintRegistrar() {
    _classCallCheck(this, GlobalConstraintRegistrar);

    return _possibleConstructorReturn(this, (GlobalConstraintRegistrar.__proto__ || Object.getPrototypeOf(GlobalConstraintRegistrar)).apply(this, arguments));
  }

  _createClass(GlobalConstraintRegistrar, [{
    key: 'proposeToAddModifyGlobalConstraint',
    value: async function proposeToAddModifyGlobalConstraint() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaults = {
        /**
         * avatar address
         */
        avatar: undefined
        /**
         *  the address of the global constraint to add
         */
        , globalConstraint: undefined
        /**
         * hash of the parameters of the global contraint
         */
        , globalConstraintParametersHash: undefined
        /**
         * voting machine to use when voting to remove the global constraint
         */
        , votingMachineHash: undefined
      };

      var options = dopts(opts, defaults, { allowUnknown: true });

      if (!options.avatar) {
        throw new Error("avatar address is not defined");
      }

      if (!options.globalConstraint) {
        throw new Error("avatar globalConstraint is not defined");
      }

      if (!options.globalConstraintParametersHash) {
        throw new Error("avatar globalConstraintParametersHash is not defined");
      }

      if (!options.votingMachineHash) {
        throw new Error("avatar votingMachineHash is not defined");
      }
      // console.log(`****** avatar ${options.avatar} ******`);
      // console.log(`****** globalConstraint ${options.globalConstraint} ******`);
      // console.log(`****** globalConstraintParametersHash ${options.globalConstraintParametersHash} ******`);
      // console.log(`****** votingMachineHash ${options.votingMachineHash} ******`);

      var tx = await this.contract.proposeGlobalConstraint(options.avatar, options.globalConstraint, options.globalConstraintParametersHash, options.votingMachineHash);

      return tx;
    }
  }, {
    key: 'proposeToRemoveGlobalConstraint',
    value: async function proposeToRemoveGlobalConstraint() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


      var defaults = {
        /**
         * avatar address
         */
        avatar: undefined
        /**
         *  the address of the global constraint to remove
         */
        , globalConstraint: undefined
      };

      var options = dopts(opts, defaults, { allowUnknown: true });

      if (!options.avatar) {
        throw new Error("avatar address is not defined");
      }

      if (!options.globalConstraint) {
        throw new Error("avatar globalConstraint is not defined");
      }

      var tx = await this.contract.proposeToRemoveGC(options.avatar, options.globalConstraint);

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
      return overrideValue || '0x00000005';
    }
  }], [{
    key: 'new',
    value: async function _new() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // TODO: provide options to use an existing token or specify the new token
      var defaults = {
        fee: 0, // the fee to use this scheme, in Wei
        beneficiary: (0, _utils.getDefaultAccount)(),
        tokenAddress: null // the address of a token to use
      };

      var options = dopts(opts, defaults, { allowUnknown: true });

      var token = void 0;
      if (options.tokenAddress == null) {
        token = await DAOToken.new('globalconstraintregistrartoken', 'GCT');
        // TODO: or is it better to throw an error?
        // throw new Error('A tokenAddress must be provided');
      } else {
        token = await DAOToken.at(options.tokenAddress);
      }

      contract = await SolidityGlobalConstraintRegistrar.new(token.address, options.fee, options.beneficiary);
      return new this(contract);
    }
  }]);

  return GlobalConstraintRegistrar;
}((0, _utils.ExtendTruffleContract)(SolidityGlobalConstraintRegistrar));