pragma solidity ^0.4.11;

/*import "zeppelin-solidity/contracts/token/MintableToken.sol";*/ // ToDo, Build on zeppelin contrcat.
import "./MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title DAOToken, base on zeppelin contract.
 * @dev ERC20 comptible token. It is a mintable, lockable, burnable token.
 */

contract DAOToken is MintableToken {
    using SafeMath for uint;

    event TokenLock(address indexed user, uint value);
    event Burn(uint value);

    struct Lock {
      uint lockedAmount;
      uint releaseBlock;
    }

    // Locking mapping:
    mapping(address => Lock) lockBalances;

    function lock(uint _value, uint _releaseBlock) {
      // Sanity check:
      require(_value != 0);
      require(_value <= balances[msg.sender]);
      require(_releaseBlock > block.number);

      // Check if user has locked funds, and verify the change is legit:
      if (lockBalances[msg.sender].releaseBlock > block.number) {
        require(_value >= lockBalances[msg.sender].lockedAmount);
        require(_releaseBlock >= lockBalances[msg.sender].releaseBlock);
      }

      lockBalances[msg.sender].lockedAmount = _value;
      lockBalances[msg.sender].releaseBlock = _releaseBlock;
      TokenLock(msg.sender, _value);
    }

    // Rewriting the function to check for locking and burn tokens of the contract itself:
    function transfer(address _to, uint _value) {
      // Check for locking:
      if (lockBalances[msg.sender].releaseBlock > block.number)
        require(balances[msg.sender].sub(_value) >= lockBalances[msg.sender].lockedAmount);

      super.transfer(_to, _value);

      if (_to == address(this))
        burnContractToken();
    }

    // Rewriting the function to check for locking and burn tokens of the contract itself:
    function transferFrom(address _from, address _to, uint _value) {
      // Check for locking:
      if (lockBalances[_from].releaseBlock > block.number)
        require(balances[_from].sub(_value) >= lockBalances[_from].lockedAmount);

      super.transferFrom(_from, _to, _value);

      if (_to == address(this))
        burnContractToken();
    }

    // The token contract should not hold its own tokens, allow anyont to burn its balance:
    function burnContractToken() {
      totalSupply = totalSupply.sub(balances[this]);
      Burn(balances[this]);
      balances[this] = 0;
    }

}
