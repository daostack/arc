pragma solidity ^0.4.4;
/*
    Implements a simple static reputation storage
    in which reputation is managed by the owner of the contract
*/

import "./zeppelin-solidity/Ownable.sol";
import "./zeppelin-solidity/SafeMath.sol";

contract Reputation is Ownable, SafeMath {

    mapping (address => uint256) balances;
    uint256 public totalSupply;

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

    function setReputation(uint256 _amount, address _to) onlyOwner returns (bool) {
        // set the balacne of _to to _amount
        totalSupply = safeAdd(safeSub(totalSupply, balances[_to]),_amount );
        balances[_to] = _amount;
        return true;
    }
}
