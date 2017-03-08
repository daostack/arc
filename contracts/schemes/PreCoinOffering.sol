pragma solidity ^0.4.7;
import '../controller/Controller.sol';
import '../zeppelin-solidity/Ownable.sol';
import '../zeppelin-solidity/SafeMath.sol';

contract PreCoinOffering is Ownable, SafeMath {
    Controller    controller;
    uint          PRICE;

    mapping(bytes32=>bool) whiteListCodes;

    function PreCoinOffering( Controller _controller,
                                address _owner,
                                uint       _PRICE) {
        controller = _controller;
        owner = _owner;
        PRICE = _PRICE;
    }

    function addCode(bytes32 _code) onlyOwner {
        whiteListCodes[_code] = true;
    }

    function () payable {
      if (msg.data.length==32)
      buyTokens(bytes(msg.data));
    }

    function buyTokens(bytes preHashedCode) payable returns(bool) {
        // Check code is on the white list:
        if (! whiteListCodes[sha3(preHashedCode)]) throw;

        // /create the tokens:
        int tokens = int(safeMul(msg.value, getPrice()));
        whiteListCodes[sha3(preHashedCode)] == false;
        if(! controller.mintTokens(tokens, msg.sender)) {
          whiteListCodes[sha3(preHashedCode)] == true;
          return false;
        }
        return true;
    }

    // replace this with any other price function
    function getPrice() constant returns (uint){
      return PRICE;
    }

}
