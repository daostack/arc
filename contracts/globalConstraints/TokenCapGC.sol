pragma solidity ^0.6.10;
// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./GlobalConstraintInterface.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";


/**
 * @title Token Cap Global Constraint
 * @dev A simple global constraint to cap the number of tokens.
 */
contract TokenCapGC is Initializable {
    // A set of parameters, on which the cap will be checked:
    struct Parameters {
        IERC20 token;
        uint256 cap;
    }

    Parameters public parameters;

    /**
     * @dev initialize
     * @param  _token the token this contract refer to.
     * @param _cap the cap to check the total supply against.
     */
    function initialize(IERC20 _token, uint256 _cap)
    external
    initializer {
        parameters = Parameters({
            token: _token,
            cap: _cap
        });
    }

    /**
     * @dev check the constraint before the action.
     * This global constraint only checks the state after the action, so here we just return true:
     * @return true
     */
    function pre(address, bytes32) public pure returns(bool) {
        return true;
    }

    /**
     * @dev check the total supply cap.
     * @return bool which represents a success
     */
    function post(address, bytes32) public view returns(bool) {
        if ((parameters.token != IERC20(0)) &&
            (parameters.token.totalSupply() > parameters.cap)) {
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
