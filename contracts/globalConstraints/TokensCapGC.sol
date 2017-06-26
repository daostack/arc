pragma solidity ^0.4.11;

import "/zeppelin/contracts/token/StandardToken.sol";

contract TokenCap {
  struct Parameters {
    StandardToken token;
    uint cap;
  }

  mapping (bytes32=>Parameters) params;

  function TokenCap() {

  }

  function setParameters(StandardToken _token, uint _cap) returns(bytes32) {
    bytes32 paramsHash = getParametersHash(_token, _cap);
    params[paramsHash].token = _token;
    params[paramsHash].cap = _cap;
    return paramsHash;
  }

  function getParametersHash(StandardToken _token, uint _cap) constant returns(bytes32) {
    return (sha3( _token, _cap));
  }

  function pre( address , bytes32 , bytes  ) returns(bool) {
    return true;
  }

  function post( address , bytes32 _paramsHash, bytes  ) returns(bool) {
    if ( params[_paramsHash].token.totalSupply() > params[_paramsHash].cap)
      return false;
    return true;
  }
}
