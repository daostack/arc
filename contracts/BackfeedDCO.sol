pragma solidity ^0.4.4;

import "./Ownable.sol";
import "./Reputation.sol";
import "./Token.sol";

contract BackfeedDCO is Ownable {
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
