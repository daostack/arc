pragma solidity ^0.4.4;

import "./Reputation.sol";
import "./Token.sol";
import "./MintableToken.sol";


contract DAOInterface {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(string msg); 

    mapping (address => bool) registeredProposals;

    function executeProposal(address _proposal) returns (bool);

    function registerProposal(address proposal); 

    function registerRecipe(address _recipe); 

    function unregisterRecipe(address _recipe);

    function mintTokens(uint256 _amount, address _beneficary);

    function mintReputation(uint256 _amount, address _beneficary);
}
