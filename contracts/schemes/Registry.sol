pragma solidity ^0.4.11;

import "../UniversalSimpleVoteInterface.sol";
import "../UniversalSchemes/UniversalScheme.sol";
import "zeppelin/contracts/token/StandardToken.sol"; // Should change to intreface.

contract Registry {
  UniversalSimpleVoteInterface simpleVote;
  uint _addPrec;
  uint _removePrec;
  uint _changeParamPrec;
  StandardToken nativeToken;
  uint fee;
  address beneficiary;

  mapping(address=>bool) registry;

  function Registry(UniversalSimpleVoteInterface _simpleVote, uint _addPrec, uint _removePrec, uint _changeParamPrec,
                    StandardToken _nativeToken, uint _fee, address beneficiary, address[] _initialRegistry) {
    simpleVote = _simpleVote;
    addPrec = _addPrec;
    removePrec = _removePrec;
    changeParamPrec = _changeParamPrec;
    beneficiary = _beneficiary;
    fee = _fee;
    for (cnt=0 ; cnt<_initialRegistry.length ; cnt++) {
      registry[_initialRegistry[cnt]] = true;
    }
  }

  function proposeParameters() {
    if( ! nativeToken.transferFrom(msg.sender, _controller, org.schemeNatvieTokenFee) ) revert();
  }

  function prposeRecord() {

  }

  function removeRecord() {

  }
}
