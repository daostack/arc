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
contract DAOTokenERC20 is MintableToken,Destructible,BurnableToken {}
contract DAOTokenERC827 is MintableToken,Destructible,BurnableToken, ERC827Token {}
contract DAOTokenMiniMe is MintableToken,Destructible,BurnableToken, MiniMeToken {}
