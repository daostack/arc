pragma solidity 0.5.17;

import "../controller/Controller.sol";

/**
 * @title A scheme to update dxDAO security.
 * The scheme will do the following:
 * by calling update:
     * 1. register 2 globalConstraints (etherGC,reputationGC)
     * 2. downgrade permission of schemeRegistrar to 0x00000002 (only register other schemes)
 * by calling restorePermission :
 *  1. Re set schemeRegistrar permission to 0x0000001f only after restorePermissionTime.
 *  2. The scheme will unregister itself
 * This scheme should be register to the dao with permission 0x0000001f
 */

contract DxDAOSecurityAddOn {

    Avatar public avatar;
    address[2] public globalConstraints;
    address public schemeRegistrar;
    uint256 public restorePermissionTime;
    bytes32 public schemeRegistrarParamsHash;
    bool public updateDisable;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _globalConstraints globalConstraints addresses
     * @param _schemeRegistrar the dao current schemeRegistrar
     * @param _schemeRegistrarParamsHash the dao current schemeRegistrar paramsHash
     * @param _restorePermissionTime the time where the schemeRegistrar permission will be set back to 0x0000001F
     */
    function initialize(
        Avatar _avatar,
        address[2] calldata _globalConstraints,
        address _schemeRegistrar,
        bytes32 _schemeRegistrarParamsHash,
        uint256 _restorePermissionTime
    ) external {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        globalConstraints = _globalConstraints;
        schemeRegistrar = _schemeRegistrar;
        restorePermissionTime = _restorePermissionTime;
        schemeRegistrarParamsHash = _schemeRegistrarParamsHash;
    }

    /**
     * @dev update - update the dao :
     * 1. register 2 globalConstraints (etherGC,reputationGC)
     * 2. downgrade permission of schemeRegistrar to 0x00000002 (only register other schemes)
     */
    function update() external {
        require(updateDisable == false, "update is diable");
        updateDisable = true;
        Controller controller = Controller(avatar.owner());
        controller.addGlobalConstraint(globalConstraints[0], bytes32(0), address(avatar));
        controller.addGlobalConstraint(globalConstraints[1], bytes32(0), address(avatar));
        controller.registerScheme(schemeRegistrar, schemeRegistrarParamsHash, 0x00000002, address(avatar));
    }

    /**
     * @dev restorePermission re set schemeRegistrar permission to 0x0000001f only after restorePermissionTime.
     * and remove itsef.
     */
    function restorePermission() external {
      // solhint-disable-next-line not-rely-on-time
        require(now > restorePermissionTime, "re activation time not reached yet");
        Controller controller = Controller(avatar.owner());
        controller.registerScheme(schemeRegistrar, schemeRegistrarParamsHash, 0x0000001f, address(avatar));
        controller.unregisterSelf(address(avatar));
    }

}
