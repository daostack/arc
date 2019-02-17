pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./GlobalConstraintInterface.sol";


/**
 * @title Token Cap Global Constraint
 * @dev A simple global constraint to cap the number of tokens.
 */

contract TokenCapGC {
    // A set of parameters, on which the cap will be checked:
    struct Parameters {
        IERC20 token;
        uint256 cap;
    }

    // Mapping from the hash of the parameters to the parameters themselves:
    mapping (bytes32=>Parameters) public parameters;

    /**
     * @dev adding a new set of parameters
     * @param  _token the token to add to the params.
     * @param _cap the cap to check the total supply against.
     * @return the calculated parameters hash
     */
    function setParameters(IERC20 _token, uint256 _cap) public returns(bytes32) {
        bytes32 paramsHash = getParametersHash(_token, _cap);
        parameters[paramsHash].token = _token;
        parameters[paramsHash].cap = _cap;
        return paramsHash;
    }

    /**
     * @dev calculate and returns the hash of the given parameters
     * @param  _token the token to add to the params.
     * @param _cap the cap to check the total supply against.
     * @return the calculated parameters hash
     */
    function getParametersHash(IERC20 _token, uint256 _cap) public pure returns(bytes32) {
        return (keccak256(abi.encodePacked(_token, _cap)));
    }

    /**
     * @dev check the constraint after the action.
     * This global constraint only checks the state after the action, so here we just return true:
     * @return true
     */
    function pre(address, bytes32, bytes32) public pure returns(bool) {
        return true;
    }

    /**
     * @dev check the total supply cap.
     * @param  _paramsHash the parameters hash to check the total supply cap against.
     * @return bool which represents a success
     */
    function post(address, bytes32 _paramsHash, bytes32) public view returns(bool) {
        if ((parameters[_paramsHash].token != IERC20(0)) &&
            (parameters[_paramsHash].token.totalSupply() > parameters[_paramsHash].cap)) {
            return false;
        }
        return true;
    }

    /**
     * @dev when return if this globalConstraints is pre, post or both.
     * @return CallPhase enum indication  Pre, Post or PreAndPost.
     */
    function when() public pure returns(GlobalConstraintInterface.CallPhase) {
        return GlobalConstraintInterface.CallPhase.Post;
    }
}
