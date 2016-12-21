pragma solidity ^0.4.4;


import "./Token.sol";
import "./zeppelin-solidity/Ownable.sol";
import './zeppelin-solidity/SafeMath.sol';

contract MintableToken is SafeMath, Ownable, Token { 
    function mint(uint256 _amount) onlyOwner {
        totalSupply = safeAdd(totalSupply, _amount);
        balances[owner] = safeAdd(balances[owner], _amount);
    }
  
}
