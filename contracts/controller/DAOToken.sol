pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/token/BurnableToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";



/**
 * @title DAOToken, base on zeppelin contract.
 * @dev ERC20 compatible token. It is a mintable, destructible, burnable token.
 */

contract DAOToken is MintableToken,Destructible,BurnableToken {

    string public name;
    string public symbol;
    uint public constant DECIMAL = 18;

    /**
     * @dev the constructor takes a token name and a symbol
     */
    function DAOToken(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }
}
