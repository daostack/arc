pragma solidity ^0.4.4;

import "./ProposalMintReputation.sol";
import "./ProposalRecipe.sol";
import "../DAOInterface.sol";


contract ProposalMintReputationRecipe  is ProposalRecipe  {

    function ProposalMintReputationRecipe(DAOInterface _dao) {
        dao = _dao;
    }

    function createProposal(uint256 _amount, address _benificary) returns (ProposalMintReputation) {
        /* create a proposal and register at the DAO */
        ProposalMintReputation proposal = new ProposalMintReputation(dao, _amount, _benificary);
        registeredProposals[proposal] = true;
        ProposalCreated(proposal);
        return proposal;
    }

    function executeProposal(ProposalMintReputation _proposal) returns (bool)  {
        if (registeredProposals[_proposal] && _proposal.winningChoice() == 1) {
            dao.mintReputation(_proposal.amount(), _proposal.beneficary());
            ProposalExecuted(_proposal);
            return true;
        } 
        return false;
    }
}