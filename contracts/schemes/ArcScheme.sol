pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract ArcScheme is Initializable {
    Avatar public avatar;

    /**
     * @dev _initialize
     * @param _avatar the scheme avatar
     */
    function _initialize(Avatar _avatar) internal initializer
    {
        require(address(_avatar) != address(0), "Scheme must have avatar");
        avatar = _avatar;
    }
}
