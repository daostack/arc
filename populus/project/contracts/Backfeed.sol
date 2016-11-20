pragma solidity ^0.4.4;

import "./Owned.sol";
import "./Reputation.sol";
import "./Token.sol";

contract BackfeedDCO is Owned {
	string public name;
	Token public tokenContract;
	Reputation public reputationContract;

	function BackfeedDCO(
		Token tokenContractAddress,
		Reputation reputationContractAddress
		) {
		tokenContract = tokenContractAddress;
		reputationContract = reputationContractAddress;
	}
}
