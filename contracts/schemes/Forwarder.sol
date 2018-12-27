pragma solidity ^0.5.2;

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
    // solhint-disable-next-line no-complex-fallback,payable-fallback
    function () external onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        require(expirationTime > now, "expirationTime > now");
        // solhint-disable-next-line avoid-low-level-calls
        (bool result,) = avatar.owner().call(msg.data);
        require(result);
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
       // solhint-disable-next-line not-rely-on-time
        require(expirationTime <= now, "expirationTime <= now");
        return ControllerInterface(avatar.owner()).unregisterSelf(address(avatar));
    }
}
