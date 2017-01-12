pragma solidity ^0.4.4;

/* https://github.com/OpenZeppelin/zeppelin-solidity/blob/eb41a81faac5fcf865608cd549d7e19579ec601a/contracts/Ownable.sol */

/*
 * Ownable
 *
 * Base contract with an owner.
 * Provides onlyOwner modifier, which prevents function from running if it is called by anyone other than the owner.
 */
contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() { 
    if (msg.sender == owner)
      _;
  }

  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) owner = newOwner;
  }

}
