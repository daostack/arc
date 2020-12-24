pragma solidity 0.5.17;

import "../schemes/ContinuousLocking4Reputation.sol";

/**
 * @title ContinuousLocking4ReputationFactory
 */
contract ContinuousLocking4ReputationFactory {

    event NewCL4R(address continuousLocking4Reputation);

    function createCL4R(
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
        bytes32 _agreementHash) public returns(address) {
        ContinuousLocking4Reputation continuousLocking4Reputation = new ContinuousLocking4Reputation();
        continuousLocking4Reputation.initialize(
            _avatar,
            _reputationReward,
            _startTime,
            _batchTime,
            _redeemEnableTime,
            _maxLockingBatches,
            _repRewardConstA,
            _repRewardConstB,
            _batchesIndexCap,
            _token,
            _agreementHash
        );
        emit NewCL4R(address(continuousLocking4Reputation));
        return address(continuousLocking4Reputation);
    }
}
