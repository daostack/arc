pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";

/**
 * @title Token Cap Global Constraint
 * @dev A simple global contraint to cap the number of tokens.
 */

contract TokenCap {
  // A set of parameters, on which the cap will be checked:
  struct Parameters {
    StandardToken token;
    uint cap;
  }

  // Mapping from the hash of the parameters to the parameters themselves:
  mapping (bytes32=>Parameters) params;

  function TokenCap() {

  }

  // Adding a new set of parameters:
  function setParameters(StandardToken _token, uint _cap) returns(bytes32) {
    bytes32 paramsHash = getParametersHash(_token, _cap);
    params[paramsHash].token = _token;
    params[paramsHash].cap = _cap;
    return paramsHash;
  }

  // The format of the hashing of the parameters:
  function getParametersHash(StandardToken _token, uint _cap) constant returns(bytes32) {
    return (sha3( _token, _cap));
  }

  // This global contraint only checks the state after the action, so here we just return true:
  function pre( address , bytes32 , bytes  ) returns(bool) {
    return true;
  }

  // Checking the cap:
  function post( address , bytes32 _paramsHash, bytes  ) returns(bool) {
    if ( params[_paramsHash].token.totalSupply() > params[_paramsHash].cap)
      return false;
    return true;
  }
}
