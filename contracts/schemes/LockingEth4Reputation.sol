pragma solidity ^0.4.24;

import "./Locking4Reputation.sol";


/**
 * @title A scheme for locking ETH for reputation
 */

contract LockingEth4Reputation is Locking4Reputation {

    /**
     * @dev constructor
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for eth locking
     * @param _lockingStartTime locking starting period time.
     * @param _lockingEndTime the locking end time.
     *        redeem reputation can be done after this period.
     *        locking is disable after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     */
    constructor(Avatar _avatar,
                uint _reputationReward,
                uint _lockingStartTime,
                uint _lockingEndTime,
                uint _maxLockingPeriod)
    Locking4Reputation(_avatar,
                      _reputationReward,
                      _lockingStartTime,
                      _lockingEndTime,
                      _maxLockingPeriod)
    public
    {}

    /**
     * @dev release locked eth
     * @param _beneficiary the release _beneficiary
     * @param _lockingId the locking id
     * @return bool
     */
    function release(address _beneficiary, bytes32 _lockingId) public returns(bool) {
        uint amount = super._release(_beneficiary,_lockingId);
        _beneficiary.transfer(amount);
        return true;
    }

    /**
     * @dev lock function
     * @param _period the locking period
     * @return lockingId the unique Id
     */
    function lock(uint _period) public payable returns(bytes32 lockingId) {
        return super._lock(msg.value, _period, msg.sender);
    }

}
