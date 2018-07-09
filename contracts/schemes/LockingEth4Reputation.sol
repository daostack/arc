pragma solidity ^0.4.24;

import "../VotingMachines/IntVoteInterface.sol";
import "../controller/ControllerInterface.sol";
import { RealMath } from "../libs/RealMath.sol";


/**
 * @title A scheme for locking ETH for reputation
 */

contract LockingEth4Reputation {
    using SafeMath for uint;
    using RealMath for int216;
    using RealMath for int256;

    event Redeem(bytes32 indexed _lockingId, address indexed _beneficiary,uint _amount);
    event Release(bytes32 indexed _lockingId, address indexed _beneficiary,uint _amount);
    event Lock(bytes32 indexed _lockingId,uint _amount,uint _period,address _locker);

    struct Locker {
        uint amount;
        uint releaseTime;
    }

    Avatar public avatar;

    // A mapping from lockers addresses their lock balances.
    mapping(address=>mapping(bytes32=>Locker)) public lockers;
    // A mapping from lockers addresses to their scores.
    mapping(address=>uint) public scores;

    uint public totalLocked;
    uint public totalLockedLeft;
    uint public totalScore;
    uint public lockingsCounter; // Total number of lockings
    uint public reputationReward;
    uint public reputationRewardLeft;
    uint public lockingEndTime;
    uint public maxLockingPeriod;

    /**
     * @dev constructor
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for eth locking
     * @param _lockingEndTime the locking end time.
     *        redeem reputation can be done after this period.
     *        locking is disable after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     */
    constructor(Avatar _avatar,uint _reputationReward,uint _lockingEndTime,uint _maxLockingPeriod) public
    {
        reputationReward = _reputationReward;
        reputationRewardLeft = reputationReward;
        lockingEndTime = _lockingEndTime;
        maxLockingPeriod = _maxLockingPeriod;
        avatar = _avatar;
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function release(address _beneficiary,bytes32 _lockingId) public returns(bool) {
        Locker storage locker = lockers[_beneficiary][_lockingId];
        require(locker.amount > 0,"amount should be > 0");
        uint amount = locker.amount;
        locker.amount = 0;
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= locker.releaseTime,"check the lock period pass");
        _beneficiary.transfer(amount);
        totalLockedLeft = totalLockedLeft.sub(amount);
        emit Release(_lockingId,_beneficiary,amount);
        return true;
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function redeem(address _beneficiary,bytes32 _lockingId) public returns(bool) {
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= lockingEndTime,"check the lock period pass");
        require(scores[_beneficiary] > 0,"score should be > 0");
        uint score = scores[_beneficiary];
        scores[_beneficiary] = 0;
        int256 repRelation = int216(score).toReal().mul(int216(reputationReward).toReal());
        uint reputation = uint256(repRelation.div(int216(totalScore).toReal()).fromReal());
        require(ControllerInterface(avatar.owner()).mintReputation(reputation,_beneficiary,avatar));
        //check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        emit Redeem(_lockingId,_beneficiary,reputation);
        return true;
    }

    /**
     * @dev locking function
     * @return lockingId the unique Id
     */
    function lock(uint _period) public payable returns(bytes32 lockingId) {

        require(msg.value > 0,"locking amount should be > 0");
        require(_period <= maxLockingPeriod,"locking period should be <= maxLockingPeriod");
        require(_period > 0,"locking period should be > 0");
        // solium-disable-next-line security/no-block-members
        require(now <= lockingEndTime,"lock should be within the allowed locking period");

        lockingId = keccak256(abi.encodePacked(this, lockingsCounter));
        lockingsCounter++;

        Locker storage locker = lockers[msg.sender][lockingId];
        locker.amount = msg.value;
        // solium-disable-next-line security/no-block-members
        locker.releaseTime = now + _period;
        totalLocked += msg.value;
        totalLockedLeft = totalLocked;
        scores[msg.sender] = scores[msg.sender].add(_period.mul(msg.value));
        totalScore = totalScore.add(scores[msg.sender]);
        emit Lock(lockingId,msg.value,_period,msg.sender);
    }

}
