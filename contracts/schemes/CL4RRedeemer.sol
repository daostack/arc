pragma solidity ^0.6.12;
// SPDX-License-Identifier: GPL-3.0

import "./ContinuousLocking4Reputation.sol";

/**
 * @title A scheme for redeeming a ContinuousLocking4Reputation contract used in a different DAO.
 * This is used to migrate from an older DAO to a new one while the older DAO has an active ContinuousLocking4Reputation
 * Using it should be done by initiaalizing this contract s a scheme in the new DAO,
 * with the old ContinuousLocking4Reputation as an init parameter.
 * Then the old ContinuousLocking4Reputation should be unregistered as a scheme from the older DAO so
 * that redeeming is done only through this scheme into the new DAO.
 */
contract CL4RRedeemer is ArcScheme {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using RealMath for uint216;
    using RealMath for uint256;
    using Math for uint256;

    event Redeem(uint256 indexed _lockingId, address indexed _beneficiary, uint256 _amount, uint256 _batchIndex);

    struct Batch {
        uint256 totalScore;
        // A mapping from lockingId to its score
        mapping(uint256=>uint) scores;
        mapping(uint256=>uint) redeemedScores;
    }

    struct Lock {
        uint256 amount;
        uint256 lockingTime;
        uint256 period;
    }

    // A mapping from batch index to batch
    mapping(uint256 => Batch) public batches;

    uint256 public reputationRewardLeft; // the amount of reputation that is still left to distribute
    uint256 public startTime; // the time (in secs since epoch) that locking can start (is enable)
    uint256 public redeemEnableTime;
    uint256 public batchTime; // the length of a batch, in seconds
    ContinuousLocking4Reputation public cl4r;

    uint256 constant private REAL_FBITS = 40;
    // What's the first non-fractional bit
    uint256 constant private REAL_ONE = uint256(1) << REAL_FBITS;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _cl4r the ContinuousLocking4Reputation address
     */
    function initialize(Avatar _avatar, ContinuousLocking4Reputation _cl4r) external {
        super._initialize(_avatar);
        require(address(_cl4r) != address(0), "ContinuousLocking4Reputation reference contract must be specified");
        cl4r = _cl4r;
        startTime = _cl4r.startTime();
        reputationRewardLeft = _cl4r.reputationRewardLeft();
        redeemEnableTime = _cl4r.redeemEnableTime();
        batchTime = _cl4r.batchTime();
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary to redeem.
     * @param _lockingId the lockingId to redeem from.
     * @return reputation reputation rewarded
     */
    function redeem(address _beneficiary, uint256 _lockingId) public returns(uint256 reputation) {

        // solhint-disable-next-line not-rely-on-time
        require(now > redeemEnableTime, "now > redeemEnableTime");
        Lock memory locker = Lock(0, 0, 0);
        (locker.amount, locker.lockingTime, locker.period) = cl4r.lockers(_beneficiary, _lockingId);

        require(locker.lockingTime != 0, "_lockingId does not exist");
        uint256 batchIndexToRedeemFrom = (locker.lockingTime - startTime) / batchTime;
        // solhint-disable-next-line not-rely-on-time
        uint256 currentBatch = (now - startTime) / batchTime;
        uint256 lastBatchIndexToRedeem =  currentBatch.min(batchIndexToRedeemFrom.add(locker.period));
        for (batchIndexToRedeemFrom; batchIndexToRedeemFrom < lastBatchIndexToRedeem; batchIndexToRedeemFrom++) {
            if (batches[batchIndexToRedeemFrom].scores[_lockingId] == 0) {
                batches[batchIndexToRedeemFrom].totalScore = cl4r.batches(batchIndexToRedeemFrom);
                batches[batchIndexToRedeemFrom].scores[_lockingId] = cl4r.getLockingIdScore(
                    batchIndexToRedeemFrom, _lockingId
                ) - batches[batchIndexToRedeemFrom].redeemedScores[_lockingId];
                batches[
                    batchIndexToRedeemFrom
                ].redeemedScores[_lockingId] += batches[batchIndexToRedeemFrom].scores[_lockingId];
            }
            Batch storage locking = batches[batchIndexToRedeemFrom];
            uint256 score = locking.scores[_lockingId];
            if (score > 0) {
                locking.scores[_lockingId] = 0;
                uint256 batchReputationReward = cl4r.getRepRewardPerBatch(batchIndexToRedeemFrom);
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
        Controller(avatar.owner())
        .mintReputation(reputation, _beneficiary), "mint reputation should succeed");
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
