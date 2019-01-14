pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../libs/SafeERC20.sol";

/**
 * @title A scheme for conduct ERC20 Tokens auction for reputation
 */


contract Auction4Reputation is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for address;

    event Bid(address indexed _bidder, uint256 indexed _auctionId, uint256 _amount);
    event Redeem(uint256 indexed _auctionId, address indexed _beneficiary, uint256 _amount);

    struct Auction {
        uint256 totalBid;
        // A mapping from bidder addresses to their bids.
        mapping(address=>uint) bids;
    }

    // A mapping from auction index to auction.
    mapping(uint=>Auction) public auctions;

    Avatar public avatar;
    uint256 public reputationRewardLeft;
    uint256 public auctionsEndTime;
    uint256 public auctionsStartTime;
    uint256 public numberOfAuctions;
    uint256 public auctionReputationReward;
    uint256 public auctionPeriod;
    uint256 public redeemEnableTime;
    IERC20 public token;
    address public wallet;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _auctionReputationReward the reputation reward per auction this contract will reward
     *        for the token locking
     * @param _auctionsStartTime auctions period start time
     * @param _auctionPeriod auctions period time.
     *        auctionsEndTime is set to _auctionsStartTime + _auctionPeriod*_numberOfAuctions
     *        bidding is disable after auctionsEndTime.
     * @param _numberOfAuctions number of auctions.
     * @param _redeemEnableTime redeem enable time .
     *        redeem reputation can be done after this time.
     * @param _token the bidding token
     * @param  _wallet the address of the wallet the token will be transfer to.
     *         Please note that _wallet address should be a trusted account.
     *         Normally this address should be set as the DAO's avatar address.
     */
    function initialize(
        Avatar _avatar,
        uint256 _auctionReputationReward,
        uint256 _auctionsStartTime,
        uint256 _auctionPeriod,
        uint256 _numberOfAuctions,
        uint256 _redeemEnableTime,
        IERC20 _token,
        address _wallet)
    external
    onlyOwner
    {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        require(_numberOfAuctions > 0, "number of auctions cannot be zero");
        //_auctionPeriod should be greater than block interval
        require(_auctionPeriod > 15, "auctionPeriod should be > 15");
        auctionPeriod = _auctionPeriod;
        auctionsEndTime = _auctionsStartTime + _auctionPeriod.mul(_numberOfAuctions);
        require(_redeemEnableTime >= auctionsEndTime, "_redeemEnableTime >= auctionsEndTime");
        token = _token;
        avatar = _avatar;
        auctionsStartTime = _auctionsStartTime;
        numberOfAuctions = _numberOfAuctions;
        wallet = _wallet;
        auctionReputationReward = _auctionReputationReward;
        reputationRewardLeft = _auctionReputationReward.mul(_numberOfAuctions);
        redeemEnableTime = _redeemEnableTime;
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary to redeem.
     * @param _auctionId the auction id to redeem from.
     * @return uint256 reputation rewarded
     */
    function redeem(address _beneficiary, uint256 _auctionId) public returns(uint256 reputation) {
        // solhint-disable-next-line not-rely-on-time
        require(now > redeemEnableTime, "now > redeemEnableTime");
        Auction storage auction = auctions[_auctionId];
        uint256 bid = auction.bids[_beneficiary];
        require(bid > 0, "bidding amount should be > 0");
        auction.bids[_beneficiary] = 0;
        uint256 repRelation = bid.mul(auctionReputationReward);
        reputation = repRelation.div(auction.totalBid);
        // check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(
        ControllerInterface(avatar.owner())
        .mintReputation(reputation, _beneficiary, address(avatar)), "mint reputation should succeed");
        emit Redeem(_auctionId, _beneficiary, reputation);
    }

    /**
     * @dev bid function
     * @param _amount the amount to bid with
     * @return auctionId
     */
    function bid(uint256 _amount) public returns(uint256 auctionId) {
        require(_amount > 0, "bidding amount should be > 0");
        // solhint-disable-next-line not-rely-on-time
        require(now <= auctionsEndTime, "bidding should be within the allowed bidding period");
        // solhint-disable-next-line not-rely-on-time
        require(now >= auctionsStartTime, "bidding is enable only after bidding auctionsStartTime");
        address(token).safeTransferFrom(msg.sender, address(this), _amount);
        // solhint-disable-next-line not-rely-on-time
        auctionId = (now - auctionsStartTime) / auctionPeriod;
        Auction storage auction = auctions[auctionId];
        auction.totalBid = auction.totalBid.add(_amount);
        auction.bids[msg.sender] = auction.bids[msg.sender].add(_amount);
        emit Bid(msg.sender, auctionId, _amount);
    }

    /**
     * @dev getBid get bid for specific bidder and _auctionId
     * @param _bidder the bidder
     * @param _auctionId auction id
     * @return uint
     */
    function getBid(address _bidder, uint256 _auctionId) public view returns(uint256) {
        return auctions[_auctionId].bids[_bidder];
    }

    /**
     * @dev transferToWallet transfer the tokens to the wallet.
     *      can be called only after auctionsEndTime
     */
    function transferToWallet() public {
      // solhint-disable-next-line not-rely-on-time
        require(now > auctionsEndTime, "now > auctionsEndTime");
        uint256 tokenBalance = token.balanceOf(address(this));
        address(token).safeTransfer(wallet, tokenBalance);
    }

}
