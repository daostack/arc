pragma solidity ^0.4.15;

contract GlobalConstraintInterface {
    function pre( address _scheme, bytes32 _params, bytes32 _method ) returns(bool);
    function post( address _scheme, bytes32 _params, bytes32 _method ) returns(bool);
}
