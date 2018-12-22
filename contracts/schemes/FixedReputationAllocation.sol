pragma solidity ^0.4.25;

import "../controller/ControllerInterface.sol";
import { RealMath } from "../libs/RealMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title A fixed reputation allocation contract
 * This scheme can be used to allocate a pre define amount of reputation to whitelisted
 * beneficiaries.
 */
contract FixedReputationAllocation is Ownable {
    using SafeMath for uint;
    using RealMath for int216;
    using RealMath for int256;

    event Redeem(address indexed _beneficiary, uint _amount);
    event BeneficiaryAddressAdded(address _beneficiary);

    // beneficiary -> exist
    mapping(address => bool) public beneficiaries;

    Avatar public avatar;
    uint public reputationReward;
    bool public isEnable;
    uint public numberOfBeneficiaries;
    uint public beneficiaryReward;
    uint public redeemEnableTime;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     * @param _redeemEnableTime time to enable redeem
     */
    function initialize(Avatar _avatar, uint _reputationReward, uint _redeemEnableTime) external onlyOwner {
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
        // solium-disable-next-line security/no-block-members
        require(now > redeemEnableTime, "require now > redeemEnableTime");
        require(ControllerInterface(avatar.owner()).mintReputation(beneficiaryReward, _beneficiary, avatar), "mint reputation should success");

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
    function addBeneficiaries(address[] _beneficiaries) public onlyOwner {
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
        beneficiaryReward = uint256(int216(reputationReward).div(int256(numberOfBeneficiaries)).fromReal());
    }
}
