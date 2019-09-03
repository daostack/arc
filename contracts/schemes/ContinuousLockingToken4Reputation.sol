pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/ControllerInterface.sol";
import "../libs/SafeERC20.sol";
import "./Agreement.sol";
import { RealMath } from "@daostack/infra/contracts/libs/RealMath.sol";

/**
 * @title A scheme for conduct ERC20 Tokens auction for reputation
 */


contract ContinuousLocking4Reputation is Agreement {
    using SafeMath for uint256;
    using SafeERC20 for address;
    using RealMath for uint216;
    using RealMath for uint256;

    event Redeem(bytes32 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event Release(bytes32 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event Lock(address indexed _locker, bytes32 indexed _lockingId, uint256 _amount, uint256 _period);

    struct Locking {
        uint256 totalScore;
        // A mapping from locker addresses to their locking score.
        mapping(address=>uint256) scores;
    }

    struct Locker {
        uint256 amount;
        uint256 releaseTime;
        uint256 lockingTime;
        uint256 period;
    }

    // A mapping from lockers addresses their lock balances.
    mapping(address => mapping(bytes32=>Locker)) public lockers;
    // A mapping from locking index to locking.
    mapping(uint256=>Locking) public lockings;

    Avatar public avatar;
    uint256 public reputationRewardLeft;
    uint256 public lockingStartTime;
    uint256 public numberOfLockingPeriods;
    uint256 public lockingReputationReward;
    uint256 public redeemEnableTime;
    uint256 public maxLockingPeriod;
    uint256 public lockingPeriodsUnit;
    IERC20 public token;
    uint256 public lockingsCounter; // Total number of lockings
    uint256 public totalLockedLeft;
    uint256 repRewardConstA;
    uint256 repRewardConstB;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _lockingReputationReward the reputation reward per auction this contract will reward
     *        for the token locking
     * @param _lockingStartTime auctions period start time
     * @param _lockingPeriodsUnit locking periods units (e.g 30 days).
     * @param _redeemEnableTime redeem enable time .
     *        redeem reputation can be done after this time.
     * @param _maxLockingPeriod - maximum number of locking periods (in _lockingPeriodsUnit units)
     * @param _token the bidding token
     * @param _agreementHash is a hash of agreement required to be added to the TX by participants
     */
    function initialize(
        Avatar _avatar,
        uint256 _lockingReputationReward,
        uint256 _lockingStartTime,
        uint256 _lockingPeriodsUnit,
        uint256 _redeemEnableTime,
        uint256 _maxLockingPeriod,
        IERC20 _token,
        uint256 _repRewardConstA,
        uint256 _repRewardConstB,
        bytes32 _agreementHash )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        //_lockingPeriodsUnit should be greater than block interval
        require(_lockingPeriodsUnit > 15, "lockingPeriod should be > 15");
        require(_redeemEnableTime >= _lockingStartTime+_lockingPeriodsUnit,
        "_redeemEnableTime >= _lockingStartTime+_lockingPeriodsUnit");
        token = _token;
        avatar = _avatar;
        lockingStartTime = _lockingStartTime;
        lockingReputationReward = _lockingReputationReward;
        redeemEnableTime = _redeemEnableTime;
        maxLockingPeriod = _maxLockingPeriod;
        lockingPeriodsUnit = _lockingPeriodsUnit;
        repRewardConstA = _repRewardConstA;
        repRewardConstB = uint216(_repRewardConstB).fraction(uint216(1000));
        super.setAgreementHash(_agreementHash);
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary to redeem.
     * @param _lockingId the lockingId to redeem from.
     * @return uint256 reputation rewarded
     */
    function redeem(address _beneficiary, bytes32 _lockingId) public returns(uint256 reputation) {
        // solhint-disable-next-line not-rely-on-time
        require(now > redeemEnableTime, "now > redeemEnableTime");
        Locker storage locker = lockers[_beneficiary][_lockingId];
        uint256 lockingPeriodToRedeemFrom = (locker.lockingTime - lockingStartTime) / lockingPeriodsUnit;
        for (lockingPeriodToRedeemFrom; lockingPeriodToRedeemFrom < locker.period; lockingPeriodToRedeemFrom) {
            Locking storage locking = lockings[lockingPeriodToRedeemFrom];
            uint256 score = locking.scores[_beneficiary];
            require(score > 0, "locking score should be > 0");
            locking.scores[_beneficiary] = 0;
            uint256 lockingPeriodReputationReward = repRewardConstA.mul(repRewardConstB.pow(lockingPeriodToRedeemFrom));
            uint256 repRelation = score.mul(lockingPeriodReputationReward);
            reputation = reputation.add(repRelation.div(locking.totalScore));
        }
        // check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(
        ControllerInterface(avatar.owner())
        .mintReputation(reputation, _beneficiary, address(avatar)), "mint reputation should succeed");
        emit Redeem(_lockingId, _beneficiary, reputation);
    }

    /**
     * @dev lock function
     * @param _amount the amount to bid with
     * @param _period the period to lock. in lockingPeriodsUnit.
     * @param _lockingPeriodToLockIn the locking id to lock at .
     * @return lockingId
     */
    function lock(uint256 _amount, uint256 _period ,uint256 _lockingPeriodToLockIn, bytes32 _agreementHash)
    public
    onlyAgree(_agreementHash)
    returns(bytes32 lockingId)
    {
        require(_amount > 0, "bidding amount should be > 0");
        // solhint-disable-next-line not-rely-on-time
        require(now >= lockingStartTime, "bidding is enable only after bidding lockingStartTime");
        require(_period <= maxLockingPeriod, "locking period exceed the maximum allowed");
        require(_period > 0, "locking period equal to zero");
        address(token).safeTransferFrom(msg.sender, address(this), _amount);
        // solhint-disable-next-line not-rely-on-time
        uint256 lockingPeriodToLockIn = (now - lockingStartTime) / lockingPeriodsUnit;
        require(lockingPeriodToLockIn == _lockingPeriodToLockIn, "locking is not active");
        uint256 i = 0;
        //fill in the next lockings scores.
        //todo : check limitation of _period and require that on the init function.
        for (lockingPeriodToLockIn; lockingPeriodToLockIn < lockingPeriodToLockIn+_period; lockingPeriodToLockIn++) {
            Locking storage locking = lockings[lockingPeriodToLockIn];
            uint256 score = (_period - i) * _amount;
            i = i + 1;
            locking.totalScore = locking.totalScore.add(score);
            locking.scores[msg.sender] = score;
        }

        lockingId = keccak256(abi.encodePacked(address(this), lockingsCounter));
        lockingsCounter = lockingsCounter.add(1);

        Locker storage locker = lockers[msg.sender][lockingId];
        locker.amount = _amount;
        locker.period = _period;
        // solhint-disable-next-line not-rely-on-time
        locker.lockingTime = now;

        totalLockedLeft = totalLockedLeft.add(_amount);

        emit Lock(msg.sender, lockingId, _amount, _period);
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function release(address _beneficiary, bytes32 _lockingId) public returns(uint256 amount) {
        Locker storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0, "amount should be > 0");
        amount = locker.amount;
        locker.amount = 0;
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp > locker.lockingTime + (locker.period*lockingPeriodsUnit),
        "check the lock period pass");
        totalLockedLeft = totalLockedLeft.sub(amount);
        address(token).safeTransfer(_beneficiary, amount);
        emit Release(_lockingId, _beneficiary, amount);
    }

}
