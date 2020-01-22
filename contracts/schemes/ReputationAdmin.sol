pragma solidity 0.5.13;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Controller.sol";

/**
 * @title A scheme for reputation minting/burning by an authorized account
 */

contract ReputationAdmin is Ownable {
    using SafeMath for uint256;

    Avatar public avatar;
    uint256 public activationStartTime;
    uint256 public activationEndTime;
    uint256 public repRewardLeft;
    uint256 public limitRepReward;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _activationStartTime start time for allowing minting
     * @param _activationEndTime end time for allowing minting
     * @param _maxRepReward maximum reputation mintable by this scheme
     */
    function initialize(
        Avatar _avatar,
        uint256 _activationStartTime,
        uint256 _activationEndTime,
        uint256 _maxRepReward
    ) external onlyOwner {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_activationStartTime < _activationEndTime, "_activationStartTime < _activationEndTime");
        avatar = _avatar;
        activationStartTime = _activationStartTime;
        activationEndTime = _activationEndTime;
        repRewardLeft = _maxRepReward;
        limitRepReward = _maxRepReward;
    }

    /**
     * @dev reputationBurn function
     * @param _beneficiaries the beneficiaries address to mint reputation from
     * @param _amounts the amounts of reputation to mint for beneficiaries
     */
    function reputationMint(address[] calldata _beneficiaries, uint256[] calldata _amounts) external onlyOwner {
        require(_beneficiaries.length == _amounts.length, "Arrays length mismuch");
        for (uint256 i=0; i < _beneficiaries.length; i++) {
            _reputationMint(_beneficiaries[i], _amounts[i]);
        }
    }

    /**
     * @dev reputationBurn function
     * @param _beneficiaries the beneficiaries address to burm reputation from
     * @param _amounts the amounts of reputation to burn for beneficiaries
     */
    function reputationBurn(address[] calldata _beneficiaries, uint256[] calldata _amounts) external onlyOwner {
        require(_beneficiaries.length == _amounts.length, "Arrays length mismuch");
        for (uint256 i=0; i < _beneficiaries.length; i++) {
            _reputationBurn(_beneficiaries[i], _amounts[i]);
        }
    }

    /**
     * @dev reputationMint function
     * @param _beneficiary the beneficiary address to mint reputation for
     * @param _amount the amount of reputation to mint the the beneficirary
     */
    function _reputationMint(address _beneficiary, uint256 _amount) private {
        // solhint-disable-next-line not-rely-on-time
        require(now >= activationStartTime, "Minting period did not start yet");
        // solhint-disable-next-line not-rely-on-time
        require(now < activationEndTime, "Minting period ended.");

        if (limitRepReward > 0) {
            repRewardLeft = repRewardLeft.sub(_amount);
        }

        require(
            Controller(avatar.owner()).mintReputation(_amount, _beneficiary, address(avatar)),
            "Minting reputation should succeed"
        );
    }

    /**
     * @dev reputationBurn function
     * @param _beneficiary the beneficiary address to burm reputation from
     * @param _amount the amount of reputation to burn for a beneficirary
     */
    function _reputationBurn(address _beneficiary, uint256 _amount) private {
        // solhint-disable-next-line not-rely-on-time
        require(now >= activationStartTime, "Burning period did not start yet");
        // solhint-disable-next-line not-rely-on-time
        require(now < activationEndTime, "Burning period ended.");

        if (limitRepReward > 0) {
            require(_amount <= limitRepReward.sub(repRewardLeft), "Cannot burn more than minted");
            repRewardLeft = repRewardLeft.add(_amount);
        }

        require(
            Controller(avatar.owner()).burnReputation(_amount, _beneficiary, address(avatar)),
            "Burn reputation should succeed"
        );
    }
}
