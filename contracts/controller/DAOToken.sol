pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title DAOToken, base on zeppelin contract.
 * @dev ERC20 comptible token. It is a mintable, lockable, burnable token.
 */

contract DAOToken is MintableToken, Destructible {
    using SafeMath for uint;

    event TokenLock(address indexed user, uint value);
    event Burn(uint value);

    struct Lock {
      uint lockedAmount;
      uint releaseBlock;
    }

    string public name;
    string public symbol;
    uint public decimals = 18;

    /**
     * @dev the constructor takes a token name and a symbol
     */
    function DAOToken(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    // Locking mapping:
    mapping(address => Lock) lockBalances;

    function lock(uint _value, uint _releaseBlock) public {
      lockInternal(msg.sender, _value, _releaseBlock);
    }

    function mintLocked(address _to, uint _amount, uint _releaseBlock) public returns(bool res) {
      res = (super.mint(_to, _amount));
      lockInternal(_to, _amount, _releaseBlock);
    }

    function lockInternal(address agent, uint _value, uint _releaseBlock) internal {
      // Sanity check:
      require(_value != 0);
      require(_value <= balances[agent]);

      // Check if user has locked funds, and verify the change is legit:
      if (lockBalances[agent].releaseBlock > block.number) {
        require(_value >= lockBalances[agent].lockedAmount);
        require(_releaseBlock >= lockBalances[agent].releaseBlock);
      }

      lockBalances[agent].lockedAmount = _value;
      lockBalances[agent].releaseBlock = _releaseBlock;
      TokenLock(agent, _value);
    }

    // Rewriting the function to check for locking and burn tokens of the contract itself:
    function transfer(address _to, uint _value) public returns(bool res) {
      // Check for locking:
      if (lockBalances[msg.sender].releaseBlock > block.number)
        require(balances[msg.sender].sub(_value) >= lockBalances[msg.sender].lockedAmount);

      res = (super.transfer(_to, _value));

      if (_to == address(this))
        burnContractTokens();
    }

    // Rewriting the function to check for locking and burn tokens of the contract itself:
    function transferFrom(address _from, address _to, uint _value) public returns(bool res) {
      // Check for locking:
      if (lockBalances[_from].releaseBlock > block.number)
        require(balances[_from].sub(_value) >= lockBalances[_from].lockedAmount);

      res = (super.transferFrom(_from, _to, _value));

      if (_to == address(this)) {
        burnContractTokens();
      }
    }

    // The token contract should not hold its own tokens, allow anyont to burn its balance:
    function burnContractTokens() public {
      totalSupply = totalSupply.sub(balances[this]);
      balances[this] = 0;
      Burn(balances[this]);
    }

}
