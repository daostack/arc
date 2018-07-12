pragma solidity ^0.4.24;

import "./Locking4Reputation.sol";


/**
 * @title A scheme for external locking Tokens for reputation
 */

contract ExternalLocking4Reputation is Locking4Reputation {

    address public externalLockingContract;
    string public getBalanceFuncSignature;

    // locker->bool
    mapping(address=>bool) public externalLockers;

    /**
     * @dev constructor
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for the token locking
     * @param _lockingStartTime locking starting period time.
     * @param _lockingEndTime the locking end time.
     *        redeem reputation can be done after this period.
     *        locking is disable after this time.
     * @param _externalLockingContract the contract which lock the token.
     * @param _getBalanceFuncSignature get balance function signature
     *        e.g "lockedTokenBalances(address)"
     */
    constructor(Avatar _avatar,
                 uint _reputationReward,
                 uint _lockingStartTime,
                 uint _lockingEndTime,
                 address _externalLockingContract,
                 string _getBalanceFuncSignature)
    Locking4Reputation(_avatar,
                       _reputationReward,
                       _lockingStartTime,
                       _lockingEndTime,
                       1)
    public
    {
        require(_lockingEndTime > _lockingStartTime,"_lockingEndTime should be greater than _lockingStartTime");
        externalLockingContract = _externalLockingContract;
        getBalanceFuncSignature = _getBalanceFuncSignature;
    }

    /**
     * @dev lock function
     * @return lockingId
     */
    function lock() public returns(bytes32) {
        require(externalLockers[msg.sender] == false,"locking twice is not allowed");
        externalLockers[msg.sender] = true;
        // solium-disable-next-line security/no-low-level-calls
        bool result = externalLockingContract.call(abi.encodeWithSignature(getBalanceFuncSignature,msg.sender));
        uint lockedAmount;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
          returndatacopy(0, 0, returndatasize)
          switch result
          // call returns 0 on error.
          case 0 { revert(0, returndatasize) }
          default { lockedAmount := mload(0) }
        }
        return super._lock(lockedAmount,1,msg.sender);
    }
}
