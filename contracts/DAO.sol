pragma solidity ^0.4.4;

import "./zeppelin-solidity/Ownable.sol";
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./proposals/Proposal.sol";
import "./proposals/ProposalMintTokens.sol";
import "./proposals/ProposalMintReputation.sol";

/*
A DAO is a Decentralized Collaborative Organization. 

It is associated with a Token contract and a Reputation contract.

Create a DAO like this (NOTE: this is a bit clumsy and my change in the future)

    dco =  new DAO(tokenContract.address, reputationContract.address); 
    tokenContract.transferOwnership(dco.address)
    reputationContract.transferOwnership(dco.address)

*/

contract DAO {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(string msg); 
    event PrintString(string msg);
    event PrintAddress(string msg);

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

    function mintTokens(uint256 _amount, address _beneficary) 
        onlyRegisteredProposal {
        tokenContract.mint(_amount, _beneficary); 
    }

    function mintReputation(uint256 _amount, address _beneficary) 
        onlyRegisteredProposal {
        reputationContract.mint(_amount, _beneficary); 
    }

    function upgrade(address _newDAO) {
        tokenContract.transferOwnership(_newDAO);
        reputationContract.transferOwnership(_newDAO);
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
        ProposalMintTokens proposal = new ProposalMintTokens(this, _amount, _beneficary);
        registeredProposals[proposal] = true;
        ProposalCreated(proposal);
    }

    function registerProposalMintReputation(uint256 _amount, address _beneficary) {
        ProposalMintReputation proposal = new ProposalMintReputation(this, _amount, _beneficary);
        registeredProposals[proposal] = true;
        ProposalCreated(proposal);
        PrintString('registerd proposal at');
        // PrintAddress(proposal);
    }

}
