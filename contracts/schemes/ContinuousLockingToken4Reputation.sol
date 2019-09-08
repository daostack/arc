pragma solidity ^0.5.11;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "../controller/ControllerInterface.sol";
import "../libs/SafeERC20.sol";
import "./Agreement.sol";
import { RealMath } from "@daostack/infra/contracts/libs/RealMath.sol";

/**
 * @title A scheme for continuous locking ERC20 Token for reputation
 */

contract ContinuousLocking4Reputation is Agreement {
    using SafeMath for uint256;
    using SafeERC20 for address;
    using RealMath for uint216;
    using RealMath for uint256;
    using Math for uint256;

    event Redeem(bytes32 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event Release(bytes32 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event LockToken(address indexed _locker, bytes32 indexed _lockingId, uint256 _amount, uint256 _period);
    event ExtendLocking(address indexed _locker, bytes32 indexed _lockingId, uint256 _extendPeriod);

    struct Batch {
        uint256 totalScore;
        // A mapping from locker addresses to their locking score.
        mapping(address=>uint256) scores;
    }

    struct Lock {
        uint256 amount;
        uint256 lockingTime;
        uint256 period;
    }

    // A mapping from lockers addresses their lock balances.
    mapping(address => mapping(bytes32=>Lock)) public lockers;
    // A mapping from locking index to locking.
    mapping(uint256=>Batch) public batches;

    Avatar public avatar;
    uint256 public reputationRewardLeft;
    uint256 public startTime;
    uint256 public numberOfLockingPeriods;
    uint256 public redeemEnableTime;
    uint256 public maxLockingBatches;
    uint256 public periodsUnit;
    IERC20 public token;
    uint256 public batchesCounter; // Total number of batches
    uint256 public totalLockedLeft;
    uint256 public repRewardConstA;
    uint256 public repRewardConstB;
    uint256 public periodsCap;

    uint256 constant private REAL_FBITS = 40;
    /**
     * What's the first non-fractional bit
     */

    uint256 constant private REAL_ONE = uint256(1) << REAL_FBITS;
    uint256 constant private PERIODS_HARDCAP = 100;
    uint256 constant public MAX_LOCKING_BATCHES_HARDCAP = 24;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the reputation reward per auction this contract will reward
     *        for the token locking
     * @param _startTime auctions period start time
     * @param _periodsUnit locking periods units (e.g 30 days).
     * @param _redeemEnableTime redeem enable time .
     *        redeem reputation can be done after this time.
     * @param _maxLockingBatches - maximum number of locking periods (in _periodsUnit units)
     * @param _repRewardConstA - reputation allocation per period is calculated by :
     *   _repRewardConstA * (_repRewardConstB ** periodNumber)
     * @param _repRewardConstB - reputation allocation per period is calculated by :
     *   _repRewardConstA * (_repRewardConstB ** periodNumber)
     * @param _periodsCap  the max periods number to allow to lock in . this value capped by PERIODS_HARDCAP
     * @param _token the locking token
     * @param _agreementHash is a hash of agreement required to be added to the TX by participants
     */
    function initialize(
        Avatar _avatar,
        uint256 _reputationReward,
        uint256 _startTime,
        uint256 _periodsUnit,
        uint256 _redeemEnableTime,
        uint256 _maxLockingBatches,
        uint256 _repRewardConstA,
        uint256 _repRewardConstB,
        uint256 _periodsCap,
        IERC20 _token,
        bytes32 _agreementHash )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        //_periodsUnit should be greater than block interval
        require(_periodsUnit > 15, "lockingPeriod should be > 15");
        require(_maxLockingBatches <= MAX_LOCKING_BATCHES_HARDCAP,
        "maxLockingBatches should be <= MAX_LOCKING_BATCHES_HARDCAP");
        require(_redeemEnableTime >= _startTime+_periodsUnit,
        "_redeemEnableTime >= _startTime+_periodsUnit");
        require(_periodsCap <= PERIODS_HARDCAP, "_periodsCap > PERIODS_HARDCAP");
        token = _token;
        avatar = _avatar;
        startTime = _startTime;
        reputationRewardLeft = _reputationReward;
        redeemEnableTime = _redeemEnableTime;
        maxLockingBatches = _maxLockingBatches;
        periodsUnit = _periodsUnit;
        require(_repRewardConstB < 1000, "_repRewardConstB should be < 1000");
        require(repRewardConstA < _reputationReward, "repRewardConstA should be < _reputationReward");
        repRewardConstA = toReal(uint216(_repRewardConstA));
        repRewardConstB = uint216(_repRewardConstB).fraction(uint216(1000));
        periodsCap = _periodsCap;
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
        Lock storage locker = lockers[_beneficiary][_lockingId];
        uint256 periodToRedeemFrom = (locker.lockingTime - startTime) / periodsUnit;
        // solhint-disable-next-line not-rely-on-time
        uint256 currentLockingPeriod = (now - startTime) / periodsUnit;
        uint256 lastLockingPeriodToRedeem =  currentLockingPeriod.min(periodToRedeemFrom + locker.period);
        for (periodToRedeemFrom; periodToRedeemFrom < lastLockingPeriodToRedeem; periodToRedeemFrom++) {
            Batch storage locking = batches[periodToRedeemFrom];
            uint256 score = locking.scores[_beneficiary];
            if (score > 0) {
                locking.scores[_beneficiary] = 0;
                uint256 lockingPeriodReputationReward = repRewardPerPeriod(periodToRedeemFrom);
                uint256 repRelation = mul(toReal(uint216(score)), lockingPeriodReputationReward);
                reputation = reputation.add(div(repRelation, toReal(uint216(locking.totalScore))));
            }
        }
        reputation = uint256(fromReal(reputation));
        require(reputation > 0, "reputation to redeem is 0");
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
     * @param _period the period to lock. in periodsUnit.
     * @param _lockingPeriodToLockIn the locking id to lock at .
     * @return lockingId
     */
    function lock(uint256 _amount, uint256 _period, uint256 _lockingPeriodToLockIn, bytes32 _agreementHash)
    public
    onlyAgree(_agreementHash)
    returns(bytes32 lockingId)
    {
        require(_amount > 0, "locking amount should be > 0");
        // solhint-disable-next-line not-rely-on-time
        require(now >= startTime, "locking is enable only after locking startTime");
        require(_period <= maxLockingBatches, "locking period exceed the maximum allowed");
        require(_period > 0, "locking period equal to zero");
        require((_lockingPeriodToLockIn + _period) <= periodsCap, "exceed max allowed periods");
        address(token).safeTransferFrom(msg.sender, address(this), _amount);
        // solhint-disable-next-line not-rely-on-time
        uint256 lockingPeriodToLockIn = (now - startTime) / periodsUnit;
        require(lockingPeriodToLockIn == _lockingPeriodToLockIn, "locking is not active");
        uint256 j = _period;
        //fill in the next batche scores.
        for (int256 i = int256(lockingPeriodToLockIn + _period - 1); i >= int256(lockingPeriodToLockIn); i--) {
            Batch storage locking = batches[uint256(i)];
            uint256 score = (_period - j + 1) * _amount;
            j--;
            locking.totalScore = locking.totalScore.add(score);
            locking.scores[msg.sender] = score;
        }

        lockingId = keccak256(abi.encodePacked(address(this), batchesCounter));
        batchesCounter = batchesCounter.add(1);

        Lock storage locker = lockers[msg.sender][lockingId];
        locker.amount = _amount;
        locker.period = _period;
        // solhint-disable-next-line not-rely-on-time
        locker.lockingTime = now;
        totalLockedLeft = totalLockedLeft.add(_amount);
        emit LockToken(msg.sender, lockingId, _amount, _period);
    }

    /**
     * @dev extendLocking function
     * @param _extendPeriod the period to extend the locking. in periodsUnit.
     * @param _lockingPeriodToLockIn the locking id to lock at .
     * @param _lockingId the locking id to extend
     */
    function extendLocking(
        uint256 _extendPeriod,
        uint256 _lockingPeriodToLockIn,
        bytes32 _lockingId,
        bytes32 _agreementHash)
    public
    onlyAgree(_agreementHash)
    {
        Lock storage locker = lockers[msg.sender][_lockingId];
        require(locker.lockingTime != 0, "wrong locking id");
        uint256 lockingPeriodRemain =
        ((locker.lockingTime + (locker.period*periodsUnit) - startTime)/periodsUnit).sub(_lockingPeriodToLockIn);
        uint256 extendPeriodsFromNow = lockingPeriodRemain + _extendPeriod;
        require(extendPeriodsFromNow <= maxLockingBatches, "locking period exceed the maximum allowed");
        require(_extendPeriod > 0, "extend locking period equal to zero");
        require((_lockingPeriodToLockIn + extendPeriodsFromNow) <= periodsCap,
        "exceed max allowed periods");
        // solhint-disable-next-line not-rely-on-time
        uint256 lockingPeriodToLockIn = (now - startTime) / periodsUnit;
        require(lockingPeriodToLockIn == _lockingPeriodToLockIn, "locking is not active");
        uint256 j = extendPeriodsFromNow;
        //fill in the next batche scores.
        for (int256 i = int256(lockingPeriodToLockIn + extendPeriodsFromNow - 1);
            i >= int256(lockingPeriodToLockIn);
            i--) {
                Batch storage locking = batches[uint256(i)];
                uint256 score = (extendPeriodsFromNow - j + 1) * locker.amount;
                j--;
                locking.totalScore = locking.totalScore.add(score).sub(locking.scores[msg.sender]);
                locking.scores[msg.sender] = score;
            }
        locker.period = locker.period + _extendPeriod;
        emit ExtendLocking(msg.sender, _lockingId, _extendPeriod);
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function release(address _beneficiary, bytes32 _lockingId) public returns(uint256 amount) {
        Lock storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0, "amount should be > 0");
        amount = locker.amount;
        locker.amount = 0;
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp > locker.lockingTime + (locker.period*periodsUnit),
        "check the lock period pass");
        totalLockedLeft = totalLockedLeft.sub(amount);
        address(token).safeTransfer(_beneficiary, amount);
        emit Release(_lockingId, _beneficiary, amount);
    }

    /**
     * @dev repRewardPerPeriod function
     * the calculation is done the following formula:
     * RepReward =  repRewardConstA * (repRewardConstB**_periodNumber)
     * @param _periodNumber the period number to calc rep reward of
     * @return repReward
     */
    function repRewardPerPeriod(uint256  _periodNumber) public view returns(uint256 repReward) {
        if (_periodNumber <= periodsCap) {
            repReward = mul(repRewardConstA, repRewardConstB.pow(_periodNumber));
        }
    }

    /**
     * Multiply one real by another. Truncates overflows.
     */
    function mul(uint256 realA, uint256 realB) private pure returns (uint256) {
        // When multiplying fixed point in x.y and z.w formats we get (x+z).(y+w) format.
        // So we just have to clip off the extra REAL_FBITS fractional bits.
        uint256 res = realA * realB;
        require(res/realA == realB, "RealMath mul overflow");
        return (res >> REAL_FBITS);
    }

    /**
     * Convert an integer to a real. Preserves sign.
     */
    function toReal(uint216 ipart) private pure returns (uint256) {
        return uint256(ipart) * REAL_ONE;
    }

    /**
     * Convert a real to an integer. Preserves sign.
     */
    function fromReal(uint256 _realValue) private pure returns (uint216) {
        return uint216(_realValue / REAL_ONE);
    }

    /**
     * Divide one real by another real. Truncates overflows.
     */
    function div(uint256 realNumerator, uint256 realDenominator) private pure returns (uint256) {
        // We use the reverse of the multiplication trick: convert numerator from
        // x.y to (x+z).(y+w) fixed point, then divide by denom in z.w fixed point.
        return uint256((uint256(realNumerator) * REAL_ONE) / uint256(realDenominator));
    }

}
