pragma solidity 0.5.13;

import "../controller/Avatar.sol";

contract UniversalSchemeInterface {

    function getParametersFromController(Avatar _avatar) internal view returns(bytes32);
    
}
