pragma solidity ^0.4.4;
/*
    A Proposal defines a number of choices that can be voted for +
    and a mechanism to decide which proposal has won.

    The present contract has two choices: "y" and "n"
    the winning choice is simply the choice that has more than 50% of the votes.

*/

import "../Reputation.sol";
import "../DAOInterface.sol";


contract Proposal {

    DAOInterface public dao;
    Reputation public reputationContract;

    event ProposalExecuted(string msg);

    struct Choice
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // amount of accumulated reputation
    }

    // mapping address to the name of the choice that they voted
    mapping(address => bytes32) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Choice[] public choices;
    
    function Proposal(Reputation _reputationContractAddress) {
        reputationContract = _reputationContractAddress; 
        // default 'yay/nay' choice
        choices.push(Choice({
            name: 'n', 
            voteCount: 0
        }));
        choices.push(Choice({
            name: 'y', 
            voteCount: 0
        }));
 
    }

    // vote for a certain choice
    // choices are identified by their index in the array of choices
    function vote(uint _choice) {

        if (voters[msg.sender] != 0) {
            // voter has already voted
            throw;
        }
        // // register the vote by name, not by index, because index can be 0, which is
        // // also the default value for uninitilized variables
        voters[msg.sender] = choices[_choice].name;

        // If `choice` is out of the range of the array,
        // this will throw automatically and revert all changes.
        // TODO: use safeAdd
        choices[_choice].voteCount += reputationContract.reputationOf(msg.sender);

    }

    /// @dev Computes the winning choice taking all
    /// previous votes into account.
    function winningChoice() constant
            returns (uint)
    {
        uint winningChoice;
        uint winningVoteCount = 0;
        uint totalReputation = reputationContract.totalSupply();
        for (uint p = 0; p < choices.length; p++) {
            if (choices[p].voteCount > winningVoteCount) {
                winningVoteCount = choices[p].voteCount;
                winningChoice = p;
            }
        }
        // the winning proposal should have at least half ot he totalReputation
        if (totalReputation < winningVoteCount * 2) {
            return winningChoice;
        }
        return 0;
    }
}
