pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { RealMath } from "../libs/RealMath.sol";
import "../controller/ControllerInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title A scheme for conduct ERC20 Tokens auction for reputation
 */


contract Auction4Reputation is Ownable {
    using SafeMath for uint;
    using RealMath for int216;
    using RealMath for int256;

    event Bid(uint indexed _auctionId, uint _amount, address _bidder);
    event Redeem(uint indexed _auctionId, address indexed _beneficiary, uint _amount);

    struct Auction {
        uint totalBid;
        // A mapping from bidder addresses to their bids.
        mapping(address=>uint) bids;
    }

    // A mapping from auction index to auction.
    mapping(uint=>Auction) public auctions;

    Avatar public avatar;
    uint public reputationRewardLeft;
    uint public auctionsEndTime;
    uint public auctionsStartTime;
    uint public numberOfAuctions;
    uint public auctionReputationReward;
    uint public auctionPeriod;
    StandardToken public token;
    address public wallet;

    /**
     * @dev initialize
     * @param _avatar the avatar to mint reputation from
     * @param _reputationReward the total reputation this contract will reward
     *        for the token locking
     * @param _auctionsStartTime auctions period start time
     * @param _auctionsEndTime auctions period end time.
     *        redeem reputation can be done after this period.
     *        bidding is disable after this time.
     * @param _numberOfAuctions number of auctions.
     * @param _token the bidding token
     */
    function initialize(
        Avatar _avatar,
        uint _reputationReward,
        uint _auctionsStartTime,
        uint _auctionsEndTime,
        uint _numberOfAuctions,
        StandardToken _token,
        address _wallet)
       external
       onlyOwner
       {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        // number of auctions cannot be zero
        // auctionsEndTime should be greater than auctionsStartTime
        auctionPeriod = (_auctionsEndTime.sub(_auctionsStartTime)).div(_numberOfAuctions);
        require(auctionPeriod > 0, "auctionPeriod should be > 0");
        token = _token;
        avatar = _avatar;
        auctionsStartTime = _auctionsStartTime;
        auctionsEndTime = _auctionsEndTime;
        numberOfAuctions = _numberOfAuctions;
        wallet = _wallet;
        auctionReputationReward = _reputationReward / _numberOfAuctions;
        reputationRewardLeft = _reputationReward;
    }

    /**
     * @dev redeem reputation function
     * @param _beneficiary the beneficiary to redeem.
     * @param _auctionId the auction id to redeem from.
     * @return bool
     */
    function redeem(address _beneficiary, uint _auctionId) public returns(bool) {
        // solium-disable-next-line security/no-block-members
        require(now >= auctionsEndTime, "check the auctions period pass");
        Auction storage auction = auctions[_auctionId];
        uint bid = auction.bids[_beneficiary];
        require(bid > 0, "bidding amount should be > 0");
        auction.bids[_beneficiary] = 0;
        int256 repRelation = int216(bid).toReal().mul(int216(auctionReputationReward).toReal());
        uint reputation = uint256(repRelation.div(int216(auction.totalBid).toReal()).fromReal());
        // check that the reputation is sum zero
        reputationRewardLeft = reputationRewardLeft.sub(reputation);
        require(ControllerInterface(avatar.owner()).mintReputation(reputation, _beneficiary, avatar), "mint reputation should success");
        emit Redeem(_auctionId, _beneficiary, reputation);
        return true;
    }

    /**
     * @dev bid function
     * @param _amount the amount to bid with
     * @return auctionId
     */
    function bid(uint _amount) public returns(uint auctionId) {
        require(_amount > 0, "bidding amount should be > 0");
        // solium-disable-next-line security/no-block-members
        require(now <= auctionsEndTime, "bidding should be within the allowed bidding period");
        // solium-disable-next-line security/no-block-members
        require(now >= auctionsStartTime, "bidding is enable only after bidding auctionsStartTime");
        require(token.transferFrom(msg.sender, wallet, _amount), "transferFrom should success");
        // solium-disable-next-line security/no-block-members
        auctionId = (now - auctionsStartTime) / auctionPeriod;
        Auction storage auction = auctions[auctionId];
        auction.totalBid = auction.totalBid.add(_amount);
        auction.bids[msg.sender] = auction.bids[msg.sender].add(_amount);
        emit Bid(auctionId, _amount, msg.sender);
    }

    /**
     * @dev getBid get bid for specific bidder and _auctionId
     * @param _bidder the bidder
     * @param _auctionId auction id
     * @return uint
     */
    function getBid(address _bidder,uint _auctionId) public view returns(uint) {
        return auctions[_auctionId].bids[_bidder];
    }

}
