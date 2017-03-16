pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import '../zeppelin-solidity/Ownable.sol';
import '../zeppelin-solidity/SafeMath.sol';

contract PreCoinOffering is Ownable, SafeMath {
    Controller    controller;
    uint          cap;
    uint          initPrice;
    uint          priceSlope;
    uint          totalRaised;
    bool          isOpened;

    event DonationRecived( address indexed _sender, int indexed _tokensAmount, uint _newPrice );

    // Constructor:
    function PreCoinOffering( Controller  _controller,
                                address   _owner,
                                uint      _cap,
                                uint      _initPrice,
                                uint      _priceSlope) {
        controller = _controller;
        owner = _owner;
        initPrice = _initPrice;
        priceSlope = _priceSlope;
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
        if (totalRaised < cap) throw;

        uint incomingEther;
        uint change;

        // Compute how much tokens to buy:
        if (msg.value > safeSub(cap,totalRaised)) {
          incomingEther = safeSub(cap,totalRaised);
        } else {
          incomingEther = msg.value;
        }
        int tokens = int(safeMul(incomingEther, getCurrectPrice()));

        // Send ether to controller (to be avatar), mint, and send change to user:
        if (! controller.send(incomingEther)) throw;
        if(! controller.mintTokens(tokens, msg.sender)) throw;
        if (change != 0)
          if (! msg.sender.send(change)) throw;

        // Update total raised, call event and return amount of tokens bought:
        totalRaised += incomingEther;
        DonationRecived(msg.sender, tokens, getCurrectPrice());
        return tokens;
    }

    // replace this with any other price function
    function getCurrectPrice() constant returns (uint){
      return (initPrice + priceSlope*totalRaised);
    }

}
