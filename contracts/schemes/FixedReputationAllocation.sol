pragma solidity ^0.5.2;

import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title A fixed reputation allocation contract
 * This scheme can be used to allocate a pre define amount of reputation to whitelisted
 * beneficiaries.
 */
contract FixedReputationAllocation is Ownable {
    using SafeMath for uint256;

    event Redeem(address indexed _beneficiary, uint256 _amount);
    event BeneficiaryAddressAdded(address indexed _beneficiary);

    // beneficiary -> exist
    mapping(address => bool) public beneficiaries;

    Avatar public avatar;
    uint256 public reputationReward;
    bool public isEnable;
    uint256 public numberOfBeneficiaries;
    uint256 public beneficiaryReward;
    uint256 public redeemEnableTime;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     * @param _redeemEnableTime time to enable redeem
     */
    function initialize(Avatar _avatar, uint256 _reputationReward, uint256 _redeemEnableTime) external onlyOwner {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        reputationReward = _reputationReward;
        redeemEnableTime = _redeemEnableTime;
        avatar = _avatar;
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary for the release
     * @return bool
     */
    function redeem(address _beneficiary) public returns(bool) {
        require(isEnable, "require to be enable");
        require(beneficiaries[_beneficiary], "require _beneficiary to exist in the beneficiaries map");
        beneficiaries[_beneficiary] = false;
        // solhint-disable-next-line not-rely-on-time
        require(now > redeemEnableTime, "require now > redeemEnableTime");
        require(
        ControllerInterface(
        avatar.owner())
        .mintReputation(beneficiaryReward, _beneficiary, address(avatar)), "mint reputation failed");

        emit Redeem(_beneficiary, beneficiaryReward);

        return true;
    }

    /**
     * @dev addBeneficiary function
     * @param _beneficiary to be whitelisted
     */
    function addBeneficiary(address _beneficiary) public onlyOwner {
        require(!isEnable, "can add beneficiary only if not already enable");

        if (!beneficiaries[_beneficiary]) {
            beneficiaries[_beneficiary] = true;
            numberOfBeneficiaries++;

            emit BeneficiaryAddressAdded(_beneficiary);
        }
    }

    /**
     * @dev add addBeneficiaries function
     * @param _beneficiaries addresses
     */
    function addBeneficiaries(address[] memory _beneficiaries) public onlyOwner {
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            addBeneficiary(_beneficiaries[i]);
        }
    }

    /**
     * @dev enable function
     */
    function enable() public onlyOwner {
        isEnable = true;
        // Calculate beneficiary reward
        beneficiaryReward = reputationReward.div(numberOfBeneficiaries);
    }
}
