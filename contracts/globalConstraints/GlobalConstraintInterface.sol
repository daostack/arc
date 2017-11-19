pragma solidity ^0.4.18;

contract GlobalConstraintInterface {
  function pre( address _scheme, bytes32 _params, bytes32 _method ) public returns(bool);
  function post( address _scheme, bytes32 _params, bytes32 _method ) public returns(bool);
}
