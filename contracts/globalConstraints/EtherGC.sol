pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./GlobalConstraintInterface.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Avatar.sol";


/**
 * @title EtherGC ether constraint per period
 */
contract EtherGC is GlobalConstraintInterface {
    using SafeMath for uint256;

    uint256 public periodLength; //the period length in seconds
    uint256 public amountAllowedPerPeriod;
    Avatar public avatar;
    uint256 public startTime;
    uint256 public avatarBalanceBefore;
    // a mapping from period indexes to amounts
    mapping(uint256=>uint256) public totalAmountSentPerPeriod;

  /**
   * @dev initialize
   * @param _avatar the avatar to enforce the constraint on
   * @param _periodLength the periodLength in seconds
   * @param _amountAllowedPerPeriod the amount of eth to constraint for each period
   */
    function initialize(
        Avatar _avatar,
        uint256 _periodLength,
        uint256 _amountAllowedPerPeriod
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        periodLength = _periodLength;
        amountAllowedPerPeriod = _amountAllowedPerPeriod;
        // solhint-disable-next-line not-rely-on-time
        startTime = now;
    }

    /**
     * @dev check the constraint before the action.
     * @return true
     */
    function pre(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == avatar.owner(), "only avatar owner is authorize to call");
        avatarBalanceBefore = address(avatar).balance;
        return true;
    }

    /**
     * @dev check the allowance of ether sent per period
     * and throws an error if the constraint is violated
     * @return bool which represents a success
     */
    function post(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == avatar.owner(), "only avatar owner is authorize to call");
        if (avatarBalanceBefore > address(avatar).balance) {
          // solhint-disable-next-line not-rely-on-time
            uint256 currentPeriodIndex = (now - startTime)/periodLength;
            totalAmountSentPerPeriod[currentPeriodIndex] =
            totalAmountSentPerPeriod[currentPeriodIndex].add(avatarBalanceBefore.sub(address(avatar).balance));
            require(totalAmountSentPerPeriod[currentPeriodIndex] <= amountAllowedPerPeriod,
            "Violation of Global constraint EtherGC:amount sent exceed in current period");
        }
        avatarBalanceBefore = 0; //save gas
        return true;
    }

    /**
     * @dev when return if this globalConstraints is pre, post or both.
     * @return CallPhase enum indication  Pre, Post or PreAndPost.
     */
    function when() public pure returns(GlobalConstraintInterface.CallPhase) {
        return GlobalConstraintInterface.CallPhase.PreAndPost;
    }
}
