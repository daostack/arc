pragma solidity ^0.4.4;


import "./Token.sol";


contract MintableToken is Token { 
    string public name = "SmartPool";
    string public symbol = "SPT";
    
    function MintableToken( string _name, string _symbol ) {
        name = _name;
        symbol = _symbol;
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
}
