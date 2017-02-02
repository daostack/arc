pragma solidity ^0.4.7;
import "./controller/Reputation.sol";

contract SimpleVote is SafeMath {
    Reputation reputationSystem;
    
    struct Votes {
        uint yes;
        uint no;
        mapping(address=>bool) voted;
        
        bool opened;
        bool closed;
    }
            
    mapping(bytes32=>Votes) proposals;
    
    function setReputationSystem( Reputation _reputationSystem ) {
        reputationSystem = _reputationSystem;
    }     
    
    function closeProposal( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];
        
        Votes memory emptyVotes;
        proposals[proposalId] = emptyVotes; // cannot call delete 
    }
    
    function newProposal( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];
        if( votes.opened || votes.closed ) return false;
        votes.opened = true;
        
        return true;
    }
    
    function voteProposal( bytes32 proposalId, bool yes ) internal returns(bool) {
        Votes votes = proposals[proposalId];    
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
        
        return true;
    }
        
    function voteResults( bytes32 proposalId ) internal returns(bool) {
        Votes votes = proposals[proposalId];    
        if( ( votes.yes > votes.no ) && votes.closed ) return true;
        else return false;
    }


    function voteStatus( bytes32 proposalId ) constant internal returns(Votes) {
        return proposals[proposalId];
    }
    
        
    ////////////////////////////////////////////////////////////////////////////
    
    function propose( bytes32 _proposalId ) internal returns(bool) {
        if( ! newProposal( _proposalId ) ) throw;
        
        return true;
    }

    function vote( bytes32 _proposalId, bool _yes ) internal returns(bool) {
        if( ! voteProposal( _proposalId, _yes ) ) throw;
        
        return true;
    }
    
    
}
