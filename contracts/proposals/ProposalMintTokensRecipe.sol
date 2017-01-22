pragma solidity ^0.4.4;

import "./ProposalMintTokens.sol";
import "../DAOInterface.sol";


contract ProposalMintTokensRecipe {

    event ProposalCreated(address indexed proposaladdress); 

	function createProposal(DAOInterface _dao, uint256 _amount, address _benificary) returns (ProposalMintTokens) {
		/* create a proposal and register at the DAO */
		ProposalMintTokens proposal = new ProposalMintTokens(_dao, _amount, _benificary);
		_dao.registerProposal(proposal);
		ProposalCreated(proposal);
		return proposal;
	}
}