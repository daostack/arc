pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./GlobalConstraintInterface.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title EtherGC ether constraint per period
 */
contract EtherGC {
    using SafeMath for uint256;

    uint256 public constraintPeriodWindow; //a static window
    uint256 public amountAllowedPerPeriod;
    address public avatar;
    uint256 public latestEthBalance;
    mapping(uint256=>uint256) public totalAmountSentForPeriods;
    uint256 public startBlock;
    address public controller;
    uint256 public avatarBalanceBefore;

  /**
   * @dev initialize
   * @param _avatar the avatar to mint reputation from
   * @param _constraintPeriodWindow the constraintPeriodWindow in blocks units
   * @param _amountAllowedPerPeriod the amount of eth to constraint for each period
   */
    function initialize(
        address _avatar,
        uint256 _constraintPeriodWindow,
        uint256 _amountAllowedPerPeriod,
        address _controller
    )
    external
    {
        require(avatar == address(0), "can be called only one time");
        require(_avatar != address(0), "avatar cannot be zero");
        avatar = _avatar;
        constraintPeriodWindow = _constraintPeriodWindow;
        amountAllowedPerPeriod = _amountAllowedPerPeriod;
        latestEthBalance = avatar.balance;
        startBlock = block.number;
        controller = _controller;
    }

    /**
     * @dev check the constraint before the action.
     * @return true
     */
    function pre(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == controller, "only controller is authorize to call");
        avatarBalanceBefore = avatar.balance;
        return true;
    }

    /**
     * @dev check the allowance of ether sent per period.
     * @return bool which represents a success
     */
    function post(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == controller, "only controller is authorize to call");
        uint256 currentPeriodIndex = (block.number - startBlock)/constraintPeriodWindow;
        if ((block.number - startBlock) % constraintPeriodWindow > 0) {
            currentPeriodIndex = currentPeriodIndex.add(1);
        }
        if (avatarBalanceBefore >= avatar.balance) {
            uint256 ethSentAmount = avatarBalanceBefore.sub(avatar.balance);
            totalAmountSentForPeriods[currentPeriodIndex] =
            totalAmountSentForPeriods[currentPeriodIndex].add(ethSentAmount);
            require(totalAmountSentForPeriods[currentPeriodIndex] <= amountAllowedPerPeriod,
            "exceed the amount allowed");
        } 
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
