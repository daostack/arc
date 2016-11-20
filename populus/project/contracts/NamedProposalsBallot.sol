pragma solidity ^0.4.4;
/*
*/

import "./Reputation.sol";
import "./Ballot.sol";


contract NamedProposalBallot is Ballot {

    Reputation public reputationContract;

    // This is a type for a single proposal.
    struct Proposal
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // mapping address to the proposal that they voted
    mapping(address => bytes32) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// Create a new ballot to choose one of `proposalNames`.
    function NamedProposalBallot(
        Reputation reputationContractAddress,
        bytes32[] proposalNames) 
        Ballot (reputationContractAddress) {
        reputationContract = reputationContractAddress;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    /// Give your vote to proposal `proposals[proposal].name`.
    function vote(uint proposal) {
        if (voters[msg.sender] != 0)
            throw;
        
        voters[msg.sender] = proposals[proposal].name;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += reputationContract.reputationOf(msg.sender);
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant
            returns (uint winningProposal)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
    }

    function executeWinningProposal() {
        // do something with the winning proposal

    }
}
