pragma solidity ^0.5.2;

import "./Locking4Reputation.sol";
import "./PriceOracleInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../libs/SafeERC20.sol";


/**
 * @title A scheme for locking ERC20 Tokens for reputation
 */

contract LockingToken4Reputation is Locking4Reputation, Ownable {
    using SafeERC20 for address;

    PriceOracleInterface public priceOracleContract;
    //      lockingId => token
    mapping(bytes32   => address) public lockedTokens;

    event LockToken(bytes32 indexed _lockingId, address indexed _token, uint256 _numerator, uint256 _denominator);

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for the token locking
     * @param _lockingStartTime locking starting period time.
     * @param _lockingEndTime the locking end time.
     *        locking is disable after this time.
     * @param _redeemEnableTime redeem enable time .
     *        redeem reputation can be done after this time.
     * @param _maxLockingPeriod maximum locking period allowed.
     * @param _priceOracleContract the price oracle contract which the locked token will be
     *        validated against
     */
    function initialize(
        Avatar _avatar,
        uint256 _reputationReward,
        uint256 _lockingStartTime,
        uint256 _lockingEndTime,
        uint256 _redeemEnableTime,
        uint256 _maxLockingPeriod,
        PriceOracleInterface _priceOracleContract)
    external
    onlyOwner
    {
        priceOracleContract = _priceOracleContract;
        super._initialize(
        _avatar,
        _reputationReward,
        _lockingStartTime,
        _lockingEndTime,
        _redeemEnableTime,
        _maxLockingPeriod);
    }

    /**
     * @dev release locked tokens
     * @param _beneficiary the release _beneficiary
     * @param _lockingId the locking id
     * @return bool
     */
    function release(address _beneficiary, bytes32 _lockingId) public returns(bool) {
        uint256 amount = super._release(_beneficiary, _lockingId);
        lockedTokens[_lockingId].safeTransfer(_beneficiary, amount);

        return true;
    }

    /**
     * @dev lock function
     * @param _amount the amount to lock
     * @param _period the locking period
     * @param _token the token to lock - this should be whitelisted at the priceOracleContract
     * @return lockingId
     */
    function lock(uint256 _amount, uint256 _period, address _token) public returns(bytes32 lockingId) {

        uint256 numerator;
        uint256 denominator;

        (numerator, denominator) = priceOracleContract.getPrice(_token);

        require(numerator > 0, "numerator should be > 0");
        require(denominator > 0, "denominator should be > 0");

        _token.safeTransferFrom(msg.sender, address(this), _amount);

        lockingId = super._lock(_amount, _period, msg.sender, numerator, denominator);

        lockedTokens[lockingId] = _token;

        emit LockToken(lockingId, _token, numerator, denominator);
    }
}
