pragma solidity ^0.4.7;

import "zeppelin/contracts/token/StandardToken.sol";
import "zeppelin/contracts/ownership/Ownable.sol";
import "zeppelin/contracts/lifecycle/Killable.sol";


contract MintableToken is StandardToken, Ownable, Killable {
    string public name;
    string public symbol;

    uint public decimals = 18;

    function MintableToken( string _name, string _symbol ) {
        name = _name;
        symbol = _symbol;
        totalSupply = 0;
    }

    function mint(int256 _amount, address _to) onlyOwner returns (bool) {
    	// create new tokens and add them to the given account
    	uint absAmount;
    	if( _amount < 0 && _to != owner ) throw;
    	if( _amount >= 0 ) {
        	absAmount = uint(_amount);
            totalSupply = safeAdd(totalSupply, absAmount);
            balances[_to] = safeAdd(balances[_to], absAmount);
        }
        else {
            absAmount = uint((-1)*_amount);
            totalSupply = safeSub(totalSupply, absAmount);
            balances[_to] = safeSub(balances[_to], absAmount);
        }
        return true;
    }

    function burn(uint256 _amount, address _from) onlyOwner returns (bool) {
      // Burn tokens of a given account
      if ( balances[_from] < _amount) throw;
      balances[_from] = safeSub(balances[_from], _amount);
      totalSupply = safeSub(totalSupply, _amount);
      return true;
    }
}
