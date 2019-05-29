pragma solidity ^0.5.4;

import "../controller/ControllerInterface.sol";
import "../controller/Avatar.sol";


/**
 * @title DxDAOLockETH.
 * @dev  A scheme for locking and release funds in the dxdao on behalf of the dao.
 */
contract DxDAOLockETH {

    address public dxdaoEthLockingScheme = address(0x4564BFe303900178578769b2D76B1a13533E5fd5);
    Avatar public genesisDAOAvatar = Avatar(0x519b70055af55A007110B4Ff99b0eA33071c720a);
    uint256 public ethToLock = 10 ether;
    uint256 public periodToLock = 30*24*60*60; //30 days
    bytes32 public agreementHash = bytes32(0x2d9c919cecf0e19b7717a86747f703d8cf0f9ffd98e4e8a13638b1a92ef0b25a);
    bool public enable = true;

    event LockEth(
        uint256 indexed _period,
        uint256 indexed _amount,
        bytes indexed _lockingId
    );

    /**
    * @dev lock 10 eth for 30 days on the dxdao
    */
    function lock()
    public {
        require(enable); //allow one time lock only
        enable = false;
        bytes memory callData = abi.encodeWithSignature("lock(uint256,bytes32)", periodToLock, agreementHash);
        ControllerInterface controller = ControllerInterface(genesisDAOAvatar.owner());
        bool success;
        bytes memory lockingId;
        (success, lockingId) =
        controller.genericCall(dxdaoEthLockingScheme, callData, genesisDAOAvatar, ethToLock);
        if (success) {
            emit LockEth(periodToLock, ethToLock, lockingId);
        }

    }
}
