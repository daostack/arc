"use strict";
// const dopts = require('default-options');

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenCapGC = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SolidityTokenCapGC = (0, _utils.requireContract)("TokenCapGC");

var TokenCapGC = exports.TokenCapGC = function (_ExtendTruffleContrac) {
  _inherits(TokenCapGC, _ExtendTruffleContrac);

  function TokenCapGC() {
    _classCallCheck(this, TokenCapGC);

    return _possibleConstructorReturn(this, (TokenCapGC.__proto__ || Object.getPrototypeOf(TokenCapGC)).apply(this, arguments));
  }

  _createClass(TokenCapGC, [{
    key: "setParams",
    value: async function setParams(params) {
      return await this._setParameters(params.token, params.cap);
    }
  }], [{
    key: "new",
    value: async function _new() {
      contract = await SolidityTokenCapGC.new();
      return new this(contract);
    }
  }]);

  return TokenCapGC;
}((0, _utils.ExtendTruffleContract)(SolidityTokenCapGC));