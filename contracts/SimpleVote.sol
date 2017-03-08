pragma solidity ^0.4.7;
import "./controller/Reputation.sol";
import "./SimpleVoteInterface.sol";

contract SimpleVote is SafeMath, SimpleVoteInterface {
    Reputation reputationSystem;
    address    owner;

    struct Votes {
        uint yes;
        uint no;
        mapping(address=>bool) voted;

        bool opened;
        bool closed;
    }

    function SimpleVote() {}

    mapping(bytes32=>Votes) proposals;
    event NewProposal( bytes32 _proposalId );
    event VoteProposal( address _voter, bytes32 _proposalId, bool _yes, uint _reputation );
    event CloseProposal( bytes32 _proposalId );

    function uniqueId( bytes32 proposalId ) constant returns (bytes32) {
        return sha3(msg.sender, proposalId);
    }

    function setOwner( address _owner ) returns(bool){
        if(owner != address(0)) throw;
        owner = _owner;
    }

    function setReputationSystem( Reputation _reputationSystem ) {
        if( msg.sender != owner ) throw;
        reputationSystem = _reputationSystem;
    }

    function closeProposal( bytes32 proposalId ) returns(bool) {
        if( msg.sender != owner ) throw;
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];

        Votes memory emptyVotes;
        proposals[id] = emptyVotes; // cannot call delete

        CloseProposal(id);

        return true;
    }

    function newProposal( bytes32 proposalId ) returns(bool) {
        if( msg.sender != owner ) throw;
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];
        if( votes.opened || votes.closed ) return false;

        votes.opened = true;

        NewProposal(id);

        return true;
    }

    function voteProposal( bytes32 proposalId, bool yes, address voter ) returns(bool) {
        if( msg.sender != owner ) throw;
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];
        if( votes.closed || ! votes.opened ) return false;
        if( votes.voted[voter] ) return false;

        uint reputation = reputationSystem.reputationOf(voter);
        uint totalReputation = reputationSystem.totalSupply();

        if( yes ) {
             votes.yes = safeAdd(votes.yes, reputation);
        }
        else {
             votes.no = safeAdd(votes.no, reputation);
        }

        if( ( votes.yes > totalReputation / 2 ) || (votes.no > totalReputation / 2  ) ) {
            votes.closed = true;
        }

        VoteProposal( voter, id, yes, reputation );

        return true;
    }

    function voteResults( bytes32 proposalId ) constant returns(bool) {
        if( msg.sender != owner ) throw;
        bytes32 id = uniqueId(proposalId);

        Votes votes = proposals[id];
        if( ( votes.yes > votes.no ) && votes.closed ) return true;
        else return false;
    }

    function voteStatus( bytes32 proposalId ) constant returns(uint[4]) {
        bytes32 id = uniqueId(proposalId);

        uint yes = proposals[id].yes;
        uint no = proposals[id].no;
        uint opened = proposals[id].opened ? 1 : 0;
        uint closed = proposals[id].closed ? 1 : 0;

        return [yes, no, opened, closed];
        return [uint(0),1,2,3];
    }
}
