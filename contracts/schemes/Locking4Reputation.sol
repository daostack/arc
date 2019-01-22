pragma solidity ^0.5.2;

import "../controller/ControllerInterface.sol";


/**
 * @title A locker contract
 */

contract Locking4Reputation {
    using SafeMath for uint256;

    event Redeem(address indexed _beneficiary, uint256 _amount);
    event Release(bytes32 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event Lock(address indexed _locker, bytes32 indexed _lockingId, uint256 _amount, uint256 _period);

    struct Locker {
        uint256 amount;
        uint256 releaseTime;
    }

    Avatar public avatar;

    // A mapping from lockers addresses their lock balances.
    mapping(address => mapping(bytes32=>Locker)) public lockers;
    // A mapping from lockers addresses to their scores.
    mapping(address => uint) public scores;

    uint256 public totalLocked;
    uint256 public totalLockedLeft;
    uint256 public totalScore;
    uint256 public lockingsCounter; // Total number of lockings
    uint256 public reputationReward;
    uint256 public reputationRewardLeft;
    uint256 public lockingEndTime;
    uint256 public maxLockingPeriod;
    uint256 public lockingStartTime;
    uint256 public redeemEnableTime;

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary for the release
     * @return uint256 reputation rewarded
     */
    function redeem(address _beneficiary) public returns(uint256 reputation) {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp > redeemEnableTime, "now > redeemEnableTime");
        require(scores[_beneficiary] > 0, "score should be > 0");
        uint256 score = scores[_beneficiary];
        scores[_beneficiary] = 0;
        uint256 repRelation = score.mul(reputationReward);
        reputation = repRelation.div(totalScore);

        //check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(
        ControllerInterface(
        avatar.owner())
        .mintReputation(reputation, _beneficiary, address(avatar)), "mint reputation should succeed");

        emit Redeem(_beneficiary, reputation);
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function _release(address _beneficiary, bytes32 _lockingId) internal returns(uint256 amount) {
        Locker storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0, "amount should be > 0");
        amount = locker.amount;
        locker.amount = 0;
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp > locker.releaseTime, "check the lock period pass");
        totalLockedLeft = totalLockedLeft.sub(amount);

        emit Release(_lockingId, _beneficiary, amount);
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
     * @param _locker the locker
     * @param _numerator price numerator
     * @param _denominator price denominator
     * @return lockingId
     */
    function _lock(
        uint256 _amount,
        uint256 _period,
        address _locker,
        uint256 _numerator,
        uint256 _denominator)
        internal
        returns(bytes32 lockingId)
        {
        require(_amount > 0, "locking amount should be > 0");
        require(_period <= maxLockingPeriod, "locking period should be <= maxLockingPeriod");
        require(_period > 0, "locking period should be > 0");
        // solhint-disable-next-line not-rely-on-time
        require(now <= lockingEndTime, "lock should be within the allowed locking period");
        // solhint-disable-next-line not-rely-on-time
        require(now >= lockingStartTime, "lock should start after lockingStartTime");

        lockingId = keccak256(abi.encodePacked(address(this), lockingsCounter));
        lockingsCounter = lockingsCounter.add(1);

        Locker storage locker = lockers[_locker][lockingId];
        locker.amount = _amount;
        // solhint-disable-next-line not-rely-on-time
        locker.releaseTime = now + _period;
        totalLocked = totalLocked.add(_amount);
        totalLockedLeft = totalLocked;
        uint256 score = _period.mul(_amount).mul(_numerator).div(_denominator);
        require(score > 0, "score must me > 0");
        scores[_locker] = scores[_locker].add(score);
        //verify that redeem will not overflow for this locker
        require((scores[_locker] * reputationReward)/scores[_locker] == reputationReward,
        "score is too high");
        totalScore = totalScore.add(score);

        emit Lock(_locker, lockingId, _amount, _period);
    }

    /**
     * @dev _initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for eth/token locking
     * @param _lockingStartTime the locking start time.
     * @param _lockingEndTime the locking end time.
     *        locking is disable after this time.
     * @param _redeemEnableTime redeem enable time .
     *        redeem reputation can be done after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     */
    function _initialize(
        Avatar _avatar,
        uint256 _reputationReward,
        uint256 _lockingStartTime,
        uint256 _lockingEndTime,
        uint256 _redeemEnableTime,
        uint256 _maxLockingPeriod)
    internal
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_lockingEndTime > _lockingStartTime, "locking end time should be greater than locking start time");
        require(_redeemEnableTime >= _lockingEndTime, "redeemEnableTime >= lockingEndTime");

        reputationReward = _reputationReward;
        reputationRewardLeft = _reputationReward;
        lockingEndTime = _lockingEndTime;
        maxLockingPeriod = _maxLockingPeriod;
        avatar = _avatar;
        lockingStartTime = _lockingStartTime;
        redeemEnableTime = _redeemEnableTime;
    }

}
