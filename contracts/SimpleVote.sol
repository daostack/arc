pragma solidity ^0.4.7;


import "./controller/Reputation.sol";
import "./SimpleVoteInterface.sol";
import "zeppelin/contracts/ownership/Ownable.sol";


contract SimpleVote is SafeMath, SimpleVoteInterface {

    Reputation reputationSystem;
    address owner;

    modifier onlyOwner() {
        if (msg.sender != owner) {
          throw;
        }
        _;
    }
    struct Votes {
        uint yes; // total 'yes' votes
        uint no; // total 'no' votes
        mapping(address=>bool) voted; // people in this list have already voted
        // XXX: 'opened' at the moment is not really used (it is always true)
        bool opened; // if the votes are 'opened' 
        bool closed; // voting is closed
    }

    function SimpleVote() {}

    mapping(bytes32=>Votes) proposals;
    event NewProposal( bytes32 _proposalId );
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation );
    event CloseProposal( bytes32 _proposalId );

   function setOwner(address newOwner) returns (bool) {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }

    function uniqueId(bytes32 proposalId) constant returns (bytes32) {
        return sha3(proposalId);
    }

    function setReputationSystem(Reputation _reputationSystem) onlyOwner {
        // do we really need to be able to change this?
        reputationSystem = _reputationSystem;
    }

    function closeProposal(bytes32 proposalId) onlyOwner returns(bool) {
        // this function presumably is to free memory
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];

        Votes memory emptyVotes;
        proposals[id] = emptyVotes; // cannot call delete

        CloseProposal(id);

        return true;
    }

    function newProposal( bytes32 proposalId ) onlyOwner returns(bool) {
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];
        if( votes.opened || votes.closed ) return false;

        votes.opened = true;

        NewProposal(id);

        return true;
    }

    function voteProposal(bytes32 proposalId, bool yes, address voter) onlyOwner returns(bool) {
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];
        if( votes.closed || ! votes.opened ) return false;
        if( votes.voted[voter] ) return false;

        uint reputation = reputationSystem.reputationOf(voter);
        uint totalReputation = reputationSystem.totalSupply();

        if (yes) {
            votes.yes = safeAdd(votes.yes, reputation);
        } else {
            votes.no = safeAdd(votes.no, reputation);
        }

        // this is the actual voting rule: 
        // the vote is closed if more than half of the voters voted yes, or more than 
        // half of the voters voted no.
        if( (votes.yes > totalReputation / 2) || (votes.no > totalReputation / 2  ) ) {
            votes.closed = true;
        }

        VoteProposal(voter, id, yes, reputation);

        return true;
    }

    // returns result of the vote: 
    //      true if the proposal passed
    //      false if the proposal has not passed (yet)
    function voteResults(bytes32 proposalId) constant onlyOwner returns(bool) {
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];

        if ((votes.yes > votes.no) && votes.closed) {
            return true;
        } else {
            return false;
        }
    }

    function voteStatus(bytes32 proposalId) constant returns(uint[4]) {
        bytes32 id = uniqueId(proposalId);

        uint yes = proposals[id].yes;
        uint no = proposals[id].no;
        uint opened = proposals[id].opened ? 1 : 0;
        uint closed = proposals[id].closed ? 1 : 0;

        return [yes, no, opened, closed];
    }
}
