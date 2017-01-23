pragma solidity ^0.4.4;

import "./Proposal.sol";
import "../DAOInterface.sol";
import "../Reputation.sol";


contract ProposalRecipe  {

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(address indexed proposaladdress);

    DAOInterface public dao; 
    // proposals that are allowed to be executed
    mapping (address => bool) registeredProposals;


    modifier onlyRegisteredProposal() { 
        // this function can only be executed by a registered contract
        if (registeredProposals[msg.sender])
            _;
    } 

    /*
    
	function createProposal(DAOInterface _dao) returns (Proposal);
	 {
		// create a proposal and register at the DAO 
		Proposal proposal = new Proposal(_dao);
		_dao.registerProposal(proposal);
		return proposal;

	}
	*/
}