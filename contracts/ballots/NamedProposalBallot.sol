pragma solidity ^0.4.4;

import "../Reputation.sol";
import "./Ballot.sol";


contract NamedProposalBallot is Ballot {

    // This is a type for a single proposal.
    event ProposalAdded(bytes32 name);

    struct Proposal
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // amount of accumulated reputation
    }

    // mapping address to the proposal that they voted
    mapping(address => bytes32) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    
    /// Create a new ballot to choose one of `proposalNames`.
    function NamedProposalBallot(
        Reputation _reputationContractAddress,
        bytes32[] proposalNames
        ) 
        Ballot (_reputationContractAddress) {
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
            ProposalAdded(proposalNames[i]);
        }
    }

    /// Give your vote to proposal `proposals[proposal].name`.
    function vote(uint _proposal) {
        registerVote(_proposal, msg.sender);
    }

    function registerVote(uint _proposal, address _voter) {
        if (voters[_voter] != 0) {
            throw;
        }
        voters[_voter] = proposals[_proposal].name;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all changes.
        proposals[_proposal].voteCount += reputationContract.reputationOf(_voter);

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
}
