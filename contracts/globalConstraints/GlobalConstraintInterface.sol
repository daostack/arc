pragma solidity ^0.4.11;

contract GlobalConstraintInterface {
    function pre( address _scheme, bytes32 _params, bytes _method ) returns(bool);
    function post( address _scheme, bytes32 _params, bytes _method ) returns(bool);
}
