pragma solidity ^0.4.25;

import "../controller/ControllerInterface.sol";
import { RealMath } from "../libs/RealMath.sol";


/**
 * @title A locker contract
 */

contract Locking4Reputation {
    using SafeMath for uint;
    using RealMath for int216;
    using RealMath for int256;

    event Redeem(address indexed _beneficiary, uint _amount);
    event Release(bytes32 indexed _lockingId, address indexed _beneficiary, uint _amount);
    event Lock(address indexed _locker, bytes32 indexed _lockingId, uint _amount, uint _period);

    struct Locker {
        uint amount;
        uint releaseTime;
    }

    Avatar public avatar;

    // A mapping from lockers addresses their lock balances.
    mapping(address => mapping(bytes32=>Locker)) public lockers;
    // A mapping from lockers addresses to their scores.
    mapping(address => uint) public scores;

    uint public totalLocked;
    uint public totalLockedLeft;
    uint public totalScore;
    uint public lockingsCounter; // Total number of lockings
    uint public reputationReward;
    uint public reputationRewardLeft;
    uint public lockingEndTime;
    uint public maxLockingPeriod;
    uint public lockingStartTime;

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary for the release
     * @return bool
     */
    function redeem(address _beneficiary) public returns(bool) {
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= lockingEndTime, "check the lock period pass");
        require(scores[_beneficiary] > 0, "score should be > 0");
        uint score = scores[_beneficiary];
        scores[_beneficiary] = 0;
        int256 repRelation = int216(score).toReal().mul(int216(reputationReward).toReal());
        uint reputation = uint256(repRelation.div(int216(totalScore).toReal()).fromReal());

        //check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(ControllerInterface(avatar.owner()).mintReputation(reputation, _beneficiary, avatar), "mint reputation should success");

        emit Redeem(_beneficiary, reputation);

        return true;
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function _release(address _beneficiary, bytes32 _lockingId) internal returns(uint amount) {
        Locker storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0, "amount should be > 0");
        amount = locker.amount;
        locker.amount = 0;
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= locker.releaseTime, "check the lock period pass");
        totalLockedLeft = totalLockedLeft.sub(amount);

        emit Release(_lockingId, _beneficiary, amount);
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
     * @param _locker the locker
     * @return lockingId
     */
    function _lock(uint _amount, uint _period, address _locker) internal returns(bytes32 lockingId) {
        require(_amount > 0, "locking amount should be > 0");
        require(_period <= maxLockingPeriod, "locking period should be <= maxLockingPeriod");
        require(_period > 0, "locking period should be > 0");
        // solium-disable-next-line security/no-block-members
        require(now <= lockingEndTime, "lock should be within the allowed locking period");
        // solium-disable-next-line security/no-block-members
        require(now >= lockingStartTime, "lock should start after lockingStartTime");

        lockingId = keccak256(abi.encodePacked(this, lockingsCounter));
        lockingsCounter++;

        Locker storage locker = lockers[_locker][lockingId];
        locker.amount = _amount;
        // solium-disable-next-line security/no-block-members
        locker.releaseTime = now + _period;
        totalLocked += _amount;
        totalLockedLeft = totalLocked;
        scores[_locker] = scores[_locker].add(_period.mul(_amount));
        totalScore = totalScore.add(scores[_locker]);

        emit Lock(_locker, lockingId, _amount, _period);
    }

    /**
     * @dev _initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for eth/token locking
     * @param _lockingStartTime the locking start time.
     * @param _lockingEndTime the locking end time.
     *        redeem reputation can be done after this period.
     *        locking is disable after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     */
    function _initialize(
        Avatar _avatar,
        uint _reputationReward,
        uint _lockingStartTime,
        uint _lockingEndTime,
        uint _maxLockingPeriod)
    internal
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_lockingEndTime > _lockingStartTime, "locking end time should be greater than locking start time");

        reputationReward = _reputationReward;
        reputationRewardLeft = _reputationReward;
        lockingEndTime = _lockingEndTime;
        maxLockingPeriod = _maxLockingPeriod;
        avatar = _avatar;
        lockingStartTime = _lockingStartTime;
    }

}
