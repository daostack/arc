pragma solidity ^0.4.4;


/*
A DAO is a Decentralized Collaborative Organization. 

It is associated with a Token contract and a Reputation contract.

Use it like this:
(NOTE: this is a bit clumsy and my change in the future)

    dco =  new DAO(tokenContract.address, reputationContract.address); 
    tokenContract.transferOwnership(dco.address)
    reputationContract.transferOwnership(dco.address)

*/
import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";
import "./proposals/Proposal.sol";

contract DAOInterface {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(string msg); 

    mapping (address => bool) registeredProposals;

    function executeProposal(address _proposal) returns (bool);

    function registerProposalToMintTokens(uint256 _amount, address _beneficary);

    function mintTokens(uint256 _amount, address _beneficary, address _tokenContract);
}
