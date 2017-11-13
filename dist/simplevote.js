"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleVote = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //


var SoliditySimpleVote = (0, _utils.requireContract)("SimpleVote");

/**
 * DEPRECATED
 */

var SimpleVote = function (_ExtendTruffleContrac) {
  _inherits(SimpleVote, _ExtendTruffleContrac);

  function SimpleVote() {
    _classCallCheck(this, SimpleVote);

    return _possibleConstructorReturn(this, (SimpleVote.__proto__ || Object.getPrototypeOf(SimpleVote)).apply(this, arguments));
  }

  _createClass(SimpleVote, [{
    key: "vote",
    value: async function vote(proposalId) {
      // check preconditions for voting
      proposalInfo = await this.contract.proposals(proposalId);
      // console.log(proposalInfo);
      // a propsoal has the following structure
      // 0. address owner;
      // 1. address avatar;
      // 2. ExecutableInterface executable;
      // 3. bytes32 paramsHash;
      // 4. uint yes; // total 'yes' votes
      // 5. uint no; // total 'no' votes
      // MAPPING is skipped in the reutnr value...
      // X.mapping(address=>int) voted; // save the amount of reputation voted by an agent (positive sign is yes, negatice is no)
      // 6. bool opened; // voting opened flag
      // 7. bool ended; // voting had ended flag
      // the prposal must be opened, but not ended
      assert.ok(proposalInfo[6]); // proposal.opened is true
      assert.notOk(proposalInfo[7]); // proposal.Ended is false
      // call this.contract.vote(proposalId, ...);
    }
  }]);

  return SimpleVote;
}((0, _utils.ExtendTruffleContract)(SoliditySimpleVote));

exports.SimpleVote = SimpleVote;