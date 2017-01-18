pragma solidity ^0.4.4;

import "./zeppelin-solidity/Ownable.sol";
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./proposals/Proposal.sol";
import "./proposals/ProposalMintTokens.sol";

/*
A DAO is a Decentralized Collaborative Organization. 

It is associated with a Token contract and a Reputation contract.

Create a DAO like this (NOTE: this is a bit clumsy and my change in the future)

    dco =  new DAO(tokenContract.address, reputationContract.address); 
    tokenContract.transferOwnership(dco.address)
    reputationContract.transferOwnership(dco.address)

*/

contract DAO is Ownable {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(string msg); 

    mapping (address => bool) registeredProposals;
    modifier onlyRegisteredProposal() { 
        // this function can only be executed by a registered contract
        if (registeredProposals[msg.sender])
            _;
    }

    // the creator of the DAO must be owner of the token contract
    function DAO(
        Reputation _reputationContract,
        MintableToken _tokenContract
        ) {
        reputationContract = _reputationContract;
        tokenContract = _tokenContract;

    }

    function executeProposal(address _proposal) returns (bool) {
        /* execute the winning proposal in a proposal */
        if (!registeredProposals[_proposal]) {
            ProposalExecuted('execution failed because proposal is not registered');
            return false; 
        }
        Proposal proposal = Proposal(_proposal);
        if (!proposal.executeDecision()) {
            ProposalExecuted('execution failed');
            return false;
        }
        ProposalExecuted('proposal executed');
        return true;
    }

    function registerProposalMintTokens(uint256 _amount, address _beneficary) {
        // anybody can register a proposal. Should we protect this? Only rep holders?
        ProposalMintTokens proposal = new ProposalMintTokens(this, _amount, _beneficary);
        registeredProposals[proposal] = true;
        ProposalCreated(proposal);
    }

    function mintTokens(uint256 _amount, address _beneficary, address _tokenContract ) 
        onlyRegisteredProposal {
        MintableToken(_tokenContract).mint(_amount, _beneficary); 
    }
}
