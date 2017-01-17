pragma solidity ^0.4.4;
/*
    A Ballot defines a number of proposals that can be voted for +
    a way to decide which proposal has won.

    The present contract has two proposals "y" and "n"
    the winning proposal is simply a proposal that has more than 50% of the votes.

*/

import "../Reputation.sol";
import "../zeppelin-solidity/Ownable.sol";


/// @title Voting
contract Ballot is Ownable {

    Reputation public reputationContract;

    event BallotExecuted(string msg);

    struct Proposal
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // amount of accumulated reputation
    }

    // mapping address to the index of the proposal that they voted
    mapping(address => bytes32) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    
    // map proposals to amount of votes
    // mapping (uint => uint) public voteCount;
    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot(Reputation _reputationContractAddress) Ownable() {
        reputationContract = _reputationContractAddress;
        proposals.push(Proposal({
                name: 'y', 
                voteCount: 0
            }));
        proposals.push(Proposal({
                name: 'n', 
                voteCount: 0
            }));
 
    }

    function executeWinningProposal() returns (bool) {
        // do something with the winning proposal, return true if executed, false if not
    }

    // vote for a certain proposal
    // proposals are identified by their index in the array of proposals
    function vote(uint _proposal) {

        if (voters[msg.sender] != 0) {
            // voter has already voted
            throw;
        }
        // register the vote by name, not by index, because index can be 0, which is
        // also the default value for uninitilized variables
        voters[msg.sender] = proposals[_proposal].name;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all changes.
        proposals[_proposal].voteCount += reputationContract.reputationOf(msg.sender);

    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant
            returns (uint)
    {
        uint winningProposal;
        uint winningVoteCount = 0;
        uint totalReputation = reputationContract.totalReputation();
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
        // the winning proposal should have at least half ot he totalReputation
        if (totalReputation < winningVoteCount * 2) {
            return winningProposal;
        }
        return 0;
    }
}
