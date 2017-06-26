pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/SafeMath.sol";



/**
 * @title Mintable token
 * @dev ERC20 Token, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

contract MintableToken is StandardToken, Ownable, Destructible {
    using SafeMath for uint;

    string public name;
    string public symbol;

    uint public decimals = 18;

    event Mint(address indexed to, uint256 value);

    function MintableToken( string _name, string _symbol ) {
        name = _name;
        symbol = _symbol;
        totalSupply = 0;
    }

    function mint(uint256 _amount, address _to) onlyOwner returns (bool) {
    	// create new tokens and add them to the given account
      totalSupply = totalSupply.add(_amount);
      balances[_to] = balances[_to].add(_amount);
      Mint(_to, _amount);
      return true;
    }
}
