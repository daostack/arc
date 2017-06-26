pragma solidity ^0.4.11;
/*
    Implements a simple static reputation storage
    in which reputation is managed by the owner of the contract
*/

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/SafeMath.sol";


contract Reputation is Ownable {
    using SafeMath for uint;

    mapping (address => uint256) balances;
    uint256 public totalSupply;
    uint public decimals = 18;

    event Mint(address indexed to, int256 value);

    function Reputation() {
        balances[msg.sender] = 0;
        totalSupply  = 0;
    }

    function reputationOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function mint(int256 _amount, address _to) onlyOwner returns (bool) {
        // create new tokens and add them to the given account
        uint absAmount; // allow to reduce reputation also for non owner
        if( _amount >= 0 ) {
            absAmount = uint(_amount);
            totalSupply = totalSupply.add(absAmount);
            balances[_to] = balances[_to].add(absAmount);
        }
        else {
            absAmount = uint((-1)*_amount);
            totalSupply = totalSupply.sub(absAmount);
            balances[_to] = balances[_to].sub(absAmount);
        }
        Mint(_to, _amount);
        return true;
    }

    function setReputation(uint256 _amount, address _to) onlyOwner returns (bool) {
        // set the balacne of _to to _amount
        totalSupply = (totalSupply.sub(balances[_to])).add(_amount);
        balances[_to] = _amount;
        return true;
    }
}
