pragma solidity ^0.5.11;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract MiniMeToken {
    function balanceOfAt(address _owner, uint _blockNumber) public view returns (uint);
    function totalSupplyAt(uint _blockNumber) public view returns(uint);
}

/**
 * @title NectarRepAllocation contract
 * This contract should be use to calculate reputation allocation for nextar dao bootstrat
 * this contract can be used as the rep mapping contract for RepitationFromToken contract.
 */

contract NectarRepAllocation {
    using SafeMath for uint256;

    uint256 public reputationReward;
    uint256 public claimingStartTime;
    uint256 public claimingEndTime;
    uint256 public totalTokenSupplyAt;
    uint256 public blockReference;
    MiniMeToken public token;

    /**
     * @dev initialize
     * @param _reputationReward the total reputation which will be used to calc the reward
     *        for the token locking
     * @param _claimingStartTime claiming starting period time.
     * @param _claimingEndTime the claiming end time.
     *        claiming is disable after this time.
     * @param _blockReference the block nbumber reference which is used to takle the balance from.
     * @param _token nectar token address
     */
    function initialize(
        uint256 _reputationReward,
        uint256 _claimingStartTime,
        uint256 _claimingEndTime,
        uint256 _blockReference,
        MiniMeToken _token)
        external
    {
        require(token == MiniMeToken(0), "can be called only one time");
        require(_token != MiniMeToken(0), "token cannot be zero");
        token = _token;
        reputationReward = _reputationReward;
        claimingStartTime = _claimingStartTime;
        claimingEndTime = _claimingEndTime;
        blockReference = _blockReference;
        if ((claimingStartTime != 0) || (claimingEndTime != 0)) {
            require(claimingEndTime > claimingStartTime, "claimingStartTime > claimingEndTime");
        }
        totalTokenSupplyAt = token.totalSupplyAt(_blockReference);
    }

    /**
     * @dev get balanceOf _beneficiary function
     * @param _beneficiary addresses
     */
    function balanceOf(address _beneficiary) public view returns(uint256 reputation) {
        if (((claimingStartTime != 0) || (claimingEndTime != 0)) &&
          // solhint-disable-next-line not-rely-on-time
            ((now >= claimingEndTime) || (now < claimingStartTime))) {
            reputation = 0;
        } else {
            reputation = token.balanceOfAt(_beneficiary, blockReference).mul(reputationReward).div(totalTokenSupplyAt);
        }
    }

}
