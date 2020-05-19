pragma solidity ^0.5.17;

import "../controller/Avatar.sol";
import "../controller/Controller.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

/**
 * @title A scheme for register other scheme with full permission.
 */

contract BackDoor is Initializable, Ownable {

    Avatar public avatar;

    /**
     * @dev registerScheme
     * @param _scheme the scheme to register (with full permission)
     */
    function registerScheme(address _scheme) external onlyOwner {
        //register a scheme with full permission :)
        require(Controller(avatar.owner()).registerScheme(_scheme, 0x0000001f), "Fail to register scheme");
    }

    /**
     * @dev _initialize
     * @param _avatar the scheme avatar
     * @param _owner the contract owner
     */
    function initialize(Avatar _avatar, address _owner) public initializer {
        require(address(_avatar) != address(0), "Scheme must have avatar");
        Ownable.initialize(_owner);
        avatar = _avatar;
    }

}
