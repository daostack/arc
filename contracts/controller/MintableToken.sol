pragma solidity ^0.4.11;

import "zeppelin/contracts/token/StandardToken.sol";
import "zeppelin/contracts/ownership/Ownable.sol";
import "zeppelin/contracts/lifecycle/Destructible.sol";
import "zeppelin/contracts/SafeMath.sol";


contract MintableToken is StandardToken, Ownable, Destructible {
    using SafeMath for uint;

    string public name;
    string public symbol;

    uint public decimals = 18;

    event Mint(address indexed to, int256 value);

    function MintableToken( string _name, string _symbol ) {
        name = _name;
        symbol = _symbol;
        totalSupply = 0;
    }

    function mint(int256 _amount, address _to) onlyOwner returns (bool) {
    	// create new tokens and add them to the given account
    	uint absAmount;
    	/*if ( _amount < 0 && _to != owner ) revert; // Allowing burn for everyone, just for the demo.*/
    	if( _amount >= 0 ) {
        	absAmount = uint(_amount);
            totalSupply = totalSupply.add(absAmount);
            balances[_to] = balances[_to].add(absAmount);
      }
      else {
          absAmount = uint((-1)*_amount);
          totalSupply = totalSupply.sub(absAmount);
          balances[_to] = balances[_to].sub(absAmount);
      }
      Mint(_to, _amount);
      return true;
    }
}
