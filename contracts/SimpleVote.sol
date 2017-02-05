pragma solidity ^0.4.7;
import "./controller/Reputation.sol";
import "SimpleVoteInterface.sol";

contract SimpleVote is SafeMath, SimpleVoteInterface {
    Reputation reputationSystem;
    
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
    event VoteProposal( bytes32 _proposalId, bool _yes );
    event CloseProposal( bytes32 _proposalId );
    
    function uniqueId( bytes32 proposalId ) constant returns (bytes32) {
        return sha3(msg.sender, proposalId);
    }
    
    function setReputationSystem( Reputation _reputationSystem ) {
        reputationSystem = _reputationSystem;
    }     
    
    function closeProposal( bytes32 proposalId ) returns(bool) {
        bytes32 id = uniqueId(proposalId);
    
        Votes votes = proposals[id];
        
        Votes memory emptyVotes;
        proposals[id] = emptyVotes; // cannot call delete
        
        CloseProposal(id);         
    }
    
    function newProposal( bytes32 proposalId ) returns(bool) {
        bytes32 id = uniqueId(proposalId);
        
        Votes votes = proposals[id];
        if( votes.opened || votes.closed ) return false;
                
        votes.opened = true;
        
        NewProposal(id);
        
        return true;
    }
    
    function voteProposal( bytes32 proposalId, bool yes ) returns(bool) {
        bytes32 id = uniqueId(proposalId);
        
        Votes votes = proposals[id];    
        if( votes.closed || ! votes.opened ) return false;
        if( votes.voted[msg.sender] ) return false;
        
        uint reputation = reputationSystem.reputationOf(msg.sender);
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
        
        VoteProposal( id, yes );
        
        return true;
    }
        
    function voteResults( bytes32 proposalId ) constant returns(bool) {
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
