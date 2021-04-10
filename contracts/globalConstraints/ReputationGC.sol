pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./GlobalConstraintInterface.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Avatar.sol";


/**
 * @title ReputationGC reputation mint/butn constraint per period
 */
contract ReputationGC is GlobalConstraintInterface {
    using SafeMath for uint256;

    uint256 public periodLength; //the period length in seconds
    uint256 public percentageAllowedPerPeriod;
    Avatar public avatar;
    uint256 public startTime;
    uint256 public totalRepSupplyBefore;

    // a mapping from period indexes to amounts
    mapping(uint256=>uint256) public totalRepMintedPerPeriod;
    mapping(uint256=>uint256) public totalRepBurnedPerPeriod;
    // a mapping from period to totalSupply
    mapping(uint256=>uint256) public totalRepSupplyPerPeriod;

  /**
   * @dev initialize
   * @param _avatar the avatar to enforce the constraint on
   * @param _periodLength the periodLength in seconds
   * @param _percentageAllowedPerPeriod the amount of reputation to constraint for each period (brun and mint)
   */
    function initialize(
        Avatar _avatar,
        uint256 _periodLength,
        uint256 _percentageAllowedPerPeriod
    )
    external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_percentageAllowedPerPeriod <= 100, "precentage allowed cannot be greated than 100");
        avatar = _avatar;
        periodLength = _periodLength;
        percentageAllowedPerPeriod = _percentageAllowedPerPeriod;
        // solhint-disable-next-line not-rely-on-time
        startTime = now;
    }

    /**
     * @dev check the constraint before the action.
     * @return true
     */
    function pre(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == avatar.owner(), "only avatar owner is authorize to call");
        totalRepSupplyBefore = (avatar.nativeReputation()).totalSupply();
        // solhint-disable-next-line not-rely-on-time
        uint256 currentPeriodIndex = (now - startTime)/periodLength;
        if (totalRepSupplyPerPeriod[currentPeriodIndex] == 0) {
            totalRepSupplyPerPeriod[currentPeriodIndex] = totalRepSupplyBefore;
        }

        return true;
    }

    /**
     * @dev check the allowance of reputation minted or burned per period
     * and throws an error if the constraint is violated
     * @return bool which represents a success
     */
    function post(address, bytes32, bytes32) public returns(bool) {
        require(msg.sender == avatar.owner(), "only avatar owner is authorize to call");
        uint256 currentRepTotalSupply = (avatar.nativeReputation()).totalSupply();
        if (totalRepSupplyBefore != currentRepTotalSupply) {
          // solhint-disable-next-line not-rely-on-time
            uint256 currentPeriodIndex = (now - startTime)/periodLength;
            uint256 repAllowedForCurrentPeriod = totalRepSupplyPerPeriod[currentPeriodIndex]
            .mul(percentageAllowedPerPeriod)
            .div(100);

            if (totalRepSupplyBefore > currentRepTotalSupply) {
                //reputation was burned
                uint256 burnedReputation = totalRepSupplyBefore.sub(currentRepTotalSupply);
                totalRepBurnedPerPeriod[currentPeriodIndex] =
                totalRepBurnedPerPeriod[currentPeriodIndex].add(burnedReputation);

                require(totalRepBurnedPerPeriod[currentPeriodIndex] <= repAllowedForCurrentPeriod,
                "Violation of Global constraint ReputationGC:amount of reputation burned exceed in current period");
            } else {
                // reputation was minted
                uint256 mintedReputation = currentRepTotalSupply.sub(totalRepSupplyBefore);
                totalRepMintedPerPeriod[currentPeriodIndex] =
                totalRepMintedPerPeriod[currentPeriodIndex].add(mintedReputation);
                require(totalRepMintedPerPeriod[currentPeriodIndex] <= repAllowedForCurrentPeriod,
                "Violation of Global constraint ReputationGC:amount of reputation minted exceed in current period");
            }
        }
        totalRepSupplyBefore = 0; //save gas
        return true;
    }

    /**
     * @dev when return if this globalConstraints is pre, post or both.
     * @return CallPhase enum indication  Pre, Post or PreAndPost.
     */
    function when() public pure returns(GlobalConstraintInterface.CallPhase) {
        return GlobalConstraintInterface.CallPhase.PreAndPost;
    }
}
