pragma solidity ^0.4.4;

import "./ProposalMintReputation.sol";
import "../DAOInterface.sol";


contract ProposalMintReputationRecipe {

    event ProposalCreated(address indexed proposaladdress); 

	function createProposal(DAOInterface _dao, uint256 _amount, address _benificary) returns (ProposalMintReputation) {
		/* create a proposal and register at the DAO */
		ProposalMintReputation proposal = new ProposalMintReputation(_dao, _amount, _benificary);
		_dao.registerProposal(proposal);
		ProposalCreated(proposal);
		return proposal;
	}
}