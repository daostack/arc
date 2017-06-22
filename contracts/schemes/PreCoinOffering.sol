pragma solidity ^0.4.11;
import "../controller/Controller.sol";
import "zeppelin/contracts/ownership/Ownable.sol";
import "zeppelin/contracts/SafeMath.sol";


contract PreCoinOffering is Ownable {
    using SafeMath for uint;

    Controller    controller;
    uint          cap;          // Cap in Eth
    uint          initPrice;    // Price represents Tokens per 1 Eth
    uint          finalPrice;
    uint          totalEthRaised;
    uint          priceSlope;   // Will usually be negative
    bool          isOpened;

    event DonationRecieved( address indexed _sender, uint indexed _tokensAmount, uint _newPrice );

    // Constructor:
    function PreCoinOffering(
        Controller  _controller,
        address   _owner,
        uint      _cap,
        uint      _initPrice,
        uint      _finalPrice)
    {
        controller = _controller;
        owner = _owner;
        cap = _cap;
        initPrice = _initPrice;
        finalPrice = _finalPrice;
        priceSlope = (finalPrice - initPrice)/cap;
        isOpened = true;
    }

    // When either is sent to contract, buy tokens with it:
    function () payable {
          donate();
    }

    // Owner closes PCO:
    function closePCO() onlyOwner {
          isOpened = false;
    }

    // Buying tokens:
    function donate() payable returns(uint) {
        // Check PCO is open:
        require(isOpened);
        // Check cap reached:
        require(totalEthRaised < cap);

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if (msg.value > (cap).sub(totalEthRaised)) {
            incomingEther = (cap).sub(totalEthRaised);
            change = (msg.value).sub(cap);
        } else {
            incomingEther = msg.value;
        }
        uint tokens = incomingEther.mul(getCurrentPrice());

        // Send ether to controller (to be avatar), mint, and send change to user:
        controller.transfer(incomingEther);
        if(! controller.mintTokens(tokens, msg.sender)) revert();
        if (change != 0)
            msg.sender.transfer(change);

        // Update total raised, call event and return amount of tokens bought:
        totalEthRaised += incomingEther;
        DonationRecieved(msg.sender, tokens, getCurrentPrice());
        return tokens;
    }

    // replace this with any other price function
    function getCurrentPrice() returns (uint){
      return (initPrice + priceSlope*totalEthRaised);
    }
}
