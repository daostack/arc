pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import '../zeppelin-solidity/Ownable.sol';
import '../zeppelin-solidity/SafeMath.sol';

contract PreCoinOffering is Ownable, SafeMath {
    Controller    controller;
    int           cap;          // Cap in Eth
    int           initPrice;    // Price represents Tokens per 1 Eth
    int           finalPrice;
    int           totalEthRaised;
    int           priceSlope;   // Will usually be negative
    bool          isOpened;

    event DonationRecieved( address indexed _sender, int indexed _tokensAmount, uint _newPrice );

    // Constructor:
    function PreCoinOffering( Controller  _controller,
                                address   _owner,
                                int       _cap,
                                int       _initPrice,
                                int       _finalPrice) {
        controller = _controller;
        owner = _owner;
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
    function donate() payable returns(int) {
        // Check PCO is open:
        if (! isOpened) throw;
        // Check cap reached:
        if (totalEthRaised > cap) throw;

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if (msg.value > safeSub(uint(cap),uint(totalEthRaised))) {
          incomingEther = safeSub(uint(cap),uint(totalEthRaised));
          change = safeSub(msg.value, uint(cap));
        } else {
          incomingEther = msg.value;
        }
        int tokens = int(safeMul(incomingEther, getCurrentPrice()));

        // Send ether to controller (to be avatar), mint, and send change to user:
        if (! controller.send(incomingEther)) throw;
        if(! controller.mintTokens(tokens, msg.sender)) throw;
        if (change != 0)
          if (! msg.sender.send(change)) throw;

        // Update total raised, call event and return amount of tokens bought:
        totalEthRaised += int(incomingEther);
        DonationRecieved(msg.sender, tokens, getCurrentPrice());
        return tokens;
    }

    // replace this with any other price function
    function getCurrentPrice() constant returns (uint){
      return (uint(initPrice + priceSlope*totalEthRaised));
    }

}
