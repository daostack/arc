pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";
import "minimetoken/contracts/MiniMeToken.sol";
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


contract DAOTokenERC827 is MintableToken,Destructible,BurnableToken, ERC827Token {

    string public name;
    string public symbol;
    uint public constant DECIMAL = 18;

    /**
     * @dev the constructor takes a token name and a symbol
     */
    function DAOTokenERC827(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }
}


contract DAOTokenMiniMe is Destructible, MiniMeToken {
    function DAOTokenMiniMe(
        address _tokenFactory,
        address _parentToken,
        uint _parentSnapShotBlock,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        bool _transfersEnabled
    ) MiniMeToken(
        _tokenFactory,
        _parentToken,
        _parentSnapShotBlock,
        _tokenName,
        _decimalUnits,
        _tokenSymbol,
        _transfersEnabled) public
    {}

    // delegate implementaion of mint
    function mint(address _owner, uint _amount) public returns(bool ok) {
        return generateTokens(_owner,_amount);
    }

    // delegate implementaion of burn
    function burn(uint _amount) public returns(bool ok) {
        return destroyTokens(msg.sender,_amount);
    }
}
