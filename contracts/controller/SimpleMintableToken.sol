pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Mintable token
 * @dev ERC20 Token, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

contract SimpleMintableToken is StandardToken, Ownable, Destructible {
    using SafeMath for uint;

    string public name;
    string public symbol;

    uint public decimals = 18;

    event Mint(address indexed to, uint256 value);

    /**
     * @dev the constructor takes a token name and a symbol and sets the total supply to 0
     */
    function SimpleMintableToken(string _name, string _symbol) {
        name = _name;
        symbol = _symbol;
        totalSupply = 0;
    }

     /**
      * @dev create new tokens, add them to the given account, and trigering an event about the operation
      * @param _amount the token amount to be added
      * @param _to the address which we give the tokens to
      * @return bool which represents a sucess
      */
    function mint(uint256 _amount, address _to) onlyOwner returns (bool) {
      totalSupply = totalSupply.add(_amount);
      balances[_to] = balances[_to].add(_amount);
      Mint(_to, _amount);
      return true;
    }
}
