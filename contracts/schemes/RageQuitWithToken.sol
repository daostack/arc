pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/Controller.sol";


/**
 * @title A scheme to rage quit from a dao with token.
 * by sending the dao native token to the RageQuit function the sender will get is proportional share of the dao
 * rageQuitToken (DAI in most case)
 */
contract RageQuitWithToken {
    using SafeMath for uint256;

    event RageQuit(
        address indexed _avatar,
        address indexed _rageQuitter,
        uint256 indexed _refund
    );

    Avatar public avatar;
    IERC20 public rageQuitToken; //the token which is given back for rageQuit - DAI in most cases

    /**
     * @dev initialize
     * @param _avatar the avatar this scheme referring to.
     * @param _rageQuitToken the token which is given back for rageQuit - DAI in most
     */
    function initialize(
        Avatar _avatar,
        IERC20 _rageQuitToken
    )
    external
    {
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(avatar == Avatar(0), "cannot initialize twice");
        avatar = _avatar;
        rageQuitToken = _rageQuitToken;
    }

    /**
    * @dev rageQuit quit from the dao.
    * @param _amountToRageQuitWith amount of native token to rageQuit with.
    * @return refund the refund amount
    */
    function rageQuit(uint256 _amountToRageQuitWith) external returns(uint256 refund) {
        uint256 totalTokenSupply = avatar.nativeToken().totalSupply();
        uint256 rageQuitTokenTotalSupply = rageQuitToken.balanceOf(address(avatar));
        refund = _amountToRageQuitWith.mul(rageQuitTokenTotalSupply).div(totalTokenSupply);
        //this will revert if the msg.sender token balance is less than _amountToRageQuitWith.
        avatar.nativeToken().burnFrom(msg.sender, _amountToRageQuitWith);
        require(
        Controller(
        avatar.owner()).externalTokenTransfer(rageQuitToken, msg.sender, refund, avatar), "send token failed");
        emit RageQuit(address(avatar), msg.sender, refund);
    }

}
