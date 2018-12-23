pragma solidity ^0.4.25;

import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title A scheme to forward a call to a dao.
 *        The scheme can unregister itself when its expirationTime reached.
 */


contract Forwarder is Ownable {

    Avatar public avatar;
    uint256 public expirationTime;

    /**
     * @dev forwardCall forward a call to the dao controller
     */
    function () external onlyOwner {
        // solium-disable-next-line security/no-block-members
        require(expirationTime > now, "expirationTime > now");
        // solium-disable-next-line security/no-low-level-calls
        bool result = avatar.owner().call(msg.data);
        // solium-disable-next-line security/no-inline-assembly
        assembly {
        // Copy the returned data.
        returndatacopy(0, 0, returndatasize)

        switch result
        // call returns 0 on error.
        case 0 { revert(0, returndatasize) }
        default { return(0, returndatasize) }
        }
    }

    /**
     * @dev initialize
     * @param _avatar the avatar of the dao to forward the call to
     * @param _expirationTime the expirationTime to forwardCall
     */
    function initialize(Avatar _avatar, uint256 _expirationTime) external onlyOwner {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        expirationTime = _expirationTime;
    }

    /**
     * @dev unregisterSelf function
     * @return bool
     */
    function unregisterSelf() public returns(bool) {
       // solium-disable-next-line security/no-block-members
        require(expirationTime <= now, "expirationTime <= now");
        return ControllerInterface(avatar.owner()).unregisterSelf(address(avatar));
    }
}
