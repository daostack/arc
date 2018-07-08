pragma solidity ^0.4.24;

import "../VotingMachines/IntVoteInterface.sol";
import "./UniversalScheme.sol";
import { RealMath } from "../libs/RealMath.sol";


/**
 * @title A scheme for locking ETH for reputation
 */

contract LockingEthForReputation is UniversalScheme {
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
    uint public lockingsCnt; // Total number of locking
    uint public repAllocation;
    uint public repAllocationLeft;
    uint public lockingEndTime;
    uint public maxLockingPeriod;

    constructor(Avatar _avatar,uint _repAllocation,uint _lockingEndTime,uint _maxLockingPeriod) public
    {
        repAllocation = _repAllocation;
        repAllocationLeft = repAllocation;
        lockingEndTime = _lockingEndTime;
        maxLockingPeriod = _maxLockingPeriod;
        avatar = _avatar;
    }

    /**
    * @dev enables an locking ethers
    */
    function() public payable {
        _lock();
    }

    /**
     * @dev locking function
     * @return lockingId
     */
    function lock() external payable returns(bytes32) {
        return _lock();
    }

    /**
     * @dev release function
     * @param _beneficiary the beneficiary for the release
     * @param _lockingId the locking id to release
     * @return bool
     */
    function release(address _beneficiary,bytes32 _lockingId) public returns(bool) {
        Locker memory locker = lockers[_beneficiary][_lockingId];
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= locker.releaseTime,"check the lock period pass");
        _beneficiary.transfer(locker.amount);
        totalLockedLeft = totalLockedLeft.sub(locker.amount);
        emit Release(_lockingId,_beneficiary,locker.amount);
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
        int216 repRelation = int216(scores[_beneficiary]).toReal().mul(int216(repAllocation).toReal());
        uint reputation = uint256(repRelation.div(int216(totalScore).toReal()).fromReal());
        require(ControllerInterface(avatar.owner()).mintReputation(reputation,_beneficiary,avatar));
        //check that the reputation is sum zero
        repAllocationLeft = repAllocationLeft.sub(reputation);
        emit Redeem(_lockingId,_beneficiary,reputation);
        return true;
    }

    /**
     * @dev locking function
     * @return lockingId the unique Id
     */
    function _lock() internal returns(bytes32 lockingId) {
        uint256 period;
        for (uint i = 0;i<msg.data.length;i++) {
            period = period + uint(msg.data[i])*(2**(8*(msg.data.length-(i+1))));
        }

        require(msg.value > 0,"locking amount should be > 0");
        require(period <= maxLockingPeriod,"locking period should be <= maxLockingPeriod");
        // solium-disable-next-line security/no-block-members
        require(now <= lockingEndTime,"lock should be within the allowed locking period");

        lockingId = keccak256(abi.encodePacked(this, lockingsCnt));
        lockingsCnt++;

        Locker storage locker = lockers[msg.sender][lockingId];
        locker.amount = msg.value;
        // solium-disable-next-line security/no-block-members
        locker.releaseTime = now + period;
        totalLocked += msg.value;
        totalLockedLeft = totalLocked;
        scores[msg.sender] = scores[msg.sender].add(period.mul(msg.value));
        totalScore = totalScore.add(scores[msg.sender]);
      // Event:
        emit Lock(lockingId,msg.value,period,msg.sender);
    }

}
