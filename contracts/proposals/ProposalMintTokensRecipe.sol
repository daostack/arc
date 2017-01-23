pragma solidity ^0.4.4;

import "./ProposalMintTokens.sol";
import "./ProposalRecipe.sol";
import "../DAOInterface.sol";


contract ProposalMintTokensRecipe is ProposalRecipe {

    function ProposalMintTokensRecipe(DAOInterface _dao) {
    	dao = _dao;
    }

	function createProposal(uint256 _amount, address _benificary) returns (ProposalMintTokens) {
		/* create a proposal and register at the DAO */
		ProposalMintTokens proposal = new ProposalMintTokens(dao, _amount, _benificary);
        registeredProposals[proposal] = true;
		ProposalCreated(proposal);
		return proposal;
	}

	function executeProposal(ProposalMintTokens _proposal) returns (bool)  {
        if (registeredProposals[_proposal] && _proposal.winningChoice() == 1) {
            dao.mintTokens(_proposal.amount(), _proposal.beneficary());
            ProposalExecuted(_proposal);
            return true;
        } 
        return false;
	}
           
}