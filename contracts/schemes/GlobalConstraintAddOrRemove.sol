pragma solidity 0.5.17;

import "../controller/Controller.sol";

/**
 * @title A scheme for adding or removing a global constraint
 * The scheme will unregister itself after register the globalConstraint
 * This scheme should be register to the dao with permission 0x00000004
 */

contract GlobalConstraintAddOrRemove {

    Avatar public avatar;
    address public globalConstraint;
    bytes32 public paramsHash;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _globalConstraint the globalConstraint address
     * @param _paramsHash globalConstraint paramsHash
     */
    function initialize(
        Avatar _avatar,
        address _globalConstraint,
        bytes32 _paramsHash
    ) external {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        globalConstraint = _globalConstraint;
        paramsHash = _paramsHash;
    }

    /**
     * @dev add globalConstraint
     * and remove itsef.
     */
    function add() external {
        Controller(avatar.owner()).addGlobalConstraint(globalConstraint, paramsHash, address(avatar));
        Controller(avatar.owner()).unregisterSelf(address(avatar));
    }

    /**
     * @dev remove globalConstraint
     * and remove itsef.
     */
    function remove() external {
        Controller(avatar.owner()).removeGlobalConstraint(globalConstraint, address(avatar));
        Controller(avatar.owner()).unregisterSelf(address(avatar));
    }

}
