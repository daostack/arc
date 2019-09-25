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

    event Redeem(uint256 indexed _lockingId, address indexed _beneficiary, uint256 _amount, uint256 _batchIndex);
    event Release(uint256 indexed _lockingId, address indexed _beneficiary, uint256 _amount);
    event LockToken(address indexed _locker, uint256 indexed _lockingId, uint256 _amount, uint256 _period);
    event ExtendLocking(address indexed _locker, uint256 indexed _lockingId, uint256 _extendPeriod);

    struct Batch {
        uint256 totalScore;
        // A mapping from lockingId to its score
        mapping(uint256=>uint) scores;
    }

    struct Lock {
        uint256 amount;
        uint256 lockingTime;
        uint256 period;
    }

    // A mapping from lockers addresses to their locks
    mapping(address => mapping(uint256=>Lock)) public lockers;
    // A mapping from batch index to batch
    mapping(uint256 => Batch) public batches;

    Avatar public avatar;
    uint256 public reputationRewardLeft; // the amount of reputation that is still left to distribute
    uint256 public startTime; // the time (in secs since epoch) that locking can start (is enable)
    uint256 public redeemEnableTime;
    uint256 public maxLockingBatches;
    uint256 public batchTime; // the length of a batch, in seconds
    IERC20 public token; // the token to be locked
    uint256 public lockCounter; // Total number of locks
    uint256 public totalLockedLeft; // the amount of reputation  that is still left to distribute
    uint256 public repRewardConstA;
    uint256 public repRewardConstB;
    uint256 public batchesIndexCap;

    uint256 constant private REAL_FBITS = 40;
    /**
     * What's the first non-fractional bit
     */

    uint256 constant private REAL_ONE = uint256(1) << REAL_FBITS;
    uint256 constant private BATCHES_INDEX_HARDCAP = 100;
    uint256 constant public MAX_LOCKING_BATCHES_HARDCAP = 24;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total amount of reputation that can be minted by this contract
     * @param _startTime locking period start time, in seconds since epoch
     * @param _redeemEnableTime redeem enable time
     * @param _batchTime batch time (in seconds)
     * @param _redeemEnableTime redeem enable time, in seconds since epoch
     *        redeem reputation can be done after this time.
     * @param _maxLockingBatches - maximum number of locking batches that a user can lock (or extend) her tokens for
     * @param _repRewardConstA - the total amount of reputation allocation per batch is calculated by :
     *   _repRewardConstA * ((_repRewardConstB/1000) ** batchIndex)
     * @param _repRewardConstB - the total amount of reputation allocation per batch is calculated by :
     *   _repRewardConstA * ((_repRewardConstB/1000) ** batchIndex). _repRewardConstB must be < 1000
     * @param _batchesIndexCap the length of the locking period (in batches).
     *        This value capped by BATCHES_HARDCAP .
     * @param _token the locking token
     * @param _agreementHash is a hash of agreement required to be added to the TX by participants
     */
    function initialize(
        Avatar _avatar,
        uint256 _reputationReward,
        uint256 _startTime,
        uint256 _batchTime,
        uint256 _redeemEnableTime,
        uint256 _maxLockingBatches,
        uint256 _repRewardConstA,
        uint256 _repRewardConstB,
        uint256 _batchesIndexCap,
        IERC20 _token,
        bytes32 _agreementHash )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        // _batchTime should be greater than block interval
        require(_batchTime > 15, "batchTime should be > 15");
        require(_maxLockingBatches <= MAX_LOCKING_BATCHES_HARDCAP,
        "maxLockingBatches should be <= MAX_LOCKING_BATCHES_HARDCAP");
        require(_redeemEnableTime >= _startTime.add(_batchTime),
        "_redeemEnableTime >= _startTime+_batchTime");
        require(_batchesIndexCap <= BATCHES_INDEX_HARDCAP, "_batchesIndexCap > BATCHES_INDEX_HARDCAP");
        token = _token;
        avatar = _avatar;
        startTime = _startTime;
        reputationRewardLeft = _reputationReward;
        redeemEnableTime = _redeemEnableTime;
        maxLockingBatches = _maxLockingBatches;
        batchTime = _batchTime;
        require(_repRewardConstB < 1000, "_repRewardConstB should be < 1000");
        require(repRewardConstA < _reputationReward, "repRewardConstA should be < _reputationReward");
        repRewardConstA = toReal(uint216(_repRewardConstA));
        repRewardConstB = uint216(_repRewardConstB).fraction(uint216(1000));
        batchesIndexCap = _batchesIndexCap;
        super.setAgreementHash(_agreementHash);
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary to redeem.
     * @param _lockingId the lockingId to redeem from.
     * @return uint256 reputation rewarded
     */
    function redeem(address _beneficiary, uint256 _lockingId) public returns(uint256 reputation) {
        // solhint-disable-next-line not-rely-on-time
        require(now > redeemEnableTime, "now > redeemEnableTime");
        Lock storage locker = lockers[_beneficiary][_lockingId];
        require(locker.lockingTime != 0, "_lockingId does not exist");
        uint256 batchIndexToRedeemFrom = (locker.lockingTime - startTime) / batchTime;
        // solhint-disable-next-line not-rely-on-time
        uint256 currentBatch = (now - startTime) / batchTime;
        uint256 lastBatchIndexToRedeem =  currentBatch.min(batchIndexToRedeemFrom.add(locker.period));
        for (batchIndexToRedeemFrom; batchIndexToRedeemFrom < lastBatchIndexToRedeem; batchIndexToRedeemFrom++) {
            Batch storage locking = batches[batchIndexToRedeemFrom];
            uint256 score = locking.scores[_lockingId];
            if (score > 0) {
                locking.scores[_lockingId] = 0;
                uint256 batchReputationReward = getRepRewardPerBatch(batchIndexToRedeemFrom);
                uint256 repRelation = mul(toReal(uint216(score)), batchReputationReward);
                uint256 redeemForBatch = div(repRelation, toReal(uint216(locking.totalScore)));
                reputation = reputation.add(redeemForBatch);
                emit Redeem(_lockingId, _beneficiary, uint256(fromReal(redeemForBatch)), batchIndexToRedeemFrom);
            }
        }
        reputation = uint256(fromReal(reputation));
        require(reputation > 0, "reputation to redeem is 0");
        // check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(
        ControllerInterface(avatar.owner())
        .mintReputation(reputation, _beneficiary, address(avatar)), "mint reputation should succeed");
    }

    /**
     * @dev lock function
     * @param _amount the amount of token to lock
     * @param _period the number of batches that the tokens will be locked for
     * @param _batchIndexToLockIn the batch index in which the locking period starts.
     * Must be the currently active batch.
     * @return lockingId
     */
    function lock(uint256 _amount, uint256 _period, uint256 _batchIndexToLockIn, bytes32 _agreementHash)
    public
    onlyAgree(_agreementHash)
    returns(uint256 lockingId)
    {
        require(_amount > 0, "_amount should be > 0");
        // solhint-disable-next-line not-rely-on-time
        require(now >= startTime, "locking is not enabled yet (it starts at startTime)");
        require(_period <= maxLockingBatches, "_period exceed the maximum allowed");
        require(_period > 0, "_period must be > 0");
        require((_batchIndexToLockIn.add(_period)) <= batchesIndexCap,
        "_batchIndexToLockIn + _period exceed max allowed batches");
        lockCounter = lockCounter.add(1);
        lockingId = lockCounter;

        Lock storage locker = lockers[msg.sender][lockingId];
        locker.amount = _amount;
        locker.period = _period;
        // solhint-disable-next-line not-rely-on-time
        locker.lockingTime = now;

        address(token).safeTransferFrom(msg.sender, address(this), _amount);
        // solhint-disable-next-line not-rely-on-time
        uint256 batchIndexToLockIn = (now - startTime) / batchTime;
        require(batchIndexToLockIn == _batchIndexToLockIn,
        "_batchIndexToLockIn must be the one corresponding to the current one");
        //fill in the next batches scores.
        for (uint256 p = 0; p < _period; p++) {
            Batch storage batch = batches[batchIndexToLockIn + p];
            uint256 score = (_period - p).mul(_amount);
            batch.totalScore = batch.totalScore.add(score);
            batch.scores[lockingId] = score;
        }

        totalLockedLeft = totalLockedLeft.add(_amount);
        emit LockToken(msg.sender, lockingId, _amount, _period);
    }

    /**
     * @dev extendLocking function
     * @param _extendPeriod the period to extend the locking. in batchTime.
     * @param _batchIndexToLockIn index of the batch in which to start locking.
     * @param _lockingId the locking id to extend
     */
    function extendLocking(
        uint256 _extendPeriod,
        uint256 _batchIndexToLockIn,
        uint256 _lockingId,
        bytes32 _agreementHash)
    public
    onlyAgree(_agreementHash)
    {
        Lock storage locker = lockers[msg.sender][_lockingId];
        require(locker.lockingTime != 0, "_lockingId does not exist");
        // remainBatchs is the number of future batches that are part of the currently active lock
        uint256 remainBatches =
        ((locker.lockingTime.add(locker.period*batchTime).sub(startTime))/batchTime).sub(_batchIndexToLockIn);
        uint256 batchesCountFromCurrent = remainBatches.add(_extendPeriod);
        require(batchesCountFromCurrent <= maxLockingBatches, "locking period exceeds the maximum allowed");
        require(_extendPeriod > 0, "_extendPeriod must be > 0");
        require((_batchIndexToLockIn.add(batchesCountFromCurrent)) <= batchesIndexCap,
        "_extendPeriod exceed max allowed batches");
        // solhint-disable-next-line not-rely-on-time
        uint256 batchIndexToLockIn = (now - startTime) / batchTime;
        require(batchIndexToLockIn == _batchIndexToLockIn, "locking is not active");
        //fill in the next batch scores.
        for (uint256 p = 0; p < batchesCountFromCurrent; p++) {
            Batch storage batch = batches[batchIndexToLockIn + p];
            uint256 score = (batchesCountFromCurrent - p).mul(locker.amount);
            batch.totalScore = batch.totalScore.add(score).sub(batch.scores[_lockingId]);
            batch.scores[_lockingId] = score;
        }
        locker.period = locker.period.add(_extendPeriod);
        emit ExtendLocking(msg.sender, _lockingId, _extendPeriod);
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function release(address _beneficiary, uint256 _lockingId) public returns(uint256 amount) {
        Lock storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0, "no amount left to unlock");
        amount = locker.amount;
        locker.amount = 0;
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp > locker.lockingTime.add(locker.period*batchTime),
        "locking period is still active");
        totalLockedLeft = totalLockedLeft.sub(amount);
        address(token).safeTransfer(_beneficiary, amount);
        emit Release(_lockingId, _beneficiary, amount);
    }

    /**
     * @dev getRepRewardPerBatch function
     * the calculation is done the following formula:
     * RepReward =  repRewardConstA * (repRewardConstB**_batchIndex)
     * @param _batchIndex the index of the batch to calc rep reward of
     * @return repReward
     */
    function getRepRewardPerBatch(uint256  _batchIndex) public view returns(uint256 repReward) {
        if (_batchIndex <= batchesIndexCap) {
            repReward = mul(repRewardConstA, repRewardConstB.pow(_batchIndex));
        }
    }

    /**
     * @dev getLockingIdScore function
     * return score of lockingId at specific bach index
     * @param _batchIndex batch index
     * @param _lockingId lockingId
     * @return score
     */
    function getLockingIdScore(uint256  _batchIndex, uint256 _lockingId) public view returns(uint256) {
        return batches[_batchIndex].scores[_lockingId];
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
