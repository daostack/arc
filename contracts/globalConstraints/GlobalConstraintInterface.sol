pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

// solhint-disable-next-line indent
abstract contract GlobalConstraintInterface {

    enum CallPhase { Pre, Post, PreAndPost }

    function pre( address _scheme, bytes32 _method ) public virtual returns(bool);
    function post( address _scheme, bytes32 _method ) public virtual returns(bool);
    /**
     * @dev when return if this globalConstraints is pre, post or both.
     * @return CallPhase enum indication  Pre, Post or PreAndPost.
     */
    function when() public virtual returns(CallPhase);
}
