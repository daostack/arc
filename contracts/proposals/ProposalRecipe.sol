pragma solidity ^0.4.4;

import "./Proposal.sol";
import "../DAOInterface.sol";
import "../Reputation.sol";


contract ProposalRecipe  {

    event ProposalCreated(address indexed proposaladdress); 
    
	function createProposal(DAOInterface _dao) returns (Proposal);
	/* {
		// create a proposal and register at the DAO 
		Proposal proposal = new Proposal(_dao);
		_dao.registerProposal(proposal);
		return proposal;

	}
	*/
}