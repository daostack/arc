pragma solidity ^0.4.4;

import "./Proposal.sol";
import "../DAOInterface.sol";
import "../Reputation.sol";


contract ProposalMintReputation is Proposal {
	/* a proposal to decide to mint a number of new reputation to a given beneficary 

    The constructor takes the following arguments:

        _dao: 
        _amount: the amount of tokens to assign
        _beneficary: the beneficary of the action

    The proposal can be executed in case:
        - more than 50% of reputation holders in the reputation contract 
          have voted 'y' on the proposal
        - the reputationContract has the rights to mint new tokens

	*/

    bool public executed;
    DAOInterface public dao;
    uint256 public amount;
    address public beneficary;


    function ProposalMintReputation( 
        address _dao,
        uint256 _amount,
        address _beneficary
        )  Proposal (DAOInterface(_dao).reputationContract()) {
        dao = DAOInterface(_dao);
        amount = _amount;
        beneficary = _beneficary;
    }


    function executeDecision() returns (bool) {
        /*
            This function expects to be called from the dao (by calling dao.executeProposal(proposal))
        */
        if (winningChoice() == 1) {
            dao.mintReputation(amount, beneficary);
            ProposalExecuted('ProposalMintReputation executed');
            return true;
        } 
        return false;
    }   
}