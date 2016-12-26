pragma solidity ^0.4.4;
/*
    Implements a simple static reputation storage
    in which reputation is managed by the owner of the contract
*/

import "./zeppelin-solidity/Ownable.sol";
import "./zeppelin-solidity/SafeMath.sol";

contract Reputation is Ownable, SafeMath {

    mapping (address => uint256) reputation;
    uint256 public totalReputation;

    function Reputation() {
        reputation[msg.sender] = 1;
        totalReputation = 1;
    } 

    function reputationOf(address _owner) constant returns (uint256 balance) {
        return reputation[_owner];
    }

	function setReputation(address _account, uint256 _amount) onlyOwner {
        totalReputation = safeAdd( safeSub(totalReputation, reputation[_account]),
                                  _amount );
		reputation[_account] = _amount;
	}
}
