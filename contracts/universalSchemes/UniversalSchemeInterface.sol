pragma solidity ^0.5.2;

import "../controller/Avatar.sol";

contract UniversalSchemeInterface {

    function updateParameters(bytes32 _hashedParameters) public;

    function getParametersFromController(Avatar _avatar) internal view returns(bytes32);
}
