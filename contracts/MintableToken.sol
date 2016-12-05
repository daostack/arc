pragma solidity ^0.4.4;
/*

.*/

import "./Token.sol";
import "./zeppelin-solidity/Ownable.sol";

// perhaps call it DilutableToken

contract MintableToken is Ownable, Token { 

    function MintableToken(
        uint256 _initialAmount
        ) {
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        totalSupply = _initialAmount;                        // Update total supply
    }

    function mint(uint256 amount, address destinationAdress) onlyOwner {
        balances[destinationAdress] += amount;
        totalSupply += amount;
    }
  
}
