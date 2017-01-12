pragma solidity ^0.4.4;


import "./Token.sol";
import "./zeppelin-solidity/Ownable.sol";
import './zeppelin-solidity/SafeMath.sol';

contract MintableToken is SafeMath, Ownable, Token { 

    function mint(uint256 _amount, address _to) onlyOwner returns (bool) {
    	// create new tokens and add them to the given account
        totalSupply = safeAdd(totalSupply, _amount);
        balances[_to] = safeAdd(balances[_to], _amount);
        return true;
    }
}
