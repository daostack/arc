pragma solidity ^0.4.4;

import "./zeppelin-solidity/Ownable.sol";
import "./Reputation.sol";
import "./MintableToken.sol";
import "./proposals/Proposal.sol";

/*
A DAO is a template for a Decentralized Autonous Organization. 

    It controls a Token contract and controls - and is controlled by - a reputation contract

    Decisions are made by voting on Proposals.

    Proposals can be added by Recipes.

*/

contract DAO is Ownable {
    MintableToken public tokenContract;
    Reputation public reputationContract;

    event ProposalCreated(address indexed proposaladdress); 
    event ProposalExecuted(string msg); 

    // proposals that are allowed to be executed
    mapping (address => bool) registeredProposals;

    // recipes that are allowed to add proposals
    // TODO: make this an array, so it can be queried.
    mapping (address => bool) registeredRecipes;

    modifier onlyRegisteredProposal() { 
        // this function can only be executed by a registered contract
        if (registeredProposals[msg.sender])
            _;
    }

    modifier onlyRegisteredRecipe() {
        if (registeredRecipes[msg.sender])
            _;
    }

    modifier onlyOwnerOrRegisteredRecipe() {
        if (msg.sender == owner || registeredRecipes[msg.sender])
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

    function registerProposal(address _proposal) onlyRegisteredRecipe {
        /* register a proposal.

        Only registered recipes can add a proposal
        */
        registeredProposals[_proposal] = true;
    }

    function registerRecipe(address _recipe) onlyOwnerOrRegisteredRecipe {
        /* register a Recipe 

        only the owner, or other recipes, can register a new recipe.
        the DAO can be made to be controlled only by itself by settings 
        the ownership of the DAO to its own address.
        */
        registeredRecipes[_recipe] = true;
    }

    function unregisterRecipe(address _recipe) onlyOwnerOrRegisteredRecipe {
        /*  remove a recipe from the list of allowed recipes

        only the owner, or other recipes, can register a new recipe.
        the DAO can be made to be controlled only by itself by settings 
        the ownership of the DAO to its own address.
        */
        registeredRecipes[_recipe] = false;
    }

}
