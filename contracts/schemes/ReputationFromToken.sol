pragma solidity ^0.5.4;

import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title A scheme for reputation allocation according to token balances
 */

contract ReputationFromToken {

    IERC20 public tokenContract;
    //      beneficiary -> bool
    mapping(address     => bool) public redeems;
    Avatar public avatar;

    event Redeem(address indexed _beneficiary, address indexed _sender, uint256 _amount);

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _tokenContract the token contract
     */
    function initialize(Avatar _avatar, IERC20 _tokenContract) external
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        tokenContract = _tokenContract;
        avatar = _avatar;
    }

    /**
     * @dev redeem function
     * @param _beneficiary the beneficiary address to redeem for
     */
    function redeem(address _beneficiary) public {
        require(avatar != Avatar(0), "should initialize first");
        require(redeems[msg.sender] == false, "redeeming twice from the same account is not allowed");
        redeems[msg.sender] = true;
        uint256 tokenAmount = tokenContract.balanceOf(msg.sender);
        require(
        ControllerInterface(
        avatar.owner())
        .mintReputation(tokenAmount, _beneficiary, address(avatar)), "mint reputation should succeed");
        emit Redeem(_beneficiary, msg.sender, tokenAmount);
    }
}
