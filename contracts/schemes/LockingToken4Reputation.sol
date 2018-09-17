pragma solidity ^0.4.24;

import "./Locking4Reputation.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title A scheme for locking ERC20 Tokens for reputation
 */

contract LockingToken4Reputation is Locking4Reputation,Ownable {

    StandardToken public token;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for the token locking
     * @param _lockingStartTime locking starting period time.
     * @param _lockingEndTime the locking end time.
     *        redeem reputation can be done after this period.
     *        locking is disable after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     * @param _token the locking token
     */
    function initialize(
        Avatar _avatar,
        uint _reputationReward,
        uint _lockingStartTime,
        uint _lockingEndTime,
        uint _maxLockingPeriod,
        StandardToken _token)
    external
    onlyOwner
    {
        token = _token;
        super._initialize(
        _avatar,
        _reputationReward,
        _lockingStartTime,
        _lockingEndTime,
        _maxLockingPeriod);
    }

    /**
     * @dev release locked tokens
     * @param _beneficiary the release _beneficiary
     * @param _lockingId the locking id
     * @return bool
     */
    function release(address _beneficiary,bytes32 _lockingId) public returns(bool) {
        uint amount = super._release(_beneficiary,_lockingId);
        require(token.transfer(_beneficiary,amount),"transfer should success");
        return true;
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
     * @return lockingId
     */
    function lock(uint _amount, uint _period) public returns(bytes32) {
        require(token.transferFrom(msg.sender,address(this),_amount),"transferFrom should success");
        return super._lock(_amount,_period,msg.sender);
    }

}
