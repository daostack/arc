pragma solidity 0.5.13;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Controller.sol";

/**
 * @title A scheme for reputation allocation by an authorized account
 */

contract AuthorizedMintRep {
    using SafeMath for uint256;

    Avatar public avatar;
    uint256 public activationStartTime;
    uint256 public activationEndTime;
    uint256 public repRewardLeft;
    address public authorizedAddress;
    bool public limitRepReward;

    /**
     * @dev Throws if called by an unauthorized account.
     */
    modifier onlyAuthorized() {
        require(msg.sender == authorizedAddress, "Caller is not authorized");
        _;
    }

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _activationStartTime start time for allowing minting
     * @param _activationEndTime end time for allowing minting
     * @param _maxRepReward maximum reputation mintable by this scheme
     * @param _authorizedAddress address authorized for minting reputation
     */
    function initialize(
        Avatar _avatar,
        uint256 _activationStartTime,
        uint256 _activationEndTime,
        uint256 _maxRepReward,
        address _authorizedAddress
    ) external {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_activationStartTime < _activationEndTime, "_activationStartTime < _activationEndTime");
        avatar = _avatar;
        activationStartTime = _activationStartTime;
        activationEndTime = _activationEndTime;
        repRewardLeft = _maxRepReward;
        authorizedAddress = _authorizedAddress;
        limitRepReward = _maxRepReward != 0;
    }

    /**
     * @dev reputationMint function
     * @param _beneficiary the beneficiary address to redeem for
     * @param _amount the agreementHash hash
     */
    function reputationMint(address _beneficiary, uint256 _amount) external onlyAuthorized {
        // solhint-disable-next-line not-rely-on-time
        require(now >= activationStartTime, "Minting period did not start yet");
        // solhint-disable-next-line not-rely-on-time
        require(now < activationEndTime, "Minting period ended.");

        if (limitRepReward) {
            repRewardLeft = repRewardLeft.sub(_amount);
        }

        require(
            Controller(avatar.owner()).mintReputation(_amount, _beneficiary, address(avatar)),
            "Minting reputation should succeed"
        );
    }
}
