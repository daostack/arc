pragma solidity ^0.4.4;
/*
    Implements a simple static reputation storage
    in which reputation is managed by the owner of the contract
*/

import "./Owned.sol";

contract Reputation is Owned {

    mapping (address => uint256) reputation;
    uint256 totalReputation;

    function Reputation() {
        reputation[msg.sender] = 1;
        totalReputation = 1;
    } 

    function reputationOf(address _owner) constant returns (uint256 balance) {
        return reputation[_owner];
    }

	function set_reputation(address _account, uint256 _amount) onlyOwner {
        totalReputation = totalReputation - reputation[_account] + _amount;
		reputation[_account] = _amount;
	}
}
