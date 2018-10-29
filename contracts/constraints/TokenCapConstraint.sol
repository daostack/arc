pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./ConstraintInterface.sol";


/**
 * @title Token Cap Constraint
 * @dev A simple constraint to cap the number of tokens.
 */

contract TokenCapConstraint {
    StandardToken token;
    uint cap;

    constructor() public {
        token = StandardToken(0x000000000000000000000000000000000000dead);
    }

    function init(StandardToken _token, uint _cap) external {
        require(token == StandardToken(0), "can be called only one time");
        require(_token != StandardToken(0), "token cannot be zero");

        token = _token;
        cap = _cap;
    }

    /**
     * @dev check the constraint after the action.
     * This constraint only checks the state after the action, so here we just return true:
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
        if (token != StandardToken(0) && (token.totalSupply() > cap)) {
            return false;
        }
        return true;
    }

    /**
     * @dev when return if this constraint is pre, post or both.
     * @return CallPhase enum indication Pre, Post or PreAndPost.
     */
    function when() public pure returns(ConstraintInterface.CallPhase) {
        return ConstraintInterface.CallPhase.Post;
    }
}
