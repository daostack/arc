pragma solidity ^0.4.4;
/*
    A Proposal defines a number of proposals that can be voted for +
    a way to decide which proposal has won.

    The present contract has two proposals "y" and "n"
    the winning proposal is simply a proposal that has more than 50% of the votes.

*/

import "../Reputation.sol";
import "../DAOInterface.sol";
import "../zeppelin-solidity/Ownable.sol";


contract Proposal is Ownable {

    DAOInterface public dao;
    Reputation public reputationContract;

    event ProposalExecuted(string msg);

    struct Choice
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // amount of accumulated reputation
    }

    // mapping address to the name of the proposal that they voted
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

    function executeDecision() returns (bool) {
        // do something with the winning proposal, return true if executed, false if not
    }

    // vote for a certain proposal
    // choices are identified by their index in the array of choices
    function vote(uint _choice) {

        if (voters[msg.sender] != 0) {
            // voter has already voted
            throw;
        }
        // // register the vote by name, not by index, because index can be 0, which is
        // // also the default value for uninitilized variables
        voters[msg.sender] = choices[_choice].name;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all changes.
        // TODO: use safeAdd
        choices[_choice].voteCount += reputationContract.reputationOf(msg.sender);

    }

    /// @dev Computes the winning proposal taking all
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
