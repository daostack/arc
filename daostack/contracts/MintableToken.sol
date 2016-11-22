pragma solidity ^0.4.4;
/*
You should inherit from StandardToken or, for a token like you would want to
deploy in something like Mist, see HumanStandardToken.sol.
(This implements ONLY the standard functions and NOTHING else.
If you deploy this, you won't have anything useful.)

Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
.*/

import "./Token.sol";
import "./Owned.sol";

// perhaps call it DilutableToken

contract MintableToken is Owned, Token(0) { 

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
