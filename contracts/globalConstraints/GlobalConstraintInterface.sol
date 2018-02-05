pragma solidity ^0.4.19;


contract GlobalConstraintInterface {

    enum CallPhase { Never, Pre, Post,PreAndPost }

    function pre( address _scheme, bytes32 _params, bytes32 _method ) public returns(bool);
    function post( address _scheme, bytes32 _params, bytes32 _method ) public returns(bool);
    /**
     * @dev when return if this globalConstraints is pre, post or both.
     * @return CallPhase enum indication 0 -Nothig ,1 - pre ,2- post ,3 - both.
     */
    function when() public returns(CallPhase);
}
