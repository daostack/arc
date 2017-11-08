"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleContributionScheme = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dopts = require('default-options');

var SoliditySimpleContributionScheme = (0, _utils.requireContract)("SimpleContributionScheme");
var DAOToken = (0, _utils.requireContract)("DAOToken");

var SimpleContributionScheme = function (_ExtendTruffleContrac) {
  _inherits(SimpleContributionScheme, _ExtendTruffleContrac);

  function SimpleContributionScheme() {
    _classCallCheck(this, SimpleContributionScheme);

    return _possibleConstructorReturn(this, (SimpleContributionScheme.__proto__ || Object.getPrototypeOf(SimpleContributionScheme)).apply(this, arguments));
  }

  _createClass(SimpleContributionScheme, [{
    key: 'submitContribution',
    value: async function submitContribution() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaults = {
        avatar: undefined,
        description: undefined,
        nativeTokenReward: 0,
        reputationReward: 0,
        ethReward: 0,
        // TODO: This is an arbitrary address, which is no good.
        externalToken: '0x0008e8314d3f08fd072e06b6253d62ed526038a0',
        externalTokenReward: 0,
        beneficiary: undefined
      };

      var options = dopts(opts, defaults);

      // is the organization registered?
      var msg = 'This organization ' + options.avatar + ' is not registered on the current scheme ' + this.address;
      assert.isOk((await this.isRegistered(options.avatar)), msg);

      // TODO: Check if the fees are payable
      // check fees; first get the parameters
      // const avatarContract = await Avatar.at(options.avatar);
      // const controller = await Controller.at(await avatarContract.owner());
      // const paramsHash = await controller.getSchemeParameters(this.address);
      // const params = await this.contract.parameters(paramsHash);
      // params have these
      // uint orgNativeTokenFee; // a fee (in the organization's token) that is to be paid for submitting a contribution
      // bytes32 voteApproveParams;
      // uint schemeNativeTokenFee; // a fee (in the present schemes token)  that is to be paid for submission
      // BoolVoteInterface boolVote;
      // assert.equal(params[0].toNumber(), 0);
      // assert.equal(params[2].toNumber(), 0);

      var tx = await this.contract.submitContribution(options.avatar, // Avatar _avatar,
      options.description, // string _contributionDesciption,
      options.nativeTokenReward, // uint _nativeTokenReward,
      options.reputationReward, // uint _reputationReward,
      options.ethReward, // uint _ethReward,
      options.externalToken, // StandardToken _externalToken,
      options.externalTokenReward, // uint _externalTokenReward,
      options.beneficiary // address _beneficiary
      );
      return (0, _utils.getValueFromLogs)(tx, '_proposalId');
    }
  }, {
    key: 'setParams',
    value: async function setParams(params) {
      return await this._setParameters(params.orgNativeTokenFee, params.schemeNativeTokenFee, params.voteParametersHash, params.votingMachine);
    }
  }, {
    key: 'getDefaultPermissions',
    value: function getDefaultPermissions(overrideValue) {
      return overrideValue || '0x00000001';
    }
  }], [{
    key: 'new',
    value: async function _new() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // TODO: provide options to use an existing token or specifiy the new token
      var defaults = {
        tokenAddress: null, // the address of a token to use
        fee: 0, // the fee to use this scheme
        beneficiary: (0, _utils.getDefaultAccount)()
      };

      var options = dopts(opts, defaults);

      var token = void 0;
      if (options.tokenAddress == null) {
        token = await DAOToken.new('schemeregistrartoken', 'STK');
        // TODO: or is it better to throw an error?
        // throw 'A tokenAddress must be provided';
      } else {
        token = await DAOToken.at(options.tokenAddress);
      }

      contract = await SoliditySimpleContributionScheme.new(token.address, options.fee, options.beneficiary);
      return new this(contract);
    }
  }]);

  return SimpleContributionScheme;
}((0, _utils.ExtendTruffleContract)(SoliditySimpleContributionScheme));

exports.SimpleContributionScheme = SimpleContributionScheme;