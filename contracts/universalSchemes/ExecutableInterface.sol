pragma solidity ^0.4.11;

import "../controller/Controller.sol";

contract ExecutableInterface {
  function execute( bytes32 _id, address _avatar, int _param ) returns(bool);
}
