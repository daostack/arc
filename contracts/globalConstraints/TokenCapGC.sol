pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/StandardToken.sol";


/**
 * @title Token Cap Global Constraint
 * @dev A simple global contraint to cap the number of tokens.
 */

contract TokenCapGC {
    // A set of parameters, on which the cap will be checked:
    struct Parameters {
        StandardToken token;
        uint cap;
    }

    // Mapping from the hash of the parameters to the parameters themselves:
    mapping (bytes32=>Parameters) public params;


    // Adding a new set of parameters:
    function setParameters(StandardToken _token, uint _cap) public returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_token, _cap);
        params[paramsHash].token = _token;
        params[paramsHash].cap = _cap;
        return paramsHash;
    }

    // The format of the hashing of the parameters:
    function getParametersHash(StandardToken _token, uint _cap) public pure returns(bytes32) {
        return (keccak256(_token, _cap));
    }

    // This global contraint only checks the state after the action, so here we just return true:
    function pre(address, bytes32, bytes) public returns(bool) {
        return true;
    }

    // Checking the cap:
    function post(address, bytes32 _paramsHash, bytes) public returns(bool) {
        if ( params[_paramsHash].token.totalSupply() > params[_paramsHash].cap)
            return false;
        return true;
    }
}
